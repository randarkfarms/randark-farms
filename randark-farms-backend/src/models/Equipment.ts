import mongoose, { Schema, Document } from 'mongoose';

export interface IEquipment extends Document {
  name: string;
  equipment_id: string;
  type: string;
  brand?: string;
  vehicleModel?: string;
  serial_number?: string;
  purchase_date?: Date;
  purchase_price?: number;
  condition?: string;
  status: string;
  last_maintenance?: Date;
  next_maintenance?: Date;
  notes?: string;
}

const equipmentSchema = new Schema<IEquipment>(
  {
    name: { type: String, required: true },
    equipment_id: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    brand: String,
    vehicleModel: String,
    serial_number: String,
    purchase_date: Date,
    purchase_price: Number,
    condition: String,
    status: {
      type: String,
      enum: ['Available', 'In use', 'Under maintenance', 'Out of service'],
      default: 'Available',
    },
    last_maintenance: Date,
    next_maintenance: Date,
    notes: String,
  },
  { timestamps: true }
);

const Equipment = mongoose.model<IEquipment>('Equipment', equipmentSchema);

export default Equipment;