import { Router } from 'express';
import { getTransactions, updateTransactionStatus, createPaymentToken } from '../controllers/transaction.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', requireAuth, getTransactions);
router.patch('/:id/status', requireAuth, updateTransactionStatus);
router.post('/:id/pay', requireAuth, createPaymentToken);

export default router;
