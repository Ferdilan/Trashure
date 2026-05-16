import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { transactionId } = req.params;
    
    const messages = await prisma.message.findMany({
      where: { transactionId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, name: true, role: true } }
      }
    });

    res.status(200).json({ status: 'success', data: messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};
