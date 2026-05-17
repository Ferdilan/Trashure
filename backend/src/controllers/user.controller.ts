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

    let dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: {
        wallet: true,
        addresses: true
      }
    });

    if (!dbUser) {
      // Auto-sync jika profil belum ada saat diakses
      dbUser = await prisma.user.create({
        data: {
          supabaseId: user.id,
          email: user.email || `${user.id}@placeholder.com`,
          name: user.email?.split('@')[0] || 'User Baru',
          role: 'PEMILIK', // Default role
          wallet: {
            create: { balance: 0 }
          }
        },
        include: {
          wallet: true,
          addresses: true
        }
      });
    }

    res.status(200).json({ status: 'success', data: dbUser });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const { name, phoneNumber } = req.body;

    const updatedUser = await prisma.user.update({
      where: { supabaseId: user!.id },
      data: {
        name,
        phoneNumber
      }
    });

    res.status(200).json({ status: 'success', data: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

export const addAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const { label, fullAddress, isPrimary } = req.body;

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user!.id } });
    if (!dbUser) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }

    if (isPrimary) {
      // Set all other addresses to not primary
      await prisma.address.updateMany({
        where: { userId: dbUser.id },
        data: { isPrimary: false }
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId: dbUser.id,
        label,
        fullAddress,
        latitude: -6.2088, // Default latitude (Jakarta)
        longitude: 106.8456, // Default longitude (Jakarta)
        isPrimary: isPrimary || false
      }
    });

    res.status(201).json({ status: 'success', data: newAddress });
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id }
    });

    if (!dbUser) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }

    const isPemilik = dbUser.role === 'PEMILIK';

    if (isPemilik) {
      // 1. Saldo Wallet
      const wallet = await prisma.wallet.findUnique({
        where: { userId: dbUser.id }
      });
      const balance = wallet ? wallet.balance : 0;

      // 2. Total Penjualan (dalam kg) - dari transaksi berstatus SELESAI
      const completedTransactions = await prisma.transaction.findMany({
        where: {
          listing: { userId: dbUser.id },
          status: 'SELESAI'
        },
        select: { finalWeight: true }
      });
      const totalWeight = completedTransactions.reduce((acc, t) => acc + (t.finalWeight || 0), 0);

      // 3. Listing Aktif - status TERSEDIA atau PENAWARAN
      const activeListingsCount = await prisma.listing.count({
        where: {
          userId: dbUser.id,
          status: { in: ['TERSEDIA', 'PENAWARAN'] }
        }
      });

      // 4. Menunggu Aksi
      const waitingOffersCount = await prisma.offer.count({
        where: {
          listing: { userId: dbUser.id },
          status: 'MENUNGGU'
        }
      });
      const waitingSchedulesCount = await prisma.transaction.count({
        where: {
          listing: { userId: dbUser.id },
          status: 'JADWAL_PICKUP',
          pickupDate: null
        }
      });
      const waitingActionCount = waitingOffersCount + waitingSchedulesCount;

      res.status(200).json({
        status: 'success',
        data: {
          balance,
          totalWeight,
          activeListingsCount,
          waitingActionCount
        }
      });
    } else {
      // Pengepul
      const wallet = await prisma.wallet.findUnique({
        where: { userId: dbUser.id }
      });
      const balance = wallet ? wallet.balance : 0;

      const completedTransactions = await prisma.transaction.findMany({
        where: {
          pengepulId: dbUser.id,
          status: 'SELESAI'
        },
        select: { finalWeight: true, totalPrice: true }
      });
      const totalWeight = completedTransactions.reduce((acc, t) => acc + (t.finalWeight || 0), 0);
      const totalSpent = completedTransactions.reduce((acc, t) => acc + (t.totalPrice || 0), 0);

      const completedTasksCount = await prisma.transaction.count({
        where: {
          pengepulId: dbUser.id,
          status: 'SELESAI'
        }
      });

      const waitingActionCount = await prisma.transaction.count({
        where: {
          pengepulId: dbUser.id,
          status: { in: ['JADWAL_PICKUP', 'TRANSIT', 'VERIFIKASI'] }
        }
      });

      res.status(200).json({
        status: 'success',
        data: {
          balance,
          totalWeight,
          totalSpent,
          completedTasksCount,
          waitingActionCount
        }
      });
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};
