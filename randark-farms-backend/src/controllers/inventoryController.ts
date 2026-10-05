import { Request, Response } from 'express';
import InventoryItem from '../models/InventoryItem';
import InventoryTransaction from '../models/InventoryTransaction';
import { asyncHandler } from '../utils/asyncHandler';
import { inventoryItemSchema } from '../utils/validators';

export const getInventoryItems = asyncHandler(async (req: Request, res: Response) => {
  const { category, search, low_stock } = req.query;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  let query: any = {};
  if (category) query.category = category;
  if (search) query.name = { $regex: search, $options: 'i' };
  if (low_stock === 'true') {
    query.$expr = { $lte: ['$quantity', '$minimum_stock_level'] };
  }

  const items = await InventoryItem.find(query)
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await InventoryItem.countDocuments(query);

  res.json({ data: items, page, pages: Math.ceil(total / limit), total });
});

export const getInventoryItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await InventoryItem.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Inventory item not found');
  }
  res.json(item);
});

export const createInventoryItem = asyncHandler(async (req: Request, res: Response) => {
  const parsed = inventoryItemSchema.parse(req.body);
  const item = await InventoryItem.create(parsed);
  // Record initial stock as transaction (optional)
  if (parsed.quantity > 0) {
    await InventoryTransaction.create({
      item_id: item._id,
      type: 'in',
      quantity: parsed.quantity,
      date: new Date(),
      reference: 'Initial stock',
    });
  }
  res.status(201).json(item);
});

export const updateInventoryItem = asyncHandler(async (req: Request, res: Response) => {
  const parsed = inventoryItemSchema.partial().parse(req.body);
  const oldItem = await InventoryItem.findById(req.params.id);
  if (!oldItem) {
    res.status(404);
    throw new Error('Inventory item not found');
  }
  const item = await InventoryItem.findByIdAndUpdate(req.params.id, parsed, {
    new: true,
    runValidators: true,
  });
  // If quantity changed, record transaction
  if (parsed.quantity !== undefined && parsed.quantity !== oldItem.quantity) {
    const diff = parsed.quantity - oldItem.quantity;
    await InventoryTransaction.create({
      item_id: oldItem._id,
      type: diff > 0 ? 'in' : 'out',
      quantity: Math.abs(diff),
      date: new Date(),
      reference: 'Manual adjustment',
    });
  }
  res.json(item);
});

export const deleteInventoryItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await InventoryItem.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Inventory item not found');
  }
  await item.deleteOne();
  await InventoryTransaction.deleteMany({ item_id: item._id });
  res.json({ message: 'Inventory item removed' });
});

// Additional endpoint to record stock movement
export const recordStockMovement = asyncHandler(async (req: Request, res: Response) => {
  const { item_id, type, quantity, reference, notes } = req.body;
  const item = await InventoryItem.findById(item_id);
  if (!item) {
    res.status(404);
    throw new Error('Inventory item not found');
  }
  const newQuantity = type === 'in' ? item.quantity + quantity : item.quantity - quantity;
  if (newQuantity < 0) {
    res.status(400);
    throw new Error('Insufficient stock');
  }
  item.quantity = newQuantity;
  await item.save();

  const transaction = await InventoryTransaction.create({
    item_id,
    type,
    quantity,
    reference,
    notes,
    date: new Date(),
  });
  res.status(201).json({ item, transaction });
});