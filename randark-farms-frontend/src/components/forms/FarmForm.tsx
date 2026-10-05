import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';

const farmSchema = z.object({
  name: z.string().min(1, 'Farm name is required'),
  code: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  region: z.string().optional(),
  district: z.string().optional(),
  community: z.string().optional(),
  gps_coordinates: z.string().optional(),
  total_area: z.coerce.number().positive('Area must be positive'),
  area_unit: z.string().default('acres'),
  ownership_status: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
});

type FarmFormValues = z.infer<typeof farmSchema>;

interface FarmFormProps {
  initialData?: Partial<FarmFormValues>;
  onSubmit: (data: FarmFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const FarmForm: React.FC<FarmFormProps> = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FarmFormValues>({
    resolver: zodResolver(farmSchema),
    defaultValues: initialData || { area_unit: 'acres' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Farm Name" {...register('name')} error={errors.name?.message} />
        <Input label="Farm Code" placeholder="RF-001" {...register('code')} error={errors.code?.message} />
      </div>
      <Input label="Location" {...register('location')} error={errors.location?.message} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Region" {...register('region')} />
        <Input label="District" {...register('district')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Community" {...register('community')} />
        <Input label="GPS Coordinates" placeholder="5.6037° N, 0.1870° W" {...register('gps_coordinates')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Total Area" type="number" step="any" {...register('total_area')} error={errors.total_area?.message} />
        <Select
          label="Area Unit"
          options={[
            { value: 'acres', label: 'Acres' },
            { value: 'hectares', label: 'Hectares' },
            { value: 'sq_meters', label: 'Square Meters' },
          ]}
          {...register('area_unit')}
        />
      </div>
      <Input label="Ownership Status" placeholder="Owned / Leased / Rented" {...register('ownership_status')} />
      <Textarea label="Description" rows={3} {...register('description')} />
      <Textarea label="Notes" rows={2} {...register('notes')} />

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>Save Farm</Button>
      </div>
    </form>
  );
};

export default FarmForm;