import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import { farmService, fieldService, cropService } from '@/services/api';

const activitySchema = z.object({
  farm_id: z.string().min(1, 'Farm is required'),
  field_id: z.string().optional(),
  crop_id: z.string().optional(),
  activity_type: z.string().min(1, 'Activity type is required'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().optional(),
  quantity: z.coerce.number().optional(),
  unit: z.string().optional(),
  cost: z.coerce.number().optional(),
  person_involved: z.string().optional(),
  weather_conditions: z.string().optional(),
  notes: z.string().optional(),
});

type ActivityFormValues = z.infer<typeof activitySchema>;

interface ActivityFormProps {
  initialData?: Partial<ActivityFormValues>;
  onSubmit: (data: ActivityFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const ActivityForm: React.FC<ActivityFormProps> = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: initialData || { date: new Date().toISOString().split('T')[0] },
  });

  const selectedFarmId = watch('farm_id');
  const { data: farms } = useQuery({ queryKey: ['farms'], queryFn: farmService.getAll });
  const { data: fields } = useQuery({
    queryKey: ['fields', selectedFarmId],
    queryFn: () => fieldService.getAll({ farm_id: selectedFarmId }),
    enabled: !!selectedFarmId,
  });
  const { data: crops } = useQuery({
    queryKey: ['crops', selectedFarmId],
    queryFn: () => cropService.getAll({ farm_id: selectedFarmId }),
    enabled: !!selectedFarmId,
  });

  const activityTypes = [
    'Land preparation',
    'Planting',
    'Weeding',
    'Fertilizer application',
    'Spraying',
    'Irrigation',
    'Pruning',
    'Mulching',
    'Harvesting',
    'Transportation',
    'Soil testing',
    'Inspection',
    'Maintenance',
    'Other',
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Select
        label="Activity Type"
        options={activityTypes.map((t) => ({ value: t, label: t }))}
        {...register('activity_type')}
        error={errors.activity_type?.message}
      />
      <Select
        label="Farm"
        options={farms?.map((f: any) => ({ value: f.id, label: f.name })) || []}
        {...register('farm_id')}
        error={errors.farm_id?.message}
      />
      <Select
        label="Field / Block"
        options={fields?.map((f: any) => ({ value: f.id, label: f.name })) || []}
        {...register('field_id')}
      />
      <Select
        label="Crop (optional)"
        options={crops?.map((c: any) => ({ value: c.id, label: c.name })) || []}
        {...register('crop_id')}
      />
      <Input label="Date" type="date" {...register('date')} error={errors.date?.message} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Quantity" type="number" step="any" {...register('quantity')} />
        <Input label="Unit" placeholder="e.g., litres, kg" {...register('unit')} />
      </div>
      <Input label="Cost (GH₵)" type="number" step="any" {...register('cost')} />
      <Input label="Person / Company" placeholder="Optional" {...register('person_involved')} />
      <Input label="Weather Conditions" placeholder="Optional" {...register('weather_conditions')} />
      <Textarea label="Description" rows={2} {...register('description')} />
      <Textarea label="Notes" rows={3} {...register('notes')} />

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Save Activity
        </Button>
      </div>
    </form>
  );
};

export default ActivityForm;