import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { farmService, fieldService, cropService } from '@/services/api';

const harvestSchema = z.object({
  farm_id: z.string().min(1, 'Farm is required'),
  field_id: z.string().optional(),
  crop_id: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  quantity: z.coerce.number().positive('Quantity must be positive'),
  unit: z.string().default('kg'),
  quality_grade: z.string().optional(),
  buyer: z.string().optional(),
  selling_price: z.coerce.number().optional(),
  transportation_cost: z.coerce.number().optional(),
  other_costs: z.coerce.number().optional(),
  notes: z.string().optional(),
});

type HarvestFormValues = z.infer<typeof harvestSchema>;

interface HarvestFormProps {
  initialData?: Partial<HarvestFormValues>;
  onSubmit: (data: HarvestFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const HarvestForm: React.FC<HarvestFormProps> = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<HarvestFormValues>({
    resolver: zodResolver(harvestSchema),
    defaultValues: initialData || { date: new Date().toISOString().split('T')[0], unit: 'kg' },
  });

  const selectedFarmId = watch('farm_id');
  const { data: farms } = useQuery({ queryKey: ['farms'], queryFn: () => farmService.getAll() });
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Date" type="date" {...register('date')} error={errors.date?.message} />
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
        />
      </div>
      <Select
        label="Crop"
        options={crops?.map((c: any) => ({ value: c.id, label: c.name })) || []}
        {...register('crop_id')}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Quantity" type="number" step="any" {...register('quantity')} error={errors.quantity?.message} />
        <Select
          label="Unit"
          options={[
            { value: 'kg', label: 'Kilograms' },
            { value: 'tonnes', label: 'Tonnes' },
            { value: 'crates', label: 'Crates' },
            { value: 'bags', label: 'Bags' },
            { value: 'pieces', label: 'Pieces' },
          ]}
          {...register('unit')}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Quality Grade" placeholder="A, B, C" {...register('quality_grade')} />
        <Input label="Buyer" {...register('buyer')} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Input label="Selling Price (GH₵)" type="number" step="any" {...register('selling_price')} />
        <Input label="Transport Cost (GH₵)" type="number" step="any" {...register('transportation_cost')} />
        <Input label="Other Costs (GH₵)" type="number" step="any" {...register('other_costs')} />
      </div>
      <Textarea label="Notes" rows={3} {...register('notes')} />

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>Save Harvest</Button>
      </div>
    </form>
  );
};

export default HarvestForm;