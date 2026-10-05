import mongoose, { Schema, Document } from 'mongoose';

export interface IInventoryTransaction extends Document {
  item_id: mongoose.Types.ObjectId;
  type: 'in' | 'out';
  quantity: number;
  date: Date;
  reference?: string;
  notes?: string;
}

const inventoryTransactionSchema = new Schema<IInventoryTransaction>(
  {
    item_id: { type: Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
    type: { type: String, enum: ['in', 'out'], required: true },
    quantity: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    reference: String,
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model<IInventoryTransaction>('InventoryTransaction', inventoryTransactionSchema);