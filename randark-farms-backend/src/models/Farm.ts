import mongoose, { Schema, Document } from 'mongoose';

export interface IFarm extends Document {
  name: string;
  code?: string;
  location: string;
  region?: string;
  district?: string;
  community?: string;
  gps_coordinates?: string;
  total_area: number;
  area_unit: string;
  ownership_status?: string;
  description?: string;
  date_added: Date;
  notes?: string;
  boundary?: any;
}

const farmSchema = new Schema<IFarm>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, unique: true, sparse: true },
    location: { type: String, required: true },
    region: String,
    district: String,
    community: String,
    gps_coordinates: String,
    total_area: { type: Number, required: true, min: 0 },
    area_unit: { type: String, default: 'acres' },
    ownership_status: String,
    description: String,
    date_added: { type: Date, default: Date.now },
    notes: String,
    boundary: Schema.Types.Mixed,
  },
  { timestamps: true }
);

// Indexes
farmSchema.index({ name: 'text', location: 'text', code: 'text' });

export default mongoose.model<IFarm>('Farm', farmSchema);