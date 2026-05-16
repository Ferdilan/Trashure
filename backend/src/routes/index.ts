import { Router } from 'express';
import userRoutes from './user.routes';
import categoryRoutes from './category.routes';
import listingRoutes from './listing.routes';
import offerRoutes from './offer.routes';
import transactionRoutes from './transaction.routes';
import messageRoutes from './message.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/listings', listingRoutes);
router.use('/offers', offerRoutes);
router.use('/transactions', transactionRoutes);
router.use('/messages', messageRoutes);
router.use('/admin', adminRoutes);

export default router;
