import { Router } from 'express';
import { syncUser, getProfile, updateProfile, addAddress, getDashboardStats } from '../controllers/user.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Routes
router.post('/sync', requireAuth, syncUser);
router.get('/profile', requireAuth, getProfile);
router.put('/profile', requireAuth, updateProfile);
router.post('/addresses', requireAuth, addAddress);
router.get('/dashboard-stats', requireAuth, getDashboardStats);

export default router;
