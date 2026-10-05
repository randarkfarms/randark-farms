import { Request, Response } from 'express';
import Task from '../models/Task';
import { asyncHandler } from '../utils/asyncHandler';
import { taskSchema } from '../utils/validators';

export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  const { farm_id, field_id, status, priority, due_date, search, overdue } = req.query;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  let query: any = {};
  if (farm_id) query.farm_id = farm_id;
  if (field_id) query.field_id = field_id;
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (due_date) query.due_date = new Date(due_date as string);
  if (overdue === 'true') {
    query.due_date = { $lt: new Date() };
    query.status = { $ne: 'Completed' };
  }
  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }

  const tasks = await Task.find(query)
    .populate('farm_id', 'name code')
    .populate('field_id', 'name code')
    .populate('crop_id', 'name')
    .sort('due_date')
    .skip(skip)
    .limit(limit);

  const total = await Task.countDocuments(query);

  res.json({ data: tasks, page, pages: Math.ceil(total / limit), total });
});

export const getTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await Task.findById(req.params.id)
    .populate('farm_id', 'name code')
    .populate('field_id', 'name code')
    .populate('crop_id', 'name');
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }
  res.json(task);
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const parsed = taskSchema.parse(req.body);
  const task = await Task.create(parsed);
  res.status(201).json(task);
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const parsed = taskSchema.partial().parse(req.body);
  const task = await Task.findByIdAndUpdate(req.params.id, parsed, {
    new: true,
    runValidators: true,
  })
    .populate('farm_id', 'name')
    .populate('field_id', 'name');
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }
  res.json(task);
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }
  await task.deleteOne();
  res.json({ message: 'Task removed' });
});

// Mark task complete
export const completeTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { status: 'Completed' },
    { new: true }
  );
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }
  res.json(task);
});