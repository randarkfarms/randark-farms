import { Request, Response } from 'express';
import Farm from '../models/Farm';
import { asyncHandler } from '../utils/asyncHandler';
import { farmSchema } from '../utils/validators';

// @desc    Get all farms with optional search and filters
// @route   GET /api/farms
export const getFarms = asyncHandler(async (req: Request, res: Response) => {
  const { search, region, district, sort } = req.query;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let query: any = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
    ];
  }
  if (region) query.region = region;
  if (district) query.district = district;

  const sortValue = typeof sort === 'string' ? sort : '-createdAt';
  const farms = await Farm.find(query).sort(sortValue).skip(skip).limit(limit);
  const total = await Farm.countDocuments(query);

  res.json({
    data: farms,
    page,
    pages: Math.ceil(total / limit),
    total,
  });
});

// @desc    Get single farm
// @route   GET /api/farms/:id
export const getFarm = asyncHandler(async (req: Request, res: Response) => {
  const farm = await Farm.findById(req.params.id);
  if (!farm) {
    res.status(404);
    throw new Error('Farm not found');
  }
  res.json(farm);
});

// @desc    Create farm
// @route   POST /api/farms
export const createFarm = asyncHandler(async (req: Request, res: Response) => {
  const parsed = farmSchema.parse(req.body);
  const farm = await Farm.create(parsed);
  res.status(201).json(farm);
});

// @desc    Update farm
// @route   PUT /api/farms/:id
export const updateFarm = asyncHandler(async (req: Request, res: Response) => {
  const parsed = farmSchema.partial().parse(req.body);
  const farm = await Farm.findByIdAndUpdate(req.params.id, parsed, { new: true, runValidators: true });
  if (!farm) {
    res.status(404);
    throw new Error('Farm not found');
  }
  res.json(farm);
});

// @desc    Delete farm (soft delete/archive)
// @route   DELETE /api/farms/:id
export const deleteFarm = asyncHandler(async (req: Request, res: Response) => {
  const farm = await Farm.findById(req.params.id);
  if (!farm) {
    res.status(404);
    throw new Error('Farm not found');
  }
  await farm.deleteOne();
  res.json({ message: 'Farm removed' });
});