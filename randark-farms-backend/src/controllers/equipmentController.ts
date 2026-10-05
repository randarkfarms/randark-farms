import { Request, Response } from 'express';
import Equipment from '../models/Equipment';
import EquipmentMaintenance from '../models/EquipmentMaintenance';
import { asyncHandler } from '../utils/asyncHandler';
import { equipmentSchema } from '../utils/validators';

export const getEquipment = asyncHandler(async (req: Request, res: Response) => {
  const { type, status, search } = req.query;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  let query: any = {};
  if (type) query.type = type;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { equipment_id: { $regex: search, $options: 'i' } },
    ];
  }

  const equipment = await Equipment.find(query)
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Equipment.countDocuments(query);

  res.json({ data: equipment, page, pages: Math.ceil(total / limit), total });
});

export const getEquipmentById = asyncHandler(async (req: Request, res: Response) => {
  const equipment = await Equipment.findById(req.params.id);
  if (!equipment) {
    res.status(404);
    throw new Error('Equipment not found');
  }
  res.json(equipment);
});

export const createEquipment = asyncHandler(async (req: Request, res: Response) => {
  const parsed = equipmentSchema.parse(req.body);
  const equipment = await Equipment.create(parsed);
  res.status(201).json(equipment);
});

export const updateEquipment = asyncHandler(async (req: Request, res: Response) => {
  const parsed = equipmentSchema.partial().parse(req.body);
  const equipment = await Equipment.findByIdAndUpdate(req.params.id, parsed, {
    new: true,
    runValidators: true,
  });
  if (!equipment) {
    res.status(404);
    throw new Error('Equipment not found');
  }
  res.json(equipment);
});

export const deleteEquipment = asyncHandler(async (req: Request, res: Response) => {
  const equipment = await Equipment.findById(req.params.id);
  if (!equipment) {
    res.status(404);
    throw new Error('Equipment not found');
  }
  await equipment.deleteOne();
  await EquipmentMaintenance.deleteMany({ equipment_id: equipment._id });
  res.json({ message: 'Equipment removed' });
});

// Maintenance records
export const getMaintenanceRecords = asyncHandler(async (req: Request, res: Response) => {
  const { equipment_id } = req.query;
  let query: any = {};
  if (equipment_id) query.equipment_id = equipment_id;

  const records = await EquipmentMaintenance.find(query)
    .populate('equipment_id', 'name equipment_id')
    .sort('-date');
  res.json(records);
});

export const createMaintenanceRecord = asyncHandler(async (req: Request, res: Response) => {
  const { equipment_id, date, description, cost, performed_by, notes } = req.body;
  const equipment = await Equipment.findById(equipment_id);
  if (!equipment) {
    res.status(404);
    throw new Error('Equipment not found');
  }
  const record = await EquipmentMaintenance.create({
    equipment_id,
    date,
    description,
    cost,
    performed_by,
    notes,
  });

  // Update last_maintenance and next_maintenance (could be based on interval, but for now just set last)
  equipment.last_maintenance = date;
  await equipment.save();

  res.status(201).json(record);
});