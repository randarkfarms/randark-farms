import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  farm_id: mongoose.Types.ObjectId;
  field_id?: mongoose.Types.ObjectId;
  date: Date;
  category: string;
  description: string;
  amount: number;
  payment_method: string;
  supplier_vendor?: string;
  reference_number?: string;
  receipt_attachment?: string;
  notes?: string;
}

const expenseSchema = new Schema<IExpense>(
  {
    farm_id: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    field_id: { type: Schema.Types.ObjectId, ref: 'Field' },
    date: { type: Date, required: true, default: Date.now },
    category: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    payment_method: { type: String, default: 'Cash' },
    supplier_vendor: String,
    reference_number: String,
    receipt_attachment: String,
    notes: String,
  },
  { timestamps: true }
);

expenseSchema.index({ farm_id: 1, date: -1, category: 1 });

export default mongoose.model<IExpense>('Expense', expenseSchema);