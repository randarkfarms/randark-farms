import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
  farm_id: mongoose.Types.ObjectId;
  field_id?: mongoose.Types.ObjectId;
  crop_id?: mongoose.Types.ObjectId;
  activity_type: string;
  date: Date;
  description?: string;
  quantity?: number;
  unit?: string;
  cost?: number;
  person_involved?: string;
  weather_conditions?: string;
  notes?: string;
  attachments?: string[];
}

const activitySchema = new Schema<IActivity>(
  {
    farm_id: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    field_id: { type: Schema.Types.ObjectId, ref: 'Field' },
    crop_id: { type: Schema.Types.ObjectId, ref: 'Crop' },
    activity_type: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    description: String,
    quantity: Number,
    unit: String,
    cost: Number,
    person_involved: String,
    weather_conditions: String,
    notes: String,
    attachments: [String],
  },
  { timestamps: true }
);

activitySchema.index({ farm_id: 1, date: -1, activity_type: 1 });

export default mongoose.model<IActivity>('Activity', activitySchema);