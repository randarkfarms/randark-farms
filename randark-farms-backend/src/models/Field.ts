import mongoose, { Schema, Document } from 'mongoose';

export interface IField extends Document {
  farm_id: mongoose.Types.ObjectId;
  name: string;
  code?: string;
  area: number;
  area_unit: string;
  crop_id?: mongoose.Types.ObjectId;
  variety?: string;
  planting_date?: Date;
  expected_harvest_date?: Date;
  number_of_plants?: number;
  gps_location?: string;
  boundary?: any;
  status: string;
  notes?: string;
}

const fieldSchema = new Schema<IField>(
  {
    farm_id: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    name: { type: String, required: true, trim: true },
    code: { type: String },
    area: { type: Number, required: true, min: 0 },
    area_unit: { type: String, default: 'acres' },
    crop_id: { type: Schema.Types.ObjectId, ref: 'Crop' },
    variety: String,
    planting_date: Date,
    expected_harvest_date: Date,
    number_of_plants: Number,
    gps_location: String,
    boundary: Schema.Types.Mixed,
    status: {
      type: String,
      enum: ['Preparing', 'Planted', 'Growing', 'Ready for harvest', 'Harvested', 'Fallow'],
      default: 'Preparing',
    },
    notes: String,
  },
  { timestamps: true }
);

fieldSchema.index({ farm_id: 1, name: 1 });

export default mongoose.model<IField>('Field', fieldSchema);