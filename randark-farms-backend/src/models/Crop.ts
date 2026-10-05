import mongoose, { Schema, Document } from 'mongoose';

export interface ICrop extends Document {
  farm_id: mongoose.Types.ObjectId;
  field_id: mongoose.Types.ObjectId;
  name: string;
  variety?: string;
  planting_date?: Date;
  expected_harvest_date?: Date;
  actual_harvest_date?: Date;
  area_planted?: number;
  area_unit?: string;
  quantity_planted?: number;
  quantity_unit?: string;
  status: string;
  notes?: string;
}

const cropSchema = new Schema<ICrop>(
  {
    farm_id: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    field_id: { type: Schema.Types.ObjectId, ref: 'Field', required: true },
    name: { type: String, required: true },
    variety: String,
    planting_date: Date,
    expected_harvest_date: Date,
    actual_harvest_date: Date,
    area_planted: Number,
    area_unit: String,
    quantity_planted: Number,
    quantity_unit: String,
    status: { type: String, default: 'Active' },
    notes: String,
  },
  { timestamps: true }
);

cropSchema.index({ farm_id: 1, field_id: 1 });

export default mongoose.model<ICrop>('Crop', cropSchema);