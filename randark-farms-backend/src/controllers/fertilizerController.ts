import { Request, Response } from 'express';
import FertilizerRecord from '../models/FertilizerRecord';
import { asyncHandler } from '../utils/asyncHandler';
import { fertilizerSchema } from '../utils/validators';

export const getFertilizerRecords = asyncHandler(async (req: Request, res: Response) => {
  const { farm_id, field_id, crop_id, start_date, end_date, search } = req.query;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  let query: any = {};
  if (farm_id) query.farm_id = farm_id;
  if (field_id) query.field_id = field_id;
  if (crop_id) query.crop_id = crop_id;
  if (start_date && end_date) {
    query.date = { $gte: new Date(start_date as string), $lte: new Date(end_date as string) };
  } else if (start_date) {
    query.date = { $gte: new Date(start_date as string) };
  } else if (end_date) {
    query.date = { $lte: new Date(end_date as string) };
  }
  if (search) {
    query.fertilizer_name = { $regex: search, $options: 'i' };
  }

  const records = await FertilizerRecord.find(query)
    .populate('farm_id', 'name code')
    .populate('field_id', 'name code')
    .populate('crop_id', 'name variety')
    .sort('-date')
    .skip(skip)
    .limit(limit);

  const total = await FertilizerRecord.countDocuments(query);

  res.json({ data: records, page, pages: Math.ceil(total / limit), total });
});

export const getFertilizerRecord = asyncHandler(async (req: Request, res: Response) => {
  const record = await FertilizerRecord.findById(req.params.id)
    .populate('farm_id', 'name code')
    .populate('field_id', 'name code')
    .populate('crop_id', 'name variety');
  if (!record) {
    res.status(404);
    throw new Error('Fertilizer record not found');
  }
  res.json(record);
});

export const createFertilizerRecord = asyncHandler(async (req: Request, res: Response) => {
  const parsed = fertilizerSchema.parse(req.body);
  const record = await FertilizerRecord.create(parsed);
  res.status(201).json(record);
});

export const updateFertilizerRecord = asyncHandler(async (req: Request, res: Response) => {
  const parsed = fertilizerSchema.partial().parse(req.body);
  const record = await FertilizerRecord.findByIdAndUpdate(req.params.id, parsed, {
    new: true,
    runValidators: true,
  })
    .populate('farm_id', 'name')
    .populate('field_id', 'name');
  if (!record) {
    res.status(404);
    throw new Error('Fertilizer record not found');
  }
  res.json(record);
});

export const deleteFertilizerRecord = asyncHandler(async (req: Request, res: Response) => {
  const record = await FertilizerRecord.findById(req.params.id);
  if (!record) {
    res.status(404);
    throw new Error('Fertilizer record not found');
  }
  await record.deleteOne();
  res.json({ message: 'Fertilizer record removed' });
});