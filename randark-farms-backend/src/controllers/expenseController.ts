import { Request, Response } from 'express';
import Expense from '../models/Expense';
import { asyncHandler } from '../utils/asyncHandler';
import { expenseSchema } from '../utils/validators';

export const getExpenses = asyncHandler(async (req: Request, res: Response) => {
  const { farm_id, field_id, category, start_date, end_date, search } = req.query;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  let query: any = {};
  if (farm_id) query.farm_id = farm_id;
  if (field_id) query.field_id = field_id;
  if (category) query.category = category;
  if (start_date && end_date) {
    query.date = { $gte: new Date(start_date as string), $lte: new Date(end_date as string) };
  } else if (start_date) {
    query.date = { $gte: new Date(start_date as string) };
  } else if (end_date) {
    query.date = { $lte: new Date(end_date as string) };
  }
  if (search) {
    query.$or = [
      { description: { $regex: search, $options: 'i' } },
      { supplier_vendor: { $regex: search, $options: 'i' } },
    ];
  }

  const expenses = await Expense.find(query)
    .populate('farm_id', 'name code')
    .populate('field_id', 'name code')
    .sort('-date')
    .skip(skip)
    .limit(limit);

  const total = await Expense.countDocuments(query);
  const sumAgg = await Expense.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const totalAmount = sumAgg.length > 0 ? sumAgg[0].total : 0;

  res.json({ data: expenses, page, pages: Math.ceil(total / limit), total, totalAmount });
});

export const getExpense = asyncHandler(async (req: Request, res: Response) => {
  const expense = await Expense.findById(req.params.id)
    .populate('farm_id', 'name code')
    .populate('field_id', 'name code');
  if (!expense) {
    res.status(404);
    throw new Error('Expense not found');
  }
  res.json(expense);
});

export const createExpense = asyncHandler(async (req: Request, res: Response) => {
  const parsed = expenseSchema.parse(req.body);
  const expense = await Expense.create(parsed);
  res.status(201).json(expense);
});

export const updateExpense = asyncHandler(async (req: Request, res: Response) => {
  const parsed = expenseSchema.partial().parse(req.body);
  const expense = await Expense.findByIdAndUpdate(req.params.id, parsed, {
    new: true,
    runValidators: true,
  })
    .populate('farm_id', 'name')
    .populate('field_id', 'name');
  if (!expense) {
    res.status(404);
    throw new Error('Expense not found');
  }
  res.json(expense);
});

export const deleteExpense = asyncHandler(async (req: Request, res: Response) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) {
    res.status(404);
    throw new Error('Expense not found');
  }
  await expense.deleteOne();
  res.json({ message: 'Expense removed' });
});