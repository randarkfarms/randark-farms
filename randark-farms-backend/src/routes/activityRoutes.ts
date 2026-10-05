import express from 'express';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { activitySchema } from '../utils/validators';
import {
  getActivities,
  getActivity,
  createActivity,
  updateActivity,
  deleteActivity,
} from '../controllers/activityController';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getActivities)
  .post(validate(activitySchema), createActivity);

router.route('/:id')
  .get(getActivity)
  .put(validate(activitySchema.partial()), updateActivity)
  .delete(deleteActivity);

export default router;