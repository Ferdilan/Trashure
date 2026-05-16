import { Router } from 'express';
import { syncUser, getProfile } from '../controllers/user.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Routes
router.post('/sync', requireAuth, syncUser);
router.get('/profile', requireAuth, getProfile);

export default router;
