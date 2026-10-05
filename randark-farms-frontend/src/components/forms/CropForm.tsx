import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { farmService, fieldService } from '@/services/api';

const cropSchema = z.object({
  farm_id: z.string().min(1, 'Farm is required'),
  field_id: z.string().min(1, 'Field is required'),
  name: z.string().min(1, 'Crop name is required'),
  variety: z.string().optional(),
  planting_date: z.string().optional(),
  expected_harvest_date: z.string().optional(),
  actual_harvest_date: z.string().optional(),
  area_planted: z.coerce.number().optional(),
  area_unit: z.string().optional(),
  quantity_planted: z.coerce.number().optional(),
  quantity_unit: z.string().optional(),
  status: z.string().default('Active'),
  notes: z.string().optional(),
});

type CropFormValues = z.infer<typeof cropSchema>;

interface CropFormProps {
  initialData?: Partial<CropFormValues>;
  onSubmit: (data: CropFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const CropForm: React.FC<CropFormProps> = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CropFormValues>({
    resolver: zodResolver(cropSchema),
    defaultValues: initialData || { status: 'Active' },
  });

  const selectedFarmId = watch('farm_id');
  const { data: farms } = useQuery({ queryKey: ['farms'], queryFn: () => farmService.getAll() });
  const { data: fields } = useQuery({
    queryKey: ['fields', selectedFarmId],
    queryFn: () => fieldService.getAll({ farm_id: selectedFarmId }),
    enabled: !!selectedFarmId,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Farm"
          options={farms?.map((f: any) => ({ value: f.id, label: f.name })) || []}
          {...register('farm_id')}
          error={errors.farm_id?.message}
        />
        <Select
          label="Field"
          options={fields?.map((f: any) => ({ value: f.id, label: f.name })) || []}
          {...register('field_id')}
          error={errors.field_id?.message}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Crop Name" placeholder="Pineapple, Maize, Cassava" {...register('name')} error={errors.name?.message} />
        <Input label="Variety" placeholder="Smooth Cayenne" {...register('variety')} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Input label="Planting Date" type="date" {...register('planting_date')} />
        <Input label="Expected Harvest" type="date" {...register('expected_harvest_date')} />
        <Input label="Actual Harvest" type="date" {...register('actual_harvest_date')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Area Planted" type="number" step="any" {...register('area_planted')} />
        <Input label="Quantity Planted" type="number" step="any" {...register('quantity_planted')} />
      </div>
      <Select
        label="Status"
        options={[
          { value: 'Active', label: 'Active' },
          { value: 'Harvested', label: 'Harvested' },
          { value: 'Failed', label: 'Failed' },
        ]}
        {...register('status')}
      />
      <Textarea label="Notes" rows={3} {...register('notes')} />

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>Save Crop</Button>
      </div>
    </form>
  );
};

export default CropForm;