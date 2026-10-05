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

const fertilizerSchema = z.object({
  farm_id: z.string().min(1, 'Farm is required'),
  field_id: z.string().optional(),
  crop_id: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  fertilizer_name: z.string().min(1, 'Fertilizer name is required'),
  fertilizer_type: z.string().optional(),
  quantity: z.coerce.number().positive('Quantity must be positive'),
  unit: z.string().default('kg'),
  application_rate: z.coerce.number().optional(),
  application_method: z.string().optional(),
  cost: z.coerce.number().optional(),
  supplier: z.string().optional(),
  notes: z.string().optional(),
});

type FertilizerFormValues = z.infer<typeof fertilizerSchema>;

interface FertilizerFormProps {
  initialData?: Partial<FertilizerFormValues>;
  onSubmit: (data: FertilizerFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const FertilizerForm: React.FC<FertilizerFormProps> = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FertilizerFormValues>({
    resolver: zodResolver(fertilizerSchema),
    defaultValues: initialData || { date: new Date().toISOString().split('T')[0], unit: 'kg' },
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
      <div className="grid grid-cols-2 gap-4">
        <Input label="Fertilizer Name" placeholder="NPK, Urea, Compost" {...register('fertilizer_name')} error={errors.fertilizer_name?.message} />
        <Input label="Type" placeholder="Organic, Inorganic, Foliar" {...register('fertilizer_type')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Quantity" type="number" step="any" {...register('quantity')} error={errors.quantity?.message} />
        <Select
          label="Unit"
          options={[
            { value: 'kg', label: 'Kilograms' },
            { value: 'litres', label: 'Litres' },
            { value: 'bags', label: 'Bags' },
          ]}
          {...register('unit')}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Application Rate" type="number" step="any" {...register('application_rate')} />
        <Input label="Application Method" placeholder="Broadcast, Foliar, Drip" {...register('application_method')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Cost (GH₵)" type="number" step="any" {...register('cost')} />
        <Input label="Supplier" {...register('supplier')} />
      </div>
      <Textarea label="Notes" rows={3} {...register('notes')} />

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>Save Fertilizer Record</Button>
      </div>
    </form>
  );
};

export default FertilizerForm;