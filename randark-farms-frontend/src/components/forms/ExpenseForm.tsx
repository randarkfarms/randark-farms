import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { farmService } from '@/services/api';

const expenseSchema = z.object({
  farm_id: z.string().min(1, 'Farm is required'),
  field_id: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  payment_method: z.string().default('Cash'),
  supplier_vendor: z.string().optional(),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  initialData?: Partial<ExpenseFormValues>;
  onSubmit: (data: ExpenseFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: initialData || { date: new Date().toISOString().split('T')[0], payment_method: 'Cash' },
  });

  const { data: farms } = useQuery({ queryKey: ['farms'], queryFn: () => farmService.getAll() });

  const categories = [
    'Fertilizer', 'Chemicals', 'Seeds', 'Labour', 'Fuel', 'Transport',
    'Machinery', 'Repairs', 'Irrigation', 'Equipment', 'Packaging',
    'Land preparation', 'Other',
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Date" type="date" {...register('date')} error={errors.date?.message} />
      <Select
        label="Farm"
        options={farms?.map((f: any) => ({ value: f.id, label: f.name })) || []}
        {...register('farm_id')}
        error={errors.farm_id?.message}
      />
      <Select
        label="Category"
        options={categories.map((c) => ({ value: c, label: c }))}
        {...register('category')}
        error={errors.category?.message}
      />
      <Input label="Description" {...register('description')} error={errors.description?.message} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Amount (GH₵)" type="number" step="any" {...register('amount')} error={errors.amount?.message} />
        <Select
          label="Payment Method"
          options={[
            { value: 'Cash', label: 'Cash' },
            { value: 'Bank Transfer', label: 'Bank Transfer' },
            { value: 'Mobile Money', label: 'Mobile Money' },
            { value: 'Cheque', label: 'Cheque' },
          ]}
          {...register('payment_method')}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Supplier/Vendor" {...register('supplier_vendor')} />
        <Input label="Reference Number" {...register('reference_number')} />
      </div>
      <Textarea label="Notes" rows={3} {...register('notes')} />

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>Save Expense</Button>
      </div>
    </form>
  );
};

export default ExpenseForm;