import express from 'express';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { taskSchema } from '../utils/validators';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  completeTask,
} from '../controllers/taskController';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getTasks)
  .post(validate(taskSchema), createTask);

router.put('/:id/complete', completeTask);

router.route('/:id')
  .get(getTask)
  .put(validate(taskSchema.partial()), updateTask)
  .delete(deleteTask);

export default router;