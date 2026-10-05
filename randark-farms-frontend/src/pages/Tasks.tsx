import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { taskService, farmService, fieldService } from '@/services/api';
import Table, { TableRow, TableCell } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/layout/PageHeader';
import { Plus, Search, Edit, Trash2, CheckCircle, CheckSquare, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/hooks/useToast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { formatDate } from '@/lib/utils';

const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'] as const;
type Priority = (typeof PRIORITIES)[number];

const STATUSES = ['Pending', 'In progress', 'Completed', 'Overdue', 'Cancelled'] as const;
type TaskStatus = (typeof STATUSES)[number];

const emptyForm = {
  title: '',
  description: '',
  farm_id: '',
  field_id: '',
  due_date: new Date().toISOString().split('T')[0],
  priority: 'Medium' as Priority,
  status: 'Pending' as TaskStatus,
  notes: '',
};

const Tasks: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [farmFilter, setFarmFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const { data: farms } = useQuery({
    queryKey: ['farms'],
    queryFn: () => farmService.getAll(),
  });

  const { data: allFields } = useQuery({
    queryKey: ['fields', 'all'],
    queryFn: () => fieldService.getAll(),
  });

  const { data: fieldsForFarm } = useQuery({
    queryKey: ['fields', form.farm_id],
    queryFn: () => fieldService.getAll({ farm_id: form.farm_id }),
    enabled: !!form.farm_id,
  });

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', debouncedSearch, farmFilter, statusFilter, priorityFilter],
    queryFn: () =>
      taskService.getAll({
        search: debouncedSearch,
        farm_id: farmFilter || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
      }),
  });

  const refreshTasks = () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await taskService.delete(deleteId);
      showToast('Task deleted');
      setDeleteId(null);
      refreshTasks();
    } catch (error) {
      showToast('Failed to delete task', 'error');
    }
  };

  const handleComplete = async (taskId: string) => {
    try {
      await taskService.complete(taskId);
      showToast('Task marked as completed');
      refreshTasks();
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || error?.message || 'Failed to complete task';
      console.error('COMPLETE TASK FAILED:', error?.response?.data || error);
      showToast(msg, 'error');
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm({ ...emptyForm, farm_id: farmFilter || '' });
    setShowModal(true);
  };

  const openEditModal = (task: any) => {
    const tid = task._id || task.id;
    const farmId =
      task.farm_id?._id || task.farm_id || task.farm?._id || task.farm?.id || '';
    const fieldId =
      task.field_id?._id || task.field_id || task.field?._id || task.field?.id || '';
    setEditingId(tid);
    setForm({
      title: task.title || '',
      description: task.description || '',
      farm_id: farmId,
      field_id: fieldId,
      due_date: task.due_date
        ? new Date(task.due_date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      priority: (task.priority as Priority) || 'Medium',
      status: (task.status as TaskStatus) || 'Pending',
      notes: task.notes || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showToast('Task title is required', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        title: form.title,
        due_date: form.due_date,
        priority: form.priority,
        status: form.status,
      };
      if (form.description) payload.description = form.description;
      if (form.farm_id) payload.farm_id = form.farm_id;
      if (form.field_id) payload.field_id = form.field_id;
      if (form.notes) payload.notes = form.notes;

      if (editingId) {
        await taskService.update(editingId, payload);
        showToast('Task updated');
      } else {
        await taskService.create(payload);
        showToast('Task created');
      }
      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
      refreshTasks();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || 'Failed to save task';
      console.error('SAVE TASK FAILED:', error?.response?.data || error);
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const getFarmName = (task: any) => {
    if (task.farm_id?.name) return task.farm_id.name;
    if (task.farm?.name) return task.farm.name;
    const id = task.farm_id?._id || task.farm_id || task.farm?._id;
    if (id && farms) {
      const match = farms.find((f: any) => (f._id || f.id) === id);
      if (match) return match.name;
    }
    return '-';
  };

  const getFieldName = (task: any) => {
    if (task.field_id?.name) return task.field_id.name;
    if (task.field?.name) return task.field.name;
    const id = task.field_id?._id || task.field_id || task.field?._id;
    if (id && allFields) {
      const match = allFields.find((f: any) => (f._id || f.id) === id);
      if (match) return match.name;
    }
    return '-';
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
      'Low': 'info',
      'Medium': 'success',
      'High': 'warning',
      'Urgent': 'danger',
    };
    return <Badge variant={variants[priority] || 'neutral'}>{priority}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
      'Pending': 'neutral',
      'In progress': 'info',
      'Completed': 'success',
      'Overdue': 'danger',
      'Cancelled': 'neutral',
    };
    return <Badge variant={variants[status] || 'neutral'}>{status}</Badge>;
  };

  return (
    <div>
      <PageHeader
        title="Tasks & Reminders"
        subtitle="Manage upcoming farm tasks"
        actionLabel="Add Task"
        onAction={openAddModal}
        icon={<Plus size={16} />}
      />

      <div className="flex gap-4 mb-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={16} />}
          />
        </div>
        <div className="w-40">
          <Select
            placeholder="All Farms"
            options={farms?.map((f: any) => ({ value: f._id || f.id, label: f.name })) || []}
            value={farmFilter}
            onChange={(e) => setFarmFilter(e.target.value)}
          />
        </div>
        <div className="w-40">
          <Select
            placeholder="All Statuses"
            options={[
              { value: 'Pending', label: 'Pending' },
              { value: 'In progress', label: 'In Progress' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Overdue', label: 'Overdue' },
              { value: 'Cancelled', label: 'Cancelled' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
        <div className="w-40">
          <Select
            placeholder="All Priorities"
            options={PRIORITIES.map((p) => ({ value: p, label: p }))}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : tasks && tasks.length > 0 ? (
        <Table headers={['Task', 'Farm', 'Field', 'Due Date', 'Priority', 'Status', 'Actions']}>
          {tasks.map((task: any) => (
            <TableRow key={task._id || task.id}>
              <TableCell className="font-medium">{task.title}</TableCell>
              <TableCell>{getFarmName(task)}</TableCell>
              <TableCell>{getFieldName(task)}</TableCell>
              <TableCell>{formatDate(task.due_date)}</TableCell>
              <TableCell>{getPriorityBadge(task.priority)}</TableCell>
              <TableCell>{getStatusBadge(task.status)}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {task.status !== 'Completed' && (
                    <button
                      onClick={() => handleComplete(task._id || task.id)}
                      className="text-green-600 hover:text-green-800"
                      title="Mark as complete"
                    >
                      <CheckCircle size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => openEditModal(task)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteId(task._id || task.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      ) : (
        <EmptyState
          icon={<CheckSquare size={40} />}
          title="No tasks created"
          description="Create tasks to stay on top of farm operations."
          actionLabel="Add Task"
          onAction={openAddModal}
        />
      )}

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4"
          onClick={() => !saving && setShowModal(false)}
        >
          <div
            className="my-8 w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingId ? 'Edit Task' : 'Add Task'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                disabled={saving}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Title *</label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Spray Block A"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="What needs to be done..."
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Farm</label>
                <Select
                  placeholder="Select a farm (optional)"
                  options={farms?.map((f: any) => ({ value: f._id || f.id, label: f.name })) || []}
                  value={form.farm_id}
                  onChange={(e) =>
                    setForm({ ...form, farm_id: e.target.value, field_id: '' })
                  }
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Field</label>
                <Select
                  placeholder={form.farm_id ? 'Select a field' : 'Select a farm first'}
                  options={
                    fieldsForFarm?.map((f: any) => ({
                      value: f._id || f.id,
                      label: f.name,
                    })) || []
                  }
                  value={form.field_id}
                  onChange={(e) => setForm({ ...form, field_id: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Due Date *</label>
                <Input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) =>
                      setForm({ ...form, priority: e.target.value as Priority })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value as TaskStatus })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="Optional details..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Update Task' : 'Create Task'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task?"
      />
    </div>
  );
};

export default Tasks;