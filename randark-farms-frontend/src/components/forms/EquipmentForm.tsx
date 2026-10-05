import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';

const equipmentSchema = z.object({
  name: z.string().min(1, 'Equipment name is required'),
  equipment_id: z.string().min(1, 'Equipment ID is required'),
  type: z.string().min(1, 'Type is required'),
  brand: z.string().optional(),
  model: z.string().optional(),
  serial_number: z.string().optional(),
  purchase_date: z.string().optional(),
  purchase_price: z.coerce.number().optional(),
  condition: z.string().optional(),
  status: z.enum(['Available', 'In use', 'Under maintenance', 'Out of service']).default('Available'),
  notes: z.string().optional(),
});

type EquipmentFormValues = z.infer<typeof equipmentSchema>;

interface EquipmentFormProps {
  initialData?: Partial<EquipmentFormValues>;
  onSubmit: (data: EquipmentFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const EquipmentForm: React.FC<EquipmentFormProps> = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: initialData || { status: 'Available' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Equipment Name" {...register('name')} error={errors.name?.message} />
        <Input label="Equipment ID" placeholder="EQ-001" {...register('equipment_id')} error={errors.equipment_id?.message} />
      </div>
      <Select
        label="Type"
        options={[
          { value: 'Tractor', label: 'Tractor' },
          { value: 'Sprayer', label: 'Sprayer' },
          { value: 'Pump', label: 'Pump' },
          { value: 'Generator', label: 'Generator' },
          { value: 'Brush cutter', label: 'Brush Cutter' },
          { value: 'Vehicle', label: 'Vehicle' },
          { value: 'Tool', label: 'Tool' },
          { value: 'Other', label: 'Other' },
        ]}
        {...register('type')}
        error={errors.type?.message}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Brand" {...register('brand')} />
        <Input label="Model" {...register('model')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Serial Number" {...register('serial_number')} />
        <Input label="Condition" placeholder="New, Good, Fair" {...register('condition')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Purchase Date" type="date" {...register('purchase_date')} />
        <Input label="Purchase Price (GH₵)" type="number" step="any" {...register('purchase_price')} />
      </div>
      <Select
        label="Status"
        options={[
          { value: 'Available', label: 'Available' },
          { value: 'In use', label: 'In Use' },
          { value: 'Under maintenance', label: 'Under Maintenance' },
          { value: 'Out of service', label: 'Out of Service' },
        ]}
        {...register('status')}
      />
      <Textarea label="Notes" rows={3} {...register('notes')} />

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>Save Equipment</Button>
      </div>
    </form>
  );
};

export default EquipmentForm;