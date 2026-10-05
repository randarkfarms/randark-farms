import mongoose, { Schema, Document } from 'mongoose';

export interface ISeason extends Document {
  name: string;
  start_date: Date;
  end_date: Date;
  description?: string;
  status: string;
}

const seasonSchema = new Schema<ISeason>(
  {
    name: { type: String, required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    description: String,
    status: { type: String, default: 'Active' },
  },
  { timestamps: true }
);

export default mongoose.model<ISeason>('Season', seasonSchema);