import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

// Dipanggil dari frontend setelah berhasil register di Supabase
export const syncUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, role, phoneNumber } = req.body;
    const user = req.user; // Dari middleware

    if (!user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    // Cek apakah user sudah ada
    const existingUser = await prisma.user.findUnique({
      where: { supabaseId: user.id }
    });

    if (existingUser) {
      res.status(200).json({ status: 'success', message: 'User already synced', data: existingUser });
      return;
    }

    // Validasi role Enum (PEMILIK, PENGEPUL, ADMIN)
    const validRole = ['PEMILIK', 'PENGEPUL', 'ADMIN'].includes(role) ? role : 'PEMILIK';

    // Buat user baru di tabel Prisma
    const newUser = await prisma.user.create({
      data: {
        supabaseId: user.id,
        email: user.email!,
        name: name || user.email?.split('@')[0],
        role: validRole,
        phoneNumber: phoneNumber || null
      }
    });

    // Buat wallet kosong untuk user baru
    await prisma.wallet.create({
      data: {
        userId: newUser.id,
        balance: 0
      }
    });

    res.status(201).json({ status: 'success', message: 'User synced successfully', data: newUser });
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: {
        wallet: true,
        addresses: true
      }
    });

    if (!dbUser) {
      res.status(404).json({ status: 'error', message: 'User not found in database' });
      return;
    }

    res.status(200).json({ status: 'success', data: dbUser });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};
