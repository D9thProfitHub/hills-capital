import express from 'express';
import {
  getMyRequests,
  createBotRequest,
  updateBotRequest,
  deleteBotRequest,
} from '../controllers/botRequestController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes for users to manage their bot requests
router
  .route('/')
  .get(getMyRequests)
  .post(createBotRequest);

router
  .route('/:id')
  .put(updateBotRequest)
  .delete(deleteBotRequest);

export default router;
