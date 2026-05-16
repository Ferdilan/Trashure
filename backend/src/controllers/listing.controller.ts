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

    // Ambil userId dari database
    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
    if (!dbUser) {
      res.status(404).json({ status: 'error', message: 'User not found in DB' });
      return;
    }

    const { categoryId, title, description, estimatedWeight, latitude, longitude, images } = req.body;

    const newListing = await prisma.listing.create({
      data: {
        userId: dbUser.id,
        categoryId,
        title,
        description,
        estimatedWeight: parseFloat(estimatedWeight),
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
    // Bisa tambahkan logic query param (radius, category) nanti
    const { categoryId, status } = req.query;

    const whereClause: any = {};
    if (categoryId) whereClause.categoryId = String(categoryId);
    if (status) whereClause.status = String(status);

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
