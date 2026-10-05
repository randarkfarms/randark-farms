import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { activityService, farmService, fieldService } from '@/services/api';
import Table, { TableRow, TableCell } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/layout/PageHeader';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/hooks/useToast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { formatDate, formatCurrency } from '@/lib/utils';

const ACTIVITY_TYPES = [
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
] as const;

type ActivityType = (typeof ACTIVITY_TYPES)[number];

const emptyForm = {
  date: new Date().toISOString().split('T')[0],
  activity_type: 'Weeding' as ActivityType,
  farm_id: '',
  field_id: '',
  cost: '',
  notes: '',
};

const Activities: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [farmFilter, setFarmFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
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

  const { data: activities, isLoading, refetch } = useQuery({
    queryKey: ['activities', debouncedSearch, farmFilter, typeFilter],
    queryFn: () =>
      activityService.getAll({
        search: debouncedSearch,
        farm_id: farmFilter || undefined,
        activity_type: typeFilter || undefined,
      }),
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await activityService.delete(deleteId);
      showToast('Activity deleted successfully');
      setDeleteId(null);
      refetch();
    } catch (error) {
      showToast('Failed to delete activity', 'error');
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm({ ...emptyForm, farm_id: farmFilter || '' });
    setShowModal(true);
  };

  const openEditModal = (activity: any) => {
    const aid = activity._id || activity.id;
    const farmId =
      activity.farm_id?._id || activity.farm_id || activity.farm?._id || activity.farm?.id || '';
    const fieldId =
      activity.field_id?._id || activity.field_id || activity.field?._id || activity.field?.id || '';
    setEditingId(aid);
    setForm({
      date: activity.date
        ? new Date(activity.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      activity_type: (activity.activity_type as ActivityType) || 'Other',
      farm_id: farmId,
      field_id: fieldId,
      cost: activity.cost != null ? String(activity.cost) : '',
      notes: activity.notes || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.farm_id) {
      showToast('Please select a farm', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        date: form.date,
        activity_type: form.activity_type,
        farm_id: form.farm_id,
      };
      if (form.field_id) payload.field_id = form.field_id;
      if (form.cost !== '') payload.cost = Number(form.cost) || 0;
      if (form.notes) payload.notes = form.notes;

      if (editingId) {
        await activityService.update(editingId, payload);
        showToast('Activity updated successfully');
      } else {
        await activityService.create(payload);
        showToast('Activity added successfully');
      }
      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
      refetch();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || 'Failed to save activity';
      console.error('SAVE ACTIVITY FAILED:', error?.response?.data || error);
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const getFarmName = (activity: any) => {
    if (activity.farm?.name) return activity.farm.name;
    const id = activity.farm_id?._id || activity.farm_id || activity.farm?._id;
    if (id && farms) {
      const match = farms.find((f: any) => (f._id || f.id) === id);
      if (match) return match.name;
    }
    return '-';
  };

  const getFieldName = (activity: any) => {
    if (activity.field?.name) return activity.field.name;
    const id = activity.field_id?._id || activity.field_id || activity.field?._id;
    if (id && allFields) {
      const match = allFields.find((f: any) => (f._id || f.id) === id);
      if (match) return match.name;
    }
    return '-';
  };

  return (
    <div>
      <PageHeader
        title="Activities"
        subtitle="Log and track all farm activities"
        actionLabel="Add Activity"
        onAction={openAddModal}
        icon={<Plus size={16} />}
      />

      <div className="flex gap-4 mb-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search activities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={16} />}
          />
        </div>
        <div className="w-48">
          <Select
            placeholder="All Farms"
            options={farms?.map((f: any) => ({ value: f._id || f.id, label: f.name })) || []}
            value={farmFilter}
            onChange={(e) => setFarmFilter(e.target.value)}
          />
        </div>
        <div className="w-48">
          <Select
            placeholder="All Types"
            options={ACTIVITY_TYPES.map((t) => ({ value: t, label: t }))}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : activities && activities.length > 0 ? (
        <Table headers={['Date', 'Activity', 'Farm', 'Field', 'Cost', 'Actions']}>
          {activities.map((activity: any) => (
            <TableRow key={activity._id || activity.id}>
              <TableCell>{formatDate(activity.date)}</TableCell>
              <TableCell className="font-medium">{activity.activity_type}</TableCell>
              <TableCell>{getFarmName(activity)}</TableCell>
              <TableCell>{getFieldName(activity)}</TableCell>
              <TableCell>{activity.cost ? formatCurrency(activity.cost) : '-'}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(activity)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteId(activity._id || activity.id)}
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
          icon={<Plus size={40} />}
          title="No activities recorded"
          description="Start recording your farm activities to build a complete history."
          actionLabel="Add Activity"
          onAction={openAddModal}
        />
      )}

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !saving && setShowModal(false)}
        >
          <div
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingId ? 'Edit Activity' : 'Add Activity'}
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
                <label className="mb-1 block text-sm font-medium">Date *</label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Activity Type *</label>
                <select
                  value={form.activity_type}
                  onChange={(e) =>
                    setForm({ ...form, activity_type: e.target.value as ActivityType })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  {ACTIVITY_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Farm *</label>
                <Select
                  placeholder="Select a farm"
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
                    fieldsForFarm?.map((f: any) => ({ value: f._id || f.id, label: f.name })) || []
                  }
                  value={form.field_id}
                  onChange={(e) => setForm({ ...form, field_id: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Cost</label>
                <Input
                  type="number"
                  value={form.cost}
                  onChange={(e) => setForm({ ...form, cost: e.target.value })}
                  placeholder="0.00"
                />
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
                  {saving ? 'Saving...' : editingId ? 'Update Activity' : 'Save Activity'}
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
        title="Delete Activity"
        message="Are you sure you want to delete this activity?"
      />
    </div>
  );
};

export default Activities;