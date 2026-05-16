import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';
import { getIo } from '../config/socket';

export const getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
    if (!dbUser) {
      res.status(404).json({ status: 'error', message: 'User not found in DB' });
      return;
    }

    // Ambil transaksi yang melibatkan user ini (entah sebagai pemilik atau pengepul)
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { pengepulId: dbUser.id },
          { listing: { userId: dbUser.id } }
        ]
      },
      include: {
        listing: { include: { category: true } },
        pengepul: { select: { name: true, phoneNumber: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.status(200).json({ status: 'success', data: transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

export const updateTransactionStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, finalWeight, totalPrice } = req.body;
    // status = JADWAL_PICKUP, TRANSIT, VERIFIKASI, SELESAI, BATAL

    // Untuk demo MVP, tidak dilakukan validasi strict role.
    // Asumsinya Pengepul / Admin bisa update status ini.
    
    const updateData: any = { status };
    if (finalWeight) updateData.finalWeight = parseFloat(finalWeight);
    if (totalPrice) updateData.totalPrice = parseFloat(totalPrice);
    if (status === 'SELESAI') updateData.completedAt = new Date();

    const transaction = await prisma.transaction.update({
      where: { id: id as string },
      data: updateData,
      include: { listing: { select: { userId: true, title: true } } }
    });

    if (status === 'SELESAI') {
      await prisma.listing.update({
        where: { id: transaction.listingId },
        data: { status: 'SELESAI' }
      });
    }

    // Notify Pemilik
    const io = getIo();
    io.to(transaction.listing.userId).emit('notification', {
      title: 'Status Pickup Berubah',
      body: `Status penjemputan untuk ${transaction.listing.title} sekarang: ${status}`,
      type: 'TRANSACTION_UPDATED'
    });

    res.status(200).json({ status: 'success', data: transaction });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};
