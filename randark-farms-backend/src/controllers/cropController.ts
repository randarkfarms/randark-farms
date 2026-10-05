import { Request, Response } from 'express';
import Crop from '../models/Crop';
import { asyncHandler } from '../utils/asyncHandler';
import { cropSchema } from '../utils/validators';

export const getCrops = asyncHandler(async (req: Request, res: Response) => {
  const { farm_id, field_id, status, search } = req.query;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  let query: any = {};
  if (farm_id) query.farm_id = farm_id;
  if (field_id) query.field_id = field_id;
  if (status) query.status = status;
  if (search) query.name = { $regex: search, $options: 'i' };

  const crops = await Crop.find(query)
    .populate('farm_id', 'name code')
    .populate('field_id', 'name code')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Crop.countDocuments(query);

  res.json({ data: crops, page, pages: Math.ceil(total / limit), total });
});

export const getCrop = asyncHandler(async (req: Request, res: Response) => {
  const crop = await Crop.findById(req.params.id)
    .populate('farm_id', 'name code')
    .populate('field_id', 'name code');
  if (!crop) {
    res.status(404);
    throw new Error('Crop not found');
  }
  res.json(crop);
});

export const createCrop = asyncHandler(async (req: Request, res: Response) => {
  const parsed = cropSchema.parse(req.body);
  const crop = await Crop.create(parsed);
  res.status(201).json(crop);
});

export const updateCrop = asyncHandler(async (req: Request, res: Response) => {
  const parsed = cropSchema.partial().parse(req.body);
  const crop = await Crop.findByIdAndUpdate(req.params.id, parsed, {
    new: true,
    runValidators: true,
  })
    .populate('farm_id', 'name')
    .populate('field_id', 'name');
  if (!crop) {
    res.status(404);
    throw new Error('Crop not found');
  }
  res.json(crop);
});

export const deleteCrop = asyncHandler(async (req: Request, res: Response) => {
  const crop = await Crop.findById(req.params.id);
  if (!crop) {
    res.status(404);
    throw new Error('Crop not found');
  }
  await crop.deleteOne();
  res.json({ message: 'Crop removed' });
});