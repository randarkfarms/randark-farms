import { Request, Response } from 'express';
import Activity from '../models/Activity';
import SprayingRecord from '../models/SprayingRecord';
import FertilizerRecord from '../models/FertilizerRecord';
import Expense from '../models/Expense';
import Harvest from '../models/Harvest';
import InventoryItem from '../models/InventoryItem';
import Equipment from '../models/Equipment';
import { asyncHandler } from '../utils/asyncHandler';

// Helper to build filter from request body (for POST)
const buildFilterFromBody = (body: any) => {
  const { start_date, end_date, farm_id, field_id, crop_id, activity_type, category } = body;
  const filter: any = {};
  if (start_date && end_date) {
    filter.date = { $gte: new Date(start_date), $lte: new Date(end_date) };
  } else if (start_date) {
    filter.date = { $gte: new Date(start_date) };
  } else if (end_date) {
    filter.date = { $lte: new Date(end_date) };
  }
  if (farm_id) filter.farm_id = farm_id;
  if (field_id) filter.field_id = field_id;
  if (crop_id) filter.crop_id = crop_id;
  if (activity_type) filter.activity_type = activity_type;
  if (category) filter.category = category;
  return filter;
};

// Generic report generator
const generateReportData = async (model: any, filter: any, populate: any[] = []) => {
  let query = model.find(filter);
  populate.forEach((p) => {
    query = query.populate(p);
  });
  const data = await query.sort('-date');
  return data;
};

// Activity Report
export const generateActivityReport = asyncHandler(async (req: Request, res: Response) => {
  const filter = buildFilterFromBody(req.body);
  const activities = await generateReportData(Activity, filter, [
    { path: 'farm_id', select: 'name code' },
    { path: 'field_id', select: 'name code' },
    { path: 'crop_id', select: 'name variety' },
  ]);
  res.json({ data: activities });
});

// Spraying Report
export const generateSprayingReport = asyncHandler(async (req: Request, res: Response) => {
  const filter = buildFilterFromBody(req.body);
  const records = await generateReportData(SprayingRecord, filter, [
    { path: 'farm_id', select: 'name code' },
    { path: 'field_id', select: 'name code' },
    { path: 'crop_id', select: 'name variety' },
  ]);
  res.json({ data: records });
});

// Fertilizer Report
export const generateFertilizerReport = asyncHandler(async (req: Request, res: Response) => {
  const filter = buildFilterFromBody(req.body);
  const records = await generateReportData(FertilizerRecord, filter, [
    { path: 'farm_id', select: 'name code' },
    { path: 'field_id', select: 'name code' },
    { path: 'crop_id', select: 'name variety' },
  ]);
  res.json({ data: records });
});

// Expense Report
export const generateExpenseReport = asyncHandler(async (req: Request, res: Response) => {
  const filter = buildFilterFromBody(req.body);
  const expenses = await Expense.find(filter)
    .populate('farm_id', 'name code')
    .populate('field_id', 'name code')
    .sort('-date');
  const totalAgg = await Expense.aggregate([
    { $match: filter },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const total = totalAgg.length > 0 ? totalAgg[0].total : 0;
  res.json({ data: expenses, total });
});

// Harvest Report
export const generateHarvestReport = asyncHandler(async (req: Request, res: Response) => {
  const filter = buildFilterFromBody(req.body);
  const harvests = await Harvest.find(filter)
    .populate('farm_id', 'name code')
    .populate('field_id', 'name code')
    .populate('crop_id', 'name variety')
    .sort('-date');
  const totalAgg = await Harvest.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        totalQuantity: { $sum: '$quantity' },
        totalRevenue: { $sum: '$total_revenue' },
      },
    },
  ]);
  const totals = totalAgg.length > 0 ? totalAgg[0] : { totalQuantity: 0, totalRevenue: 0 };
  res.json({ data: harvests, ...totals });
});

// Inventory Report
export const generateInventoryReport = asyncHandler(async (req: Request, res: Response) => {
  const items = await InventoryItem.find().sort('category');
  res.json({ data: items });
});

// Equipment Report
export const generateEquipmentReport = asyncHandler(async (req: Request, res: Response) => {
  const equipment = await Equipment.find().sort('type');
  res.json({ data: equipment });
});

// CSV Export (simple JSON to CSV conversion)
const toCSV = (data: any[]) => {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map((row) => headers.map((header) => JSON.stringify(row[header] ?? '')).join(',')),
  ];
  return csvRows.join('\n');
};

export const exportCSV = asyncHandler(async (req: Request, res: Response) => {
  const { reportType } = req.params;
  const filter = buildFilterFromBody(req.body);
  let data: any[] = [];
  switch (reportType) {
    case 'activities':
      data = await Activity.find(filter).populate('farm_id', 'name').populate('field_id', 'name');
      break;
    case 'expenses':
      data = await Expense.find(filter).populate('farm_id', 'name');
      break;
    case 'harvests':
      data = await Harvest.find(filter).populate('farm_id', 'name');
      break;
    default:
      res.status(400);
      throw new Error('Invalid report type for CSV');
  }
  const csv = toCSV(data);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=${reportType}_report.csv`);
  res.send(csv);
});

export const exportPDF = asyncHandler(async (req: Request, res: Response) => {
  // For simplicity, return JSON with message. Implement actual PDF generation if needed.
  res.json({ message: 'PDF export not implemented in this demo. Use CSV or integrate a PDF library.' });
});