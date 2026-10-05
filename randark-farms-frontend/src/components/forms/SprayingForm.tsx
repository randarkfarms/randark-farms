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

const sprayingSchema = z.object({
  farm_id: z.string().min(1, 'Farm is required'),
  field_id: z.string().optional(),
  crop_id: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  product_name: z.string().min(1, 'Product name is required'),
  active_ingredient: z.string().optional(),
  purpose: z.string().optional(),
  application_rate: z.coerce.number().optional(),
  quantity_used: z.coerce.number().positive('Quantity must be positive'),
  unit: z.string().default('litres'),
  water_volume: z.coerce.number().optional(),
  applicator: z.string().optional(),
  cost: z.coerce.number().optional(),
  weather_conditions: z.string().optional(),
  notes: z.string().optional(),
});

type SprayingFormValues = z.infer<typeof sprayingSchema>;

interface SprayingFormProps {
  initialData?: Partial<SprayingFormValues>;
  onSubmit: (data: SprayingFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const SprayingForm: React.FC<SprayingFormProps> = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SprayingFormValues>({
    resolver: zodResolver(sprayingSchema),
    defaultValues: initialData || { date: new Date().toISOString().split('T')[0], unit: 'litres' },
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
      <Input label="Date" type="date" {...register('date')} error={errors.date?.message} />
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
      />
      <Input label="Product/Chemical Name" {...register('product_name')} error={errors.product_name?.message} />
      <Input label="Active Ingredient" {...register('active_ingredient')} />
      <Input label="Purpose" placeholder="Pest control, Disease control, Weed control" {...register('purpose')} />
      <div className="grid grid-cols-3 gap-4">
        <Input label="Quantity Used" type="number" step="any" {...register('quantity_used')} error={errors.quantity_used?.message} />
        <Select
          label="Unit"
          options={[
            { value: 'litres', label: 'Litres' },
            { value: 'ml', label: 'Millilitres' },
            { value: 'kg', label: 'Kilograms' },
          ]}
          {...register('unit')}
        />
        <Input label="Water Volume (L)" type="number" step="any" {...register('water_volume')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Applicator" {...register('applicator')} />
        <Input label="Cost (GH₵)" type="number" step="any" {...register('cost')} />
      </div>
      <Input label="Weather Conditions" placeholder="Sunny, Cloudy, Windy" {...register('weather_conditions')} />
      <Textarea label="Notes" rows={3} {...register('notes')} />

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>Save Spraying Record</Button>
      </div>
    </form>
  );
};

export default SprayingForm;