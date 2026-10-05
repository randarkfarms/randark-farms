import express from 'express';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { fieldSchema } from '../utils/validators';
import {
  getFields,
  getField,
  createField,
  updateField,
  deleteField,
} from '../controllers/fieldController';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getFields)
  .post(validate(fieldSchema), createField);

router.route('/:id')
  .get(getField)
  .put(validate(fieldSchema.partial()), updateField)
  .delete(deleteField);

export default router;