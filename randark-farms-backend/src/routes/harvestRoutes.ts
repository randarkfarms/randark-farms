import express from 'express';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { harvestSchema } from '../utils/validators';
import {
  getHarvests,
  getHarvest,
  createHarvest,
  updateHarvest,
  deleteHarvest,
} from '../controllers/harvestController';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getHarvests)
  .post(validate(harvestSchema), createHarvest);

router.route('/:id')
  .get(getHarvest)
  .put(validate(harvestSchema.partial()), updateHarvest)
  .delete(deleteHarvest);

export default router;