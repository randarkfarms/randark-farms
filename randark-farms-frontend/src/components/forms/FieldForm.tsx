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

const fieldSchema = z.object({
  farm_id: z.string().min(1, 'Farm is required'),
  name: z.string().min(1, 'Field name is required'),
  code: z.string().optional(),
  area: z.coerce.number().positive('Area must be positive'),
  area_unit: z.string().default('acres'),
  variety: z.string().optional(),
  planting_date: z.string().optional(),
  expected_harvest_date: z.string().optional(),
  number_of_plants: z.coerce.number().optional(),
  gps_location: z.string().optional(),
  status: z.enum(['Preparing', 'Planted', 'Growing', 'Ready for harvest', 'Harvested', 'Fallow']).default('Preparing'),
  notes: z.string().optional(),
});

type FieldFormValues = z.infer<typeof fieldSchema>;

interface FieldFormProps {
  initialData?: Partial<FieldFormValues>;
  onSubmit: (data: FieldFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const FieldForm: React.FC<FieldFormProps> = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldFormValues>({
    resolver: zodResolver(fieldSchema),
    defaultValues: initialData || { area_unit: 'acres', status: 'Preparing' },
  });

  const { data: farms } = useQuery({ queryKey: ['farms'], queryFn: () => farmService.getAll() });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Select
        label="Farm"
        options={farms?.map((f: any) => ({ value: f.id, label: f.name })) || []}
        {...register('farm_id')}
        error={errors.farm_id?.message}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Block Name" placeholder="Block A" {...register('name')} error={errors.name?.message} />
        <Input label="Block Code" placeholder="RF001-A" {...register('code')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Area" type="number" step="any" {...register('area')} error={errors.area?.message} />
        <Select
          label="Area Unit"
          options={[
            { value: 'acres', label: 'Acres' },
            { value: 'hectares', label: 'Hectares' },
          ]}
          {...register('area_unit')}
        />
      </div>
      <Input label="Variety" placeholder="Smooth Cayenne, MD2" {...register('variety')} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Planting Date" type="date" {...register('planting_date')} />
        <Input label="Expected Harvest Date" type="date" {...register('expected_harvest_date')} />
      </div>
      <Input label="Number of Plants" type="number" {...register('number_of_plants')} />
      <Input label="GPS Location" placeholder="Optional" {...register('gps_location')} />
      <Select
        label="Status"
        options={[
          { value: 'Preparing', label: 'Preparing' },
          { value: 'Planted', label: 'Planted' },
          { value: 'Growing', label: 'Growing' },
          { value: 'Ready for harvest', label: 'Ready for Harvest' },
          { value: 'Harvested', label: 'Harvested' },
          { value: 'Fallow', label: 'Fallow' },
        ]}
        {...register('status')}
      />
      <Textarea label="Notes" rows={3} {...register('notes')} />

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>Save Field</Button>
      </div>
    </form>
  );
};

export default FieldForm;