import mongoose, { Schema, Document } from 'mongoose';

export interface IInventoryItem extends Document {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minimum_stock_level: number;
  supplier?: string;
  purchase_price?: number;
  date_purchased?: Date;
  expiry_date?: Date;
  storage_location?: string;
  notes?: string;
}

const inventoryItemSchema = new Schema<IInventoryItem>(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    unit: { type: String, required: true },
    minimum_stock_level: { type: Number, default: 0, min: 0 },
    supplier: String,
    purchase_price: Number,
    date_purchased: Date,
    expiry_date: Date,
    storage_location: String,
    notes: String,
  },
  { timestamps: true }
);

inventoryItemSchema.index({ name: 'text', category: 'text' });

export default mongoose.model<IInventoryItem>('InventoryItem', inventoryItemSchema);