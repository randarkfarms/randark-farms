import mongoose, { Schema, Document } from 'mongoose';

export interface IFertilizerRecord extends Document {
  farm_id: mongoose.Types.ObjectId;
  field_id?: mongoose.Types.ObjectId;
  crop_id?: mongoose.Types.ObjectId;
  date: Date;
  fertilizer_name: string;
  fertilizer_type?: string;
  quantity: number;
  unit: string;
  application_rate?: number;
  application_method?: string;
  cost?: number;
  supplier?: string;
  notes?: string;
}

const fertilizerSchema = new Schema<IFertilizerRecord>(
  {
    farm_id: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    field_id: { type: Schema.Types.ObjectId, ref: 'Field' },
    crop_id: { type: Schema.Types.ObjectId, ref: 'Crop' },
    date: { type: Date, required: true, default: Date.now },
    fertilizer_name: { type: String, required: true },
    fertilizer_type: String,
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, default: 'kg' },
    application_rate: Number,
    application_method: String,
    cost: Number,
    supplier: String,
    notes: String,
  },
  { timestamps: true }
);

fertilizerSchema.index({ farm_id: 1, date: -1 });

export default mongoose.model<IFertilizerRecord>('FertilizerRecord', fertilizerSchema);