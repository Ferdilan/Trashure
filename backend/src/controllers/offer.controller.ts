import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';
import { getIo } from '../config/socket';

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

    const { listingId, pricePerKg, message } = req.body;

    const offer = await prisma.offer.create({
      data: {
        listingId,
        pengepulId: dbUser.id,
        pricePerKg: parseFloat(pricePerKg),
        message,
        status: 'MENUNGGU'
      },
      include: { listing: { select: { userId: true, title: true } } }
    });

    // Notify Pemilik
    const io = getIo();
    io.to(offer.listing.userId).emit('notification', {
      title: 'Penawaran Baru',
      body: `Pengepul menawar ${offer.listing.title} seharga Rp ${pricePerKg}/kg`,
      type: 'OFFER_CREATED'
    });

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
      include: { listing: true }
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
        data: { status: 'PENAWARAN' } // Atau 'TRANSAKSI'
      });

      await prisma.transaction.create({
        data: {
          listingId: offer.listingId,
          pengepulId: offer.pengepulId,
          status: 'DEAL'
        }
      });
    }

    // Notify Pengepul
    const io = getIo();
    io.to(offer.pengepulId).emit('notification', {
      title: `Penawaran ${status}`,
      body: `Penawaran Anda untuk ${offer.listing.title} telah ${status.toLowerCase()}.`,
      type: 'OFFER_UPDATED'
    });

    res.status(200).json({ status: 'success', data: updatedOffer });
  } catch (error) {
    console.error('Error updating offer:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};
