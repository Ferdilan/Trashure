import { Router } from 'express';
import { getMessagesByTransaction, sendMessage } from '../controllers/chat.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/:transactionId', requireAuth, getMessagesByTransaction);
router.post('/', requireAuth, sendMessage);

export default router;
