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

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  farm_id: z.string().min(1, 'Farm is required'),
  field_id: z.string().optional(),
  task_type: z.string().optional(),
  due_date: z.string().min(1, 'Due date is required'),
  due_time: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).default('Medium'),
  status: z.enum(['Pending', 'In progress', 'Completed', 'Overdue', 'Cancelled']).default('Pending'),
  description: z.string().optional(),
  reminder: z.boolean().default(false),
  notes: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskFormProps {
  initialData?: Partial<TaskFormValues>;
  onSubmit: (data: TaskFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: initialData || { priority: 'Medium', status: 'Pending', reminder: false },
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
      <Input label="Task Title" {...register('title')} error={errors.title?.message} />
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
      <Input label="Task Type" placeholder="Fertilization, Spraying, Inspection" {...register('task_type')} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Due Date" type="date" {...register('due_date')} error={errors.due_date?.message} />
        <Input label="Due Time" type="time" {...register('due_time')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Priority"
          options={[
            { value: 'Low', label: 'Low' },
            { value: 'Medium', label: 'Medium' },
            { value: 'High', label: 'High' },
            { value: 'Urgent', label: 'Urgent' },
          ]}
          {...register('priority')}
        />
        <Select
          label="Status"
          options={[
            { value: 'Pending', label: 'Pending' },
            { value: 'In progress', label: 'In Progress' },
            { value: 'Completed', label: 'Completed' },
            { value: 'Overdue', label: 'Overdue' },
            { value: 'Cancelled', label: 'Cancelled' },
          ]}
          {...register('status')}
        />
      </div>
      <Textarea label="Description" rows={3} {...register('description')} />
      <Textarea label="Notes" rows={2} {...register('notes')} />

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>Save Task</Button>
      </div>
    </form>
  );
};

export default TaskForm;