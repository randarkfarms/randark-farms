import { Request, Response } from 'express';
import Season from '../models/Season';
import { asyncHandler } from '../utils/asyncHandler';

export const getSeasons = asyncHandler(async (req: Request, res: Response) => {
  const seasons = await Season.find().sort('-start_date');
  res.json(seasons);
});

export const getSeason = asyncHandler(async (req: Request, res: Response) => {
  const season = await Season.findById(req.params.id);
  if (!season) {
    res.status(404);
    throw new Error('Season not found');
  }
  res.json(season);
});

export const createSeason = asyncHandler(async (req: Request, res: Response) => {
  const { name, start_date, end_date, description, status } = req.body;
  const season = await Season.create({ name, start_date, end_date, description, status });
  res.status(201).json(season);
});

export const updateSeason = asyncHandler(async (req: Request, res: Response) => {
  const season = await Season.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!season) {
    res.status(404);
    throw new Error('Season not found');
  }
  res.json(season);
});

export const deleteSeason = asyncHandler(async (req: Request, res: Response) => {
  const season = await Season.findById(req.params.id);
  if (!season) {
    res.status(404);
    throw new Error('Season not found');
  }
  await season.deleteOne();
  res.json({ message: 'Season removed' });
});