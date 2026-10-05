import { Request, Response } from 'express';
import Farm from '../models/Farm';
import Field from '../models/Field';
import Crop from '../models/Crop';
import Task from '../models/Task';
import Expense from '../models/Expense';
import Harvest from '../models/Harvest';
import InventoryItem from '../models/InventoryItem';
import Activity from '../models/Activity';
import { asyncHandler } from '../utils/asyncHandler';

// Helper: safely parse a value (string or Date) into a Date or null
const parseDate = (value: any): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

// Helper: group an array of documents with a date field into { month, total }
const groupByMonth = (docs: any[], valueField: string) => {
  const map: Record<string, number> = {};
  docs.forEach((d) => {
    const date = parseDate(d.date);
    if (!date) return;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    map[key] = (map[key] || 0) + (Number(d[valueField]) || 0);
  });
  return Object.entries(map)
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => a.month.localeCompare(b.month));
};

export const getDashboardData = asyncHandler(async (req: Request, res: Response) => {
  const now = new Date();
  const nowTime = now.getTime();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // ── Counts ────────────────────────────────────────
  const totalFarms = await Farm.countDocuments();
  const totalFields = await Field.countDocuments();
  const activeCrops = await Crop.countDocuments({
    status: { $in: ['Active', 'Growing', 'Planted'] },
  });

  // ── Total area ────────────────────────────────────
  const totalAreaAgg = await Farm.aggregate([
    { $group: { _id: null, total: { $sum: '$total_area' } } },
  ]);
  const totalArea = totalAreaAgg.length > 0 ? totalAreaAgg[0].total : 0;

  // ── Upcoming tasks (JS-filtered → works for string or Date) ──
  const allOpenTasks = await Task.find({ status: { $ne: 'Completed' } })
    .populate('farm_id', 'name')
    .populate('field_id', 'name')
    .sort('due_date');

  const upcomingTasks = allOpenTasks
    .filter((t: any) => {
      const due = parseDate(t.due_date);
      return due !== null && due.getTime() >= nowTime;
    })
    .slice(0, 10);

  const overdueCount = allOpenTasks.filter((t: any) => {
    const due = parseDate(t.due_date);
    return due !== null && due.getTime() < nowTime;
  }).length;

  // ── Recent activities ─────────────────────────────
  const recentActivities = await Activity.find()
    .populate('farm_id', 'name')
    .populate('field_id', 'name')
    .sort('-date')
    .limit(10);

  // ── All expenses (fetch once, aggregate in JS) ────
  const allExpenses = await Expense.find().lean();
  const expensesByMonth = groupByMonth(allExpenses, 'amount');

  const monthlyExpenses = allExpenses
    .filter((e: any) => {
      const d = parseDate(e.date);
      return d !== null && d.getTime() >= monthStart.getTime();
    })
    .reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);

  // ── Expenses by category (for pie chart) ──────────
  const categoryMap: Record<string, number> = {};
  allExpenses.forEach((e: any) => {
    const cat = e.category || 'Other';
    categoryMap[cat] = (categoryMap[cat] || 0) + (Number(e.amount) || 0);
  });
  const expensesByCategory = Object.entries(categoryMap)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);

  // ── Harvests (JS-aggregated) ──────────────────────
  const allHarvests = await Harvest.find().lean();
  const harvestByMonth = groupByMonth(allHarvests, 'quantity');

  // ── Inventory alerts ──────────────────────────────
  const inventoryAlerts = await InventoryItem.find({
    $expr: { $lte: ['$quantity', '$minimum_stock_level'] },
  });

  const summary = {
    total_farms: totalFarms,
    total_fields: totalFields,
    total_area: totalArea,
    active_crops: activeCrops,
    monthly_expenses: monthlyExpenses,
    upcoming_tasks: upcomingTasks.length,
    overdue_tasks: overdueCount,
    low_stock_items: inventoryAlerts.length,
  };

  res.json({
    summary,
    upcoming_tasks: upcomingTasks,
    recent_activities: recentActivities,
    expenses_by_month: expensesByMonth.map((e: any) => ({
      month: e.month,
      total: e.total,
    })),
    expenses_by_category: expensesByCategory,
    harvest_by_month: harvestByMonth.map((h: any) => ({
      month: h.month,
      quantity: h.total,
    })),
    inventory_alerts: inventoryAlerts,
  });
});