import { Request, Response } from 'express';
import Field from '../models/Field';
import { asyncHandler } from '../utils/asyncHandler';
import { fieldSchema } from '../utils/validators';

// @desc    Get all fields with optional filters
// @route   GET /api/fields
export const getFields = asyncHandler(async (req: Request, res: Response) => {
  const { farm_id, status, search } = req.query;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  let query: any = {};
  if (farm_id) query.farm_id = farm_id;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
    ];
  }

  const fields = await Field.find(query)
    .populate('farm_id', 'name code')
    .populate('crop_id', 'name variety')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Field.countDocuments(query);

  res.json({
    data: fields,
    page,
    pages: Math.ceil(total / limit),
    total,
  });
});

// @desc    Get single field
// @route   GET /api/fields/:id
export const getField = asyncHandler(async (req: Request, res: Response) => {
  const field = await Field.findById(req.params.id)
    .populate('farm_id', 'name code')
    .populate('crop_id', 'name variety');
  if (!field) {
    res.status(404);
    throw new Error('Field not found');
  }
  res.json(field);
});

// @desc    Create field
// @route   POST /api/fields
export const createField = asyncHandler(async (req: Request, res: Response) => {
  const parsed = fieldSchema.parse(req.body);
  const field = await Field.create(parsed);
  res.status(201).json(field);
});

// @desc    Update field
// @route   PUT /api/fields/:id
export const updateField = asyncHandler(async (req: Request, res: Response) => {
  const parsed = fieldSchema.partial().parse(req.body);
  const field = await Field.findByIdAndUpdate(req.params.id, parsed, {
    new: true,
    runValidators: true,
  }).populate('farm_id', 'name').populate('crop_id', 'name');
  if (!field) {
    res.status(404);
    throw new Error('Field not found');
  }
  res.json(field);
});

// @desc    Delete field
// @route   DELETE /api/fields/:id
export const deleteField = asyncHandler(async (req: Request, res: Response) => {
  const field = await Field.findById(req.params.id);
  if (!field) {
    res.status(404);
    throw new Error('Field not found');
  }
  await field.deleteOne();
  res.json({ message: 'Field removed' });
});