import express from 'express';
import {
  createOrUpdateMapAddress,
  getMapAddress,
  getAllMapAddresses
} from '../controllers/mapAddressController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public route for getting all map addresses
router.route('/all').get(getAllMapAddresses);

// Protected routes
router.use(protect);

router.route('/')
  .post(createOrUpdateMapAddress)
  .get(getMapAddress);

export default router;
