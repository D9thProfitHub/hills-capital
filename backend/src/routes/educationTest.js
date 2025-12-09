import express from 'express';
import { getEducationTest } from '../controllers/userEducationController.js';

const router = express.Router();

// Public test route (no authentication required)
router.route('/test').get(getEducationTest);

export default router;
