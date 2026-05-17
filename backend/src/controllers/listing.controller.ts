import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    // Ambil userId dari database, jika tidak ada (belum sync), buat otomatis
    let dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          supabaseId: user.id,
          email: user.email || `${user.id}@placeholder.com`,
          name: user.email?.split('@')[0] || 'User',
          role: 'PEMILIK',
        }
      });
      // Buat wallet kosong untuk user baru
      await prisma.wallet.create({
        data: { userId: dbUser.id, balance: 0 }
      });
    }

    const { categoryId, title, description, estimatedWeight, expectedPrice, latitude, longitude, images } = req.body;

    // Pastikan kategori sampah ada di database. Jika dari mock data, berikan nama yang sesuai.
    const mockCategoryNames: Record<string, string> = {
      '1': 'Kertas & Kardus',
      '2': 'Plastik (Botol, Gelas)',
      '3': 'Besi & Logam',
      '4': 'Elektronik (E-Waste)'
    };
    const categoryName = mockCategoryNames[categoryId] || `Kategori Umum (${categoryId})`;

    let dbCategory = await prisma.wasteCategory.findUnique({ where: { id: categoryId } });
    if (!dbCategory) {
      dbCategory = await prisma.wasteCategory.create({
        data: {
          id: categoryId,
          name: categoryName,
          description: 'Kategori terbuat dari sistem (fallback)',
        }
      });
    } else if (dbCategory.name.startsWith('Kategori ')) {
      // Jika sebelumnya sudah terlanjur terbuat dengan nama "Kategori 1", perbarui namanya
      dbCategory = await prisma.wasteCategory.update({
        where: { id: categoryId },
        data: { name: categoryName }
      });
    }

    const newListing = await prisma.listing.create({
      data: {
        userId: dbUser.id,
        categoryId,
        title,
        description,
        estimatedWeight: parseFloat(estimatedWeight),
        expectedPrice: expectedPrice ? parseFloat(expectedPrice) : null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        images: images || [],
        status: 'TERSEDIA'
      }
    });

    res.status(201).json({ status: 'success', data: newListing });
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

export const getListings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    let dbUser = null;
    if (user) {
      dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
    }

    const { categoryId, status, mine } = req.query;

    const whereClause: any = {};
    if (categoryId) whereClause.categoryId = String(categoryId);
    if (status) whereClause.status = String(status);
    
    // Jika mine=true, filter hanya listing milik user yang sedang login
    if (mine === 'true' && dbUser) {
      whereClause.userId = dbUser.id;
    }

    const listings = await prisma.listing.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true, avatarUrl: true } },
        category: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ status: 'success', data: listings });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

export const getListingById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const listing = await prisma.listing.findUnique({
      where: { id: id as string },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, phoneNumber: true } },
        category: true,
        offers: {
          include: {
            pengepul: { select: { id: true, name: true, avatarUrl: true } }
          }
        }
      }
    });

    if (!listing) {
      res.status(404).json({ status: 'error', message: 'Listing not found' });
      return;
    }

    res.status(200).json({ status: 'success', data: listing });
  } catch (error) {
    console.error('Error fetching listing detail:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

export const deleteListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (!user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
    if (!dbUser) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }

    const listing = await prisma.listing.findUnique({
      where: { id: id as string }
    });

    if (!listing) {
      res.status(404).json({ status: 'error', message: 'Listing not found' });
      return;
    }

    // Pastikan user adalah pemilik listing
    if (listing.userId !== dbUser.id && dbUser.role !== 'ADMIN') {
      res.status(403).json({ status: 'error', message: 'Forbidden: You do not own this listing' });
      return;
    }

    // Pastikan status listing masih TERSEDIA atau PENAWARAN
    if (listing.status !== 'TERSEDIA' && listing.status !== 'PENAWARAN' && dbUser.role !== 'ADMIN') {
      res.status(400).json({ status: 'error', message: 'Listing cannot be deleted because a transaction is in progress or completed.' });
      return;
    }

    // Hapus listing (Offers terkait otomatis terhapus karena Cascade onDelete)
    await prisma.listing.delete({
      where: { id: id as string }
    });

    res.status(200).json({ status: 'success', message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};
