import { Router } from 'express';
import { getMessages } from '../controllers/message.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/:transactionId', requireAuth, getMessages);

export default router;
