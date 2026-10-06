export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface Farm {
  id: string;
  name: string;
  code: string;
  location: string;
  region?: string;
  district?: string;
  community?: string;
  gps_coordinates?: string;
  total_area: number;
  area_unit: string;
  ownership_status?: string;
  description?: string;
  date_added: string;
  notes?: string;
  boundary?: any;
  created_at: string;
  updated_at: string;
}

export interface Field {
  id: string;
  farm_id: string;
  farm?: Farm;
  name: string;
  code: string;
  area: number;
  area_unit: string;
  crop_id?: string;
  crop?: Crop;
  variety?: string;
  planting_date?: string;
  expected_harvest_date?: string;
  number_of_plants?: number;
  gps_location?: string;
  boundary?: any;
  status: 'Preparing' | 'Planted' | 'Growing' | 'Ready for harvest' | 'Harvested' | 'Fallow';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Crop {
  id: string;
  farm_id: string;
  farm?: Farm;
  field_id: string;
  field?: Field;
  name: string;
  variety?: string;
  planting_date?: string;
  expected_harvest_date?: string;
  actual_harvest_date?: string;
  area_planted?: number;
  area_unit?: string;
  quantity_planted?: number;
  quantity_unit?: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  farm_id: string;
  farm?: Farm;
  field_id?: string;
  field?: Field;
  crop_id?: string;
  crop?: Crop;
  activity_type: string;
  date: string;
  description?: string;
  quantity?: number;
  unit?: string;
  cost?: number;
  person_involved?: string;
  weather_conditions?: string;
  notes?: string;
  attachments?: string[];
  created_at: string;
  updated_at: string;
}

export interface SprayingRecord {
  id: string;
  farm_id: string;
  farm?: Farm;
  field_id?: string;
  field?: Field;
  crop_id?: string;
  crop?: Crop;
  date: string;
  product_name: string;
  active_ingredient?: string;
  purpose: string;
  application_rate?: number;
  quantity_used: number;
  unit: string;
  water_volume?: number;
  applicator?: string;
  cost?: number;
  weather_conditions?: string;
  notes?: string;
  attachment?: string;
  created_at: string;
  updated_at: string;
}

export interface FertilizerRecord {
  id: string;
  farm_id: string;
  farm?: Farm;
  field_id?: string;
  field?: Field;
  crop_id?: string;
  crop?: Crop;
  date: string;
  fertilizer_name: string;
  fertilizer_type: string;
  quantity: number;
  unit: string;
  application_rate?: number;
  application_method?: string;
  cost?: number;
  supplier?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  farm_id: string;
  farm?: Farm;
  field_id?: string;
  field?: Field;
  date: string;
  category: string;
  description: string;
  amount: number;
  payment_method: string;
  supplier_vendor?: string;
  reference_number?: string;
  receipt_attachment?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Harvest {
  id: string;
  farm_id: string;
  farm?: Farm;
  field_id?: string;
  field?: Field;
  crop_id?: string;
  crop?: Crop;
  date: string;
  quantity: number;
  unit: string;
  quality_grade?: string;
  estimated_quantity?: number;
  actual_quantity?: number;
  buyer?: string;
  selling_price?: number;
  total_revenue?: number;
  transportation_cost?: number;
  other_costs?: number;
  notes?: string;
  photos?: string[];
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minimum_stock_level: number;
  supplier?: string;
  purchase_price?: number;
  date_purchased?: string;
  expiry_date?: string;
  storage_location?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryTransaction {
  id: string;
  item_id: string;
  type: 'in' | 'out';
  quantity: number;
  date: string;
  reference?: string;
  notes?: string;
  created_at: string;
}

export interface Equipment {
  id: string;
  name: string;
  equipment_id: string;
  type: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  purchase_date?: string;
  purchase_price?: number;
  condition: string;
  status: 'Available' | 'In use' | 'Under maintenance' | 'Out of service';
  last_maintenance?: string;
  next_maintenance?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface EquipmentMaintenance {
  id: string;
  equipment_id: string;
  equipment?: Equipment;
  date: string;
  description: string;
  cost?: number;
  performed_by?: string;
  notes?: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  farm_id: string;
  farm?: Farm;
  field_id?: string;
  field?: Field;
  crop_id?: string;
  crop?: Crop;
  task_type: string;
  due_date: string;
  due_time?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Pending' | 'In progress' | 'Completed' | 'Overdue' | 'Cancelled';
  description?: string;
  reminder?: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Season {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ReportFilters {
  start_date?: string;
  end_date?: string;
  farm_id?: string;
  field_id?: string;
  crop_id?: string;
}

export interface FarmSummary {
  total_farms: number;
  total_fields?: number;
  total_area: number;
  active_crops: number;
  monthly_expenses: number;
  upcoming_tasks: number;
  overdue_tasks?: number;
  low_stock_items: number;
}

export interface DashboardData {
  summary: FarmSummary;
  upcoming_tasks: Task[];
  recent_activities: Activity[];
  expenses_by_month: { month: string; total: number }[];
  expenses_by_category: { category: string; total: number }[];   // ← added
  harvest_by_month: { month: string; quantity: number }[];
  inventory_alerts: InventoryItem[];
}

// ============ AUTH TYPES ============
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'admin';
}

export interface AuthResponse {
  token: string;
  user: User;
}
// ===================================

// ============ API UTILITY TYPES ============
export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
// ==========================================