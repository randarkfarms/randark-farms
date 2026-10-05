import mongoose, { Schema, Document } from 'mongoose';

export interface IHarvest extends Document {
  farm_id: mongoose.Types.ObjectId;
  field_id?: mongoose.Types.ObjectId;
  crop_id?: mongoose.Types.ObjectId;
  date: Date;
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
}

const harvestSchema = new Schema<IHarvest>(
  {
    farm_id: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    field_id: { type: Schema.Types.ObjectId, ref: 'Field' },
    crop_id: { type: Schema.Types.ObjectId, ref: 'Crop' },
    date: { type: Date, required: true, default: Date.now },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, default: 'kg' },
    quality_grade: String,
    estimated_quantity: Number,
    actual_quantity: Number,
    buyer: String,
    selling_price: Number,
    total_revenue: Number,
    transportation_cost: Number,
    other_costs: Number,
    notes: String,
    photos: [String],
  },
  { timestamps: true }
);

harvestSchema.index({ farm_id: 1, date: -1 });

export default mongoose.model<IHarvest>('Harvest', harvestSchema);