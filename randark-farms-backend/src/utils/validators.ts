import { z } from 'zod';

// ─── Date helpers ─────────────────────────────────────
// Coerce ISO date strings → Date objects.
// Empty strings / null / undefined → undefined (so .optional() works).
const optionalDate = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? undefined : v),
  z.coerce.date().optional()
);

const requiredDate = (message = 'Date is required') =>
  z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : v),
    z.coerce.date({ required_error: message, invalid_type_error: message })
  );

// ─── Farm ─────────────────────────────────────────────
export const farmSchema = z.object({
  name: z.string().min(1, 'Farm name is required'),
  code: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  region: z.string().optional(),
  district: z.string().optional(),
  community: z.string().optional(),
  gps_coordinates: z.string().optional(),
  total_area: z.number().positive('Area must be positive'),
  area_unit: z.string().default('acres'),
  ownership_status: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  boundary: z.any().optional(),
});

// ─── Field ────────────────────────────────────────────
export const fieldSchema = z.object({
  farm_id: z.string().min(1, 'Farm is required'),
  name: z.string().min(1, 'Field name is required'),
  code: z.string().optional(),
  area: z.number().positive('Area must be positive'),
  area_unit: z.string().default('acres'),
  crop_id: z.string().optional(),
  variety: z.string().optional(),
  planting_date: optionalDate,
  expected_harvest_date: optionalDate,
  number_of_plants: z.number().optional(),
  gps_location: z.string().optional(),
  boundary: z.any().optional(),
  status: z
    .enum(['Preparing', 'Planted', 'Growing', 'Ready for harvest', 'Harvested', 'Fallow'])
    .default('Preparing'),
  notes: z.string().optional(),
});

// ─── Crop ─────────────────────────────────────────────
export const cropSchema = z.object({
  farm_id: z.string().min(1, 'Farm is required'),
  field_id: z.string().min(1, 'Field is required'),
  name: z.string().min(1, 'Crop name is required'),
  variety: z.string().optional(),
  planting_date: optionalDate,
  expected_harvest_date: optionalDate,
  actual_harvest_date: optionalDate,
  area_planted: z.number().optional(),
  area_unit: z.string().optional(),
  quantity_planted: z.number().optional(),
  quantity_unit: z.string().optional(),
  status: z.string().default('Active'),
  notes: z.string().optional(),
});

// ─── Activity ─────────────────────────────────────────
export const activitySchema = z.object({
  farm_id: z.string().min(1, 'Farm is required'),
  field_id: z.string().optional(),
  crop_id: z.string().optional(),
  activity_type: z.string().min(1, 'Activity type is required'),
  date: requiredDate('Date is required'),
  description: z.string().optional(),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  cost: z.number().optional(),
  person_involved: z.string().optional(),
  weather_conditions: z.string().optional(),
  notes: z.string().optional(),
  attachments: z.array(z.string()).optional(),
});

// ─── Spraying ─────────────────────────────────────────
export const sprayingSchema = z.object({
  farm_id: z.string().min(1, 'Farm is required'),
  field_id: z.string().optional(),
  crop_id: z.string().optional(),
  date: requiredDate('Date is required'),
  product_name: z.string().min(1, 'Product name is required'),
  active_ingredient: z.string().optional(),
  purpose: z.string().optional(),
  application_rate: z.number().optional(),
  quantity_used: z.number().positive('Quantity must be positive'),
  unit: z.string().default('litres'),
  water_volume: z.number().optional(),
  applicator: z.string().optional(),
  cost: z.number().optional(),
  weather_conditions: z.string().optional(),
  notes: z.string().optional(),
  attachment: z.string().optional(),
});

// ─── Fertilizer ───────────────────────────────────────
export const fertilizerSchema = z.object({
  farm_id: z.string().min(1, 'Farm is required'),
  field_id: z.string().optional(),
  crop_id: z.string().optional(),
  date: requiredDate('Date is required'),
  fertilizer_name: z.string().min(1, 'Fertilizer name is required'),
  fertilizer_type: z.string().optional(),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().default('kg'),
  application_rate: z.number().optional(),
  application_method: z.string().optional(),
  cost: z.number().optional(),
  supplier: z.string().optional(),
  notes: z.string().optional(),
});

// ─── Expense ──────────────────────────────────────────
export const expenseSchema = z.object({
  farm_id: z.string().min(1, 'Farm is required'),
  field_id: z.string().optional(),
  date: requiredDate('Date is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().positive('Amount must be positive'),
  payment_method: z.string().default('Cash'),
  supplier_vendor: z.string().optional(),
  reference_number: z.string().optional(),
  receipt_attachment: z.string().optional(),
  notes: z.string().optional(),
});

// ─── Harvest ──────────────────────────────────────────
export const harvestSchema = z.object({
  farm_id: z.string().min(1, 'Farm is required'),
  field_id: z.string().optional(),
  crop_id: z.string().optional(),
  date: requiredDate('Date is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().default('kg'),
  quality_grade: z.string().optional(),
  estimated_quantity: z.number().optional(),
  actual_quantity: z.number().optional(),
  buyer: z.string().optional(),
  selling_price: z.number().optional(),
  total_revenue: z.number().optional(),
  transportation_cost: z.number().optional(),
  other_costs: z.number().optional(),
  notes: z.string().optional(),
  photos: z.array(z.string()).optional(),
});

// ─── Inventory ────────────────────────────────────────
export const inventoryItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  category: z.string().min(1, 'Category is required'),
  quantity: z.number().min(0, 'Quantity cannot be negative'),
  unit: z.string().min(1, 'Unit is required'),
  minimum_stock_level: z.number().min(0).default(0),
  supplier: z.string().optional(),
  purchase_price: z.number().optional(),
  date_purchased: optionalDate,
  expiry_date: optionalDate,
  storage_location: z.string().optional(),
  notes: z.string().optional(),
});

// ─── Equipment ────────────────────────────────────────
export const equipmentSchema = z.object({
  name: z.string().min(1, 'Equipment name is required'),
  equipment_id: z.string().min(1, 'Equipment ID is required'),
  type: z.string().min(1, 'Type is required'),
  brand: z.string().optional(),
  model: z.string().optional(),
  serial_number: z.string().optional(),
  purchase_date: optionalDate,
  purchase_price: z.number().optional(),
  condition: z.string().optional(),
  status: z
    .enum(['Available', 'In use', 'Under maintenance', 'Out of service'])
    .default('Available'),
  last_maintenance: optionalDate,
  next_maintenance: optionalDate,
  notes: z.string().optional(),
});

// ─── Task ─────────────────────────────────────────────
export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  farm_id: z.string().min(1, 'Farm is required'),
  field_id: z.string().optional(),
  crop_id: z.string().optional(),
  task_type: z.string().optional(),
  due_date: requiredDate('Due date is required'),
  due_time: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).default('Medium'),
  status: z
    .enum(['Pending', 'In progress', 'Completed', 'Overdue', 'Cancelled'])
    .default('Pending'),
  description: z.string().optional(),
  reminder: z.boolean().default(false),
  notes: z.string().optional(),
});

// ─── Auth ─────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});