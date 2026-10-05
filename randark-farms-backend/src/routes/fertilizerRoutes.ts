import express from 'express';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { fertilizerSchema } from '../utils/validators';
import {
  getFertilizerRecords,
  getFertilizerRecord,
  createFertilizerRecord,
  updateFertilizerRecord,
  deleteFertilizerRecord,
} from '../controllers/fertilizerController';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getFertilizerRecords)
  .post(validate(fertilizerSchema), createFertilizerRecord);

router.route('/:id')
  .get(getFertilizerRecord)
  .put(validate(fertilizerSchema.partial()), updateFertilizerRecord)
  .delete(deleteFertilizerRecord);

export default router;