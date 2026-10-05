import express from 'express';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { cropSchema } from '../utils/validators';
import {
  getCrops,
  getCrop,
  createCrop,
  updateCrop,
  deleteCrop,
} from '../controllers/cropController';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getCrops)
  .post(validate(cropSchema), createCrop);

router.route('/:id')
  .get(getCrop)
  .put(validate(cropSchema.partial()), updateCrop)
  .delete(deleteCrop);

export default router;