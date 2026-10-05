import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';

const inventoryItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  category: z.string().min(1, 'Category is required'),
  quantity: z.coerce.number().min(0, 'Quantity cannot be negative'),
  unit: z.string().min(1, 'Unit is required'),
  minimum_stock_level: z.coerce.number().min(0).default(0),
  supplier: z.string().optional(),
  purchase_price: z.coerce.number().optional(),
  date_purchased: z.string().optional(),
  expiry_date: z.string().optional(),
  storage_location: z.string().optional(),
  notes: z.string().optional(),
});

type InventoryItemFormValues = z.infer<typeof inventoryItemSchema>;

interface InventoryItemFormProps {
  initialData?: Partial<InventoryItemFormValues>;
  onSubmit: (data: InventoryItemFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const InventoryItemForm: React.FC<InventoryItemFormProps> = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InventoryItemFormValues>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: initialData || { minimum_stock_level: 0 },
  });

  const categories = ['Fertilizer', 'Chemical', 'Seed', 'Packaging', 'Spare part', 'Farm supply', 'Other'];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Item Name" {...register('name')} error={errors.name?.message} />
        <Select
          label="Category"
          options={categories.map((c) => ({ value: c, label: c }))}
          {...register('category')}
          error={errors.category?.message}
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Input label="Quantity" type="number" step="any" {...register('quantity')} error={errors.quantity?.message} />
        <Input label="Unit" placeholder="kg, litres, bags" {...register('unit')} error={errors.unit?.message} />
        <Input label="Min Stock Level" type="number" step="any" {...register('minimum_stock_level')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Supplier" {...register('supplier')} />
        <Input label="Purchase Price (GH₵)" type="number" step="any" {...register('purchase_price')} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Input label="Date Purchased" type="date" {...register('date_purchased')} />
        <Input label="Expiry Date" type="date" {...register('expiry_date')} />
        <Input label="Storage Location" {...register('storage_location')} />
      </div>
      <Textarea label="Notes" rows={3} {...register('notes')} />

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>Save Item</Button>
      </div>
    </form>
  );
};

export default InventoryItemForm;