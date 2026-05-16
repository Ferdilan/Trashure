import { Router } from 'express';
import { getTransactions, updateTransactionStatus } from '../controllers/transaction.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', requireAuth, getTransactions);
router.patch('/:id/status', requireAuth, updateTransactionStatus);

export default router;
