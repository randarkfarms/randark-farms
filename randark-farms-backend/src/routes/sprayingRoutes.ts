import express from 'express';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { sprayingSchema } from '../utils/validators';
import {
  getSprayingRecords,
  getSprayingRecord,
  createSprayingRecord,
  updateSprayingRecord,
  deleteSprayingRecord,
} from '../controllers/sprayingController';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getSprayingRecords)
  .post(validate(sprayingSchema), createSprayingRecord);

router.route('/:id')
  .get(getSprayingRecord)
  .put(validate(sprayingSchema.partial()), updateSprayingRecord)
  .delete(deleteSprayingRecord);

export default router;