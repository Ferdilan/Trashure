import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';
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

      // Notify Pemilik via Socket (Removed)
      // Notify Pemilik via WhatsApp (Removed)
      // Notify Pengepul via WhatsApp (Removed)

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

    // Notifications (Removed for Serverless)

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

    // Notifications (Removed for Serverless)

    res.status(200).json({ status: 'success', data: updatedOffer });
  } catch (error) {
    console.error('Error updating offer:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};
