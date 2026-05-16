import { Router } from 'express';
import { createListing, getListings, getListingById } from '../controllers/listing.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', requireAuth, createListing);
router.get('/', requireAuth, getListings);
router.get('/:id', requireAuth, getListingById);

export default router;
