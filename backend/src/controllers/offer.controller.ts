import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';
import { getIo } from '../config/socket';
import { sendWhatsAppMessage } from '../services/whatsapp.service';

export const createOffer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
    if (!dbUser || dbUser.role !== 'PENGEPUL') {
      res.status(403).json({ status: 'error', message: 'Forbidden: Only Pengepul can create offers' });
      return;
    }

    const { listingId, pricePerKg, message, isDirectBuy } = req.body;

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { user: true }
    });

    if (!listing) {
      res.status(404).json({ status: 'error', message: 'Listing not found' });
      return;
    }

    if (isDirectBuy) {
      if (!listing.expectedPrice) {
        res.status(400).json({ status: 'error', message: 'Listing does not support direct buy because it has no expected price' });
        return;
      }

      const finalPrice = listing.expectedPrice;

      // Buat offer berstatus DITERIMA
      const offer = await prisma.offer.create({
        data: {
          listingId,
          pengepulId: dbUser.id,
          pricePerKg: finalPrice,
          message: message || 'Beli Langsung (Instant Deal)',
          status: 'DITERIMA'
        },
        include: { listing: { include: { user: true } }, pengepul: true }
      });

      // Update Listing to TRANSAKSI
      await prisma.listing.update({
        where: { id: listingId },
        data: { status: 'TRANSAKSI' }
      });

      // Buat Transaksi
      await prisma.transaction.create({
        data: {
          listingId,
          pengepulId: dbUser.id,
          status: 'JADWAL_PICKUP'
        }
      });

      // Notify Pemilik via Socket
      const io = getIo();
      io.to(listing.userId).emit('notification', {
        title: 'Pembelian Langsung',
        body: `${dbUser.name} menyetujui Beli Langsung untuk ${listing.title} seharga Rp ${finalPrice}/kg!`,
        type: 'TRANSACTION_UPDATED'
      });

      // Notify Pemilik via WhatsApp
      if (listing.user.phoneNumber) {
        await sendWhatsAppMessage(
          listing.user.phoneNumber,
          `*[Trashure]* Deal Langsung! Pengepul ${dbUser.name} telah menyetujui harga Beli Langsung untuk "${listing.title}" Anda seharga *Rp ${finalPrice}/kg*.\nSilakan hubungi Pengepul untuk berkoordinasi mengenai penjemputan.`
        );
      }

      // Notify Pengepul via WhatsApp
      if (dbUser.phoneNumber) {
        await sendWhatsAppMessage(
          dbUser.phoneNumber,
          `*[Trashure]* Pembelian Langsung Berhasil! Anda telah mengambil "${listing.title}" seharga *Rp ${finalPrice}/kg*.\nSilakan hubungi pemilik untuk mulai menjadwalkan penjemputan.`
        );
      }

      res.status(201).json({ status: 'success', data: offer });
      return;
    }

    // Alur Tawar Menawar Biasa (Tawaran Baru)
    const offer = await prisma.offer.create({
      data: {
        listingId,
        pengepulId: dbUser.id,
        pricePerKg: parseFloat(pricePerKg),
        message,
        status: 'MENUNGGU'
      },
      include: { listing: { include: { user: true } }, pengepul: true }
    });

    // Notify Pemilik via Socket
    const io = getIo();
    io.to(offer.listing.userId).emit('notification', {
      title: 'Penawaran Baru',
      body: `Pengepul menawar ${offer.listing.title} seharga Rp ${pricePerKg}/kg`,
      type: 'OFFER_CREATED'
    });

    // Notify Pemilik via WhatsApp
    if (offer.listing.user.phoneNumber) {
      await sendWhatsAppMessage(
        offer.listing.user.phoneNumber, 
        `*[Trashure]* Halo ${offer.listing.user.name}!\nAda penawaran baru masuk untuk sampah "${offer.listing.title}" Anda dari ${offer.pengepul.name} senilai *Rp ${pricePerKg}/kg*.\nSilakan buka aplikasi Trashure untuk menerima atau menolaknya.`
      );
    }

    res.status(201).json({ status: 'success', data: offer });
  } catch (error) {
    console.error('Error creating offer:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

export const updateOfferStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { status } = req.body; // DITERIMA atau DITOLAK

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user!.id } });
    
    // Pastikan user adalah pemilik listing
    const offer = await prisma.offer.findUnique({
      where: { id: id as string },
      include: { listing: { include: { user: true } }, pengepul: true }
    });

    if (!offer) {
      res.status(404).json({ status: 'error', message: 'Offer not found' });
      return;
    }

    if (offer.listing.userId !== dbUser?.id) {
      res.status(403).json({ status: 'error', message: 'Forbidden: You do not own this listing' });
      return;
    }

    // Update Offer
    const updatedOffer = await prisma.offer.update({
      where: { id: id as string },
      data: { status }
    });

    // Jika DITERIMA, buat transaksi baru dan ubah status listing
    if (status === 'DITERIMA') {
      await prisma.listing.update({
        where: { id: offer.listingId },
        data: { status: 'TRANSAKSI' }
      });

      await prisma.transaction.create({
        data: {
          listingId: offer.listingId,
          pengepulId: offer.pengepulId,
          status: 'JADWAL_PICKUP'
        }
      });
    }

    // Notify Pengepul via Socket
    const io = getIo();
    io.to(offer.pengepulId).emit('notification', {
      title: `Penawaran ${status}`,
      body: `Penawaran Anda untuk ${offer.listing.title} telah ${status.toLowerCase()}.`,
      type: 'OFFER_UPDATED'
    });

    // Notify Pengepul via WhatsApp
    if (offer.pengepul.phoneNumber) {
      const waMessage = status === 'DITERIMA' 
        ? `*[Trashure]* Selamat ${offer.pengepul.name}!\nPenawaran Anda untuk "${offer.listing.title}" telah *DITERIMA* oleh pemilik.\nSilakan buka aplikasi untuk melihat nomor kontak pemilik dan menyepakati jadwal penjemputan.`
        : `*[Trashure]* Halo ${offer.pengepul.name},\nMohon maaf, penawaran Anda untuk "${offer.listing.title}" telah *DITOLAK* oleh pemilik.`;
      
      await sendWhatsAppMessage(offer.pengepul.phoneNumber, waMessage);
    }

    res.status(200).json({ status: 'success', data: updatedOffer });
  } catch (error) {
    console.error('Error updating offer:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};
