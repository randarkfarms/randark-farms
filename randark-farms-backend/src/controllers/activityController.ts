import { Request, Response } from 'express';
import Activity from '../models/Activity';
import { asyncHandler } from '../utils/asyncHandler';
import { activitySchema } from '../utils/validators';

export const getActivities = asyncHandler(async (req: Request, res: Response) => {
  const { farm_id, field_id, crop_id, activity_type, start_date, end_date, search } = req.query;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  let query: any = {};
  if (farm_id) query.farm_id = farm_id;
  if (field_id) query.field_id = field_id;
  if (crop_id) query.crop_id = crop_id;
  if (activity_type) query.activity_type = activity_type;
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
      { notes: { $regex: search, $options: 'i' } },
    ];
  }

  const activities = await Activity.find(query)
    .populate('farm_id', 'name code')
    .populate('field_id', 'name code')
    .populate('crop_id', 'name variety')
    .sort('-date')
    .skip(skip)
    .limit(limit);

  const total = await Activity.countDocuments(query);

  res.json({ data: activities, page, pages: Math.ceil(total / limit), total });
});

export const getActivity = asyncHandler(async (req: Request, res: Response) => {
  const activity = await Activity.findById(req.params.id)
    .populate('farm_id', 'name code')
    .populate('field_id', 'name code')
    .populate('crop_id', 'name variety');
  if (!activity) {
    res.status(404);
    throw new Error('Activity not found');
  }
  res.json(activity);
});

export const createActivity = asyncHandler(async (req: Request, res: Response) => {
  const parsed = activitySchema.parse(req.body);
  const activity = await Activity.create(parsed);
  res.status(201).json(activity);
});

export const updateActivity = asyncHandler(async (req: Request, res: Response) => {
  const parsed = activitySchema.partial().parse(req.body);
  const activity = await Activity.findByIdAndUpdate(req.params.id, parsed, {
    new: true,
    runValidators: true,
  })
    .populate('farm_id', 'name')
    .populate('field_id', 'name');
  if (!activity) {
    res.status(404);
    throw new Error('Activity not found');
  }
  res.json(activity);
});

export const deleteActivity = asyncHandler(async (req: Request, res: Response) => {
  const activity = await Activity.findById(req.params.id);
  if (!activity) {
    res.status(404);
    throw new Error('Activity not found');
  }
  await activity.deleteOne();
  res.json({ message: 'Activity removed' });
});