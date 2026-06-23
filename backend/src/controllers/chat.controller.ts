import { Request, Response } from 'express';
import prisma from '../config/database';

export const getMessagesByTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const transactionId = String(req.params.transactionId);
    const user = (req as any).user;

    if (!user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
    if (!dbUser) {
      res.status(404).json({ status: 'error', message: 'User not found in DB' });
      return;
    }

    // Pastikan user adalah salah satu pihak dalam transaksi
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { listing: true }
    });

    if (!transaction) {
      res.status(404).json({ status: 'error', message: 'Transaction not found' });
      return;
    }

    if (transaction.pengepulId !== dbUser.id && transaction.listing.userId !== dbUser.id) {
      res.status(403).json({ status: 'error', message: 'Forbidden: You are not part of this transaction' });
      return;
    }

    // Ambil histori pesan
    const messages = await prisma.message.findMany({
      where: { transactionId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } }
      }
    });

    res.status(200).json({ status: 'success', data: messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { transactionId, content } = req.body;
    const user = (req as any).user;

    if (!user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
    if (!dbUser) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { listing: true }
    });

    if (!transaction) {
      res.status(404).json({ status: 'error', message: 'Transaction not found' });
      return;
    }

    const receiverId = transaction.pengepulId === dbUser.id
      ? transaction.listing.userId
      : transaction.pengepulId;

    if (!receiverId) {
      res.status(400).json({ status: 'error', message: 'Receiver not found' });
      return;
    }

    const savedMessage = await prisma.message.create({
      data: {
        transactionId,
        senderId: dbUser.id,
        receiverId,
        content
      },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } }
      }
    });

    res.status(201).json({ status: 'success', data: savedMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};
