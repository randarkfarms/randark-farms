import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  title: string;
  farm_id: mongoose.Types.ObjectId;
  field_id?: mongoose.Types.ObjectId;
  crop_id?: mongoose.Types.ObjectId;
  task_type?: string;
  due_date: Date;
  due_time?: string;
  priority: string;
  status: string;
  description?: string;
  reminder: boolean;
  notes?: string;
}

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    farm_id: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    field_id: { type: Schema.Types.ObjectId, ref: 'Field' },
    crop_id: { type: Schema.Types.ObjectId, ref: 'Crop' },
    task_type: String,
    due_date: { type: Date, required: true },
    due_time: String,
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
    status: { type: String, enum: ['Pending', 'In progress', 'Completed', 'Overdue', 'Cancelled'], default: 'Pending' },
    description: String,
    reminder: { type: Boolean, default: false },
    notes: String,
  },
  { timestamps: true }
);

taskSchema.index({ due_date: 1, status: 1 });

export default mongoose.model<ITask>('Task', taskSchema);