import { Request, Response } from 'express';
import prisma from '../config/database';

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.wasteCategory.findMany();
    res.status(200).json({ status: 'success', data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};
