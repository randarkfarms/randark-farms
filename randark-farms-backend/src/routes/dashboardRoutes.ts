import express from 'express';
import { protect } from '../middleware/auth';
import { getDashboardData } from '../controllers/dashboardController';

const router = express.Router();

router.use(protect);
router.get('/', getDashboardData);

export default router;