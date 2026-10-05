import mongoose, { Schema, Document } from 'mongoose';

export interface IEquipmentMaintenance extends Document {
  equipment_id: mongoose.Types.ObjectId;
  date: Date;
  description: string;
  cost?: number;
  performed_by?: string;
  notes?: string;
}

const equipmentMaintenanceSchema = new Schema<IEquipmentMaintenance>(
  {
    equipment_id: { type: Schema.Types.ObjectId, ref: 'Equipment', required: true },
    date: { type: Date, required: true, default: Date.now },
    description: { type: String, required: true },
    cost: Number,
    performed_by: String,
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model<IEquipmentMaintenance>('EquipmentMaintenance', equipmentMaintenanceSchema);