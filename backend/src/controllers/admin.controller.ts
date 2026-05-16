import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

// Middleware or explicit check for Admin Role
const checkAdmin = async (req: AuthRequest, res: Response): Promise<boolean> => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ status: 'error', message: 'Unauthorized' });
    return false;
  }
  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser || dbUser.role !== 'ADMIN') {
    res.status(403).json({ status: 'error', message: 'Forbidden: Admin only' });
    return false;
  }
  return true;
};

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!(await checkAdmin(req, res))) return;

  try {
    const totalUsers = await prisma.user.count();
    const totalTransactions = await prisma.transaction.count();
    
    // Calculate total volume (sum of finalWeight from completed transactions)
    const completedTransactions = await prisma.transaction.findMany({
      where: { status: 'SELESAI' },
      select: { finalWeight: true, totalPrice: true }
    });
    
    const totalVolume = completedTransactions.reduce((acc, curr) => acc + (curr.finalWeight || 0), 0);
    const totalRevenue = completedTransactions.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

    res.status(200).json({
      status: 'success',
      data: {
        totalUsers,
        totalTransactions,
        totalVolume,
        totalRevenue
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!(await checkAdmin(req, res))) return;

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, role: true, isVerified: true, ktpUrl: true, createdAt: true
      }
    });
    res.status(200).json({ status: 'success', data: users });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

export const verifyUser = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!(await checkAdmin(req, res))) return;

  try {
    const { id } = req.params;
    const { isVerified } = req.body; // true or false

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isVerified: Boolean(isVerified) }
    });

    res.status(200).json({ status: 'success', data: updatedUser });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};
