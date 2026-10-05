import mongoose, { Schema, Document } from 'mongoose';

export interface ISprayingRecord extends Document {
  farm_id: mongoose.Types.ObjectId;
  field_id?: mongoose.Types.ObjectId;
  crop_id?: mongoose.Types.ObjectId;
  date: Date;
  product_name: string;
  active_ingredient?: string;
  purpose?: string;
  application_rate?: number;
  quantity_used: number;
  unit: string;
  water_volume?: number;
  applicator?: string;
  cost?: number;
  weather_conditions?: string;
  notes?: string;
  attachment?: string;
}

const sprayingSchema = new Schema<ISprayingRecord>(
  {
    farm_id: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    field_id: { type: Schema.Types.ObjectId, ref: 'Field' },
    crop_id: { type: Schema.Types.ObjectId, ref: 'Crop' },
    date: { type: Date, required: true, default: Date.now },
    product_name: { type: String, required: true },
    active_ingredient: String,
    purpose: String,
    application_rate: Number,
    quantity_used: { type: Number, required: true, min: 0 },
    unit: { type: String, default: 'litres' },
    water_volume: Number,
    applicator: String,
    cost: Number,
    weather_conditions: String,
    notes: String,
    attachment: String,
  },
  { timestamps: true }
);

sprayingSchema.index({ farm_id: 1, date: -1 });

export default mongoose.model<ISprayingRecord>('SprayingRecord', sprayingSchema);