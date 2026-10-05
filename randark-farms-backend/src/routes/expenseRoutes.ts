import express from 'express';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { expenseSchema } from '../utils/validators';
import {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../controllers/expenseController';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getExpenses)
  .post(validate(expenseSchema), createExpense);

router.route('/:id')
  .get(getExpense)
  .put(validate(expenseSchema.partial()), updateExpense)
  .delete(deleteExpense);

export default router;