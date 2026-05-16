import { Router } from 'express';
import { getCategories } from '../controllers/category.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', requireAuth, getCategories);

export default router;
