import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export interface AuthRequest extends Request {
  user?: any;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ status: 'error', message: 'Unauthorized: No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Verifikasi token langsung ke Supabase API (lebih aman untuk mengecek apakah token dicabut)
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized: Invalid token' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};
