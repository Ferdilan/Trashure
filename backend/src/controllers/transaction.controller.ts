import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';
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
    const { status, finalWeight, totalPrice, pickupDate } = req.body;
    // status = JADWAL_PICKUP, TRANSIT, VERIFIKASI, SELESAI, BATAL

    // Untuk demo MVP, tidak dilakukan validasi strict role.
    // Asumsinya Pengepul / Admin bisa update status ini.
    
    const updateData: any = {};
    if (status) updateData.status = status;
    if (finalWeight) updateData.finalWeight = parseFloat(finalWeight);
    if (totalPrice) updateData.totalPrice = parseFloat(totalPrice);
    if (pickupDate) updateData.pickupDate = new Date(pickupDate);
    if (status === 'SELESAI') updateData.completedAt = new Date();

    const transaction = await prisma.transaction.update({
      where: { id: id as string },
      data: updateData,
      include: { 
        listing: { include: { user: true } },
        pengepul: true
      }
    });

    if (status === 'SELESAI') {
      await prisma.listing.update({
        where: { id: transaction.listingId },
        data: { status: 'SELESAI' }
      });

      if (totalPrice) {
        const wallet = await prisma.wallet.findUnique({
          where: { userId: transaction.listing.userId }
        });
        
        // --- PLATFORM FEE LOGIC ---
        // Biaya layanan platform sebesar 5% dibebankan ke pemilik
        const platformFeePercentage = 0.05;
        const grossAmount = parseFloat(totalPrice);
        const platformFee = grossAmount * platformFeePercentage;
        const netAmount = grossAmount - platformFee;
        // --------------------------

        if (wallet) {
          await prisma.wallet.update({
            where: { userId: transaction.listing.userId },
            data: { balance: wallet.balance + netAmount }
          });
        } else {
          await prisma.wallet.create({
            data: {
              userId: transaction.listing.userId,
              balance: netAmount
            }
          });
        }
      }
    }

    // Notifications (Removed for Serverless)

    res.status(200).json({ status: 'success', data: transaction });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

const midtransClient = require('midtrans-client');

export const createPaymentToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { finalWeight, totalPrice } = req.body;

    const transaction = await prisma.transaction.findUnique({
      where: { id: id as string },
      include: { 
        pengepul: true,
        listing: { include: { user: true } }
      }
    });

    if (!transaction) {
      res.status(404).json({ status: 'error', message: 'Transaction not found' });
      return;
    }

    // Initialize Midtrans Snap
    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY || '',
      clientKey: process.env.MIDTRANS_CLIENT_KEY || ''
    });

    const parameter = {
      transaction_details: {
        order_id: `TRX-${transaction.id.substring(0, 8)}-${Date.now()}`,
        gross_amount: Math.round(totalPrice)
      },
      customer_details: {
        first_name: transaction.pengepul.name,
        email: transaction.pengepul.email || 'pengepul@trashure.com',
        phone: transaction.pengepul.phoneNumber || '08123456789'
      }
    };

    const snapToken = await snap.createTransaction(parameter);

    // Update berat akhir terlebih dahulu
    await prisma.transaction.update({
      where: { id: id as string },
      data: { finalWeight: parseFloat(finalWeight), totalPrice: parseFloat(totalPrice) }
    });

    res.status(200).json({ status: 'success', data: { token: snapToken.token } });
  } catch (error: any) {
    console.error('Error creating payment token:', error);
    res.status(500).json({ status: 'error', message: error.message || 'Failed to create payment token' });
  }
};
