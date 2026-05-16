import { Router } from 'express';
import { createOffer, updateOfferStatus } from '../controllers/offer.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', requireAuth, createOffer);
router.patch('/:id/status', requireAuth, updateOfferStatus);

export default router;
