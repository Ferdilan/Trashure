import { Router } from 'express';
import { getDashboardStats, getUsers, verifyUser } from '../controllers/admin.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/stats', requireAuth, getDashboardStats);
router.get('/users', requireAuth, getUsers);
router.patch('/users/:id/verify', requireAuth, verifyUser);

export default router;
