import express from 'express';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { farmSchema } from '../utils/validators';
import {
  getFarms,
  getFarm,
  createFarm,
  updateFarm,
  deleteFarm,
} from '../controllers/farmController';

const router = express.Router();

router.use(protect); // All routes require auth

router.route('/')
  .get(getFarms)
  .post(validate(farmSchema), createFarm);

router.route('/:id')
  .get(getFarm)
  .put(validate(farmSchema.partial()), updateFarm)
  .delete(deleteFarm);

export default router;