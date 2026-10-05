import { Request, Response } from 'express';
import Harvest from '../models/Harvest';
import { asyncHandler } from '../utils/asyncHandler';
import { harvestSchema } from '../utils/validators';

export const getHarvests = asyncHandler(async (req: Request, res: Response) => {
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
    query.$or = [
      { buyer: { $regex: search, $options: 'i' } },
      { notes: { $regex: search, $options: 'i' } },
    ];
  }

  const harvests = await Harvest.find(query)
    .populate('farm_id', 'name code')
    .populate('field_id', 'name code')
    .populate('crop_id', 'name variety')
    .sort('-date')
    .skip(skip)
    .limit(limit);

  const total = await Harvest.countDocuments(query);
  const sumAgg = await Harvest.aggregate([
    { $match: query },
    { $group: { _id: null, totalQuantity: { $sum: '$quantity' }, totalRevenue: { $sum: '$total_revenue' } } },
  ]);
  const totals = sumAgg.length > 0 ? sumAgg[0] : { totalQuantity: 0, totalRevenue: 0 };

  res.json({ data: harvests, page, pages: Math.ceil(total / limit), total, ...totals });
});

export const getHarvest = asyncHandler(async (req: Request, res: Response) => {
  const harvest = await Harvest.findById(req.params.id)
    .populate('farm_id', 'name code')
    .populate('field_id', 'name code')
    .populate('crop_id', 'name variety');
  if (!harvest) {
    res.status(404);
    throw new Error('Harvest not found');
  }
  res.json(harvest);
});

export const createHarvest = asyncHandler(async (req: Request, res: Response) => {
  const parsed = harvestSchema.parse(req.body);
  // Auto-calculate total_revenue if not provided
  if (!parsed.total_revenue && parsed.quantity && parsed.selling_price) {
    parsed.total_revenue = parsed.quantity * parsed.selling_price;
  }
  const harvest = await Harvest.create(parsed);
  res.status(201).json(harvest);
});

export const updateHarvest = asyncHandler(async (req: Request, res: Response) => {
  const parsed = harvestSchema.partial().parse(req.body);
  if (parsed.quantity && parsed.selling_price && !parsed.total_revenue) {
    parsed.total_revenue = parsed.quantity * parsed.selling_price;
  }
  const harvest = await Harvest.findByIdAndUpdate(req.params.id, parsed, {
    new: true,
    runValidators: true,
  })
    .populate('farm_id', 'name')
    .populate('field_id', 'name')
    .populate('crop_id', 'name');
  if (!harvest) {
    res.status(404);
    throw new Error('Harvest not found');
  }
  res.json(harvest);
});

export const deleteHarvest = asyncHandler(async (req: Request, res: Response) => {
  const harvest = await Harvest.findById(req.params.id);
  if (!harvest) {
    res.status(404);
    throw new Error('Harvest not found');
  }
  await harvest.deleteOne();
  res.json({ message: 'Harvest removed' });
});