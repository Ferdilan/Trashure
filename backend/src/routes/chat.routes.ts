import { Router } from 'express';
import { getMessagesByTransaction } from '../controllers/chat.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/:transactionId', requireAuth, getMessagesByTransaction);

export default router;
