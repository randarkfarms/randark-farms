import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cropService, farmService, fieldService } from '@/services/api';
import Table, { TableRow, TableCell } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
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
import { formatDate } from '@/lib/utils';

type CropStatus =
  | 'Planned'
  | 'Planted'
  | 'Growing'
  | 'Flowering'
  | 'Ready for harvest'
  | 'Harvested'
  | 'Failed';

const emptyForm = {
  name: '',
  farm_id: '',
  field_id: '',
  planting_date: '',
  status: 'Planted' as CropStatus,
};

const STATUS_OPTIONS: { value: CropStatus; label: string }[] = [
  { value: 'Planned', label: 'Planned' },
  { value: 'Planted', label: 'Planted' },
  { value: 'Growing', label: 'Growing' },
  { value: 'Flowering', label: 'Flowering' },
  { value: 'Ready for harvest', label: 'Ready for harvest' },
  { value: 'Harvested', label: 'Harvested' },
  { value: 'Failed', label: 'Failed' },
];

const Crops: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [farmFilter, setFarmFilter] = useState('');
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

  const { data: fields } = useQuery({
    queryKey: ['fields', form.farm_id],
    queryFn: () => fieldService.getAll({ farm_id: form.farm_id }),
    enabled: !!form.farm_id,
  });

  const { data: crops, isLoading, refetch } = useQuery({
    queryKey: ['crops', debouncedSearch, farmFilter],
    queryFn: () => cropService.getAll({ search: debouncedSearch, farm_id: farmFilter || undefined }),
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await cropService.delete(deleteId);
      showToast('Crop deleted successfully');
      setDeleteId(null);
      refetch();
    } catch (error) {
      showToast('Failed to delete crop', 'error');
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm({ ...emptyForm, farm_id: farmFilter || '' });
    setShowModal(true);
  };

  const openEditModal = (crop: any) => {
    const cid = crop._id || crop.id;
    const farmId = crop.farm_id?._id || crop.farm_id || crop.farm?._id || crop.farm?.id || '';
    const fieldId = crop.field_id?._id || crop.field_id || crop.field?._id || crop.field?.id || '';
    setEditingId(cid);
    setForm({
      name: crop.name || '',
      farm_id: farmId,
      field_id: fieldId,
      planting_date: crop.planting_date
        ? new Date(crop.planting_date).toISOString().split('T')[0]
        : '',
      status: (crop.status as CropStatus) || 'Planted',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast('Crop name is required', 'error');
      return;
    }
    if (!form.farm_id) {
      showToast('Please select a farm', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        name: form.name,
        farm_id: form.farm_id,
        status: form.status,
      };
      if (form.field_id) payload.field_id = form.field_id;
      if (form.planting_date) payload.planting_date = form.planting_date;

      if (editingId) {
        await cropService.update(editingId, payload);
        showToast('Crop updated successfully');
      } else {
        await cropService.create(payload);
        showToast('Crop added successfully');
      }
      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
      refetch();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || 'Failed to save crop';
      console.error('SAVE CROP FAILED:', error?.response?.data || error);
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'info' | 'neutral'> = {
      'Planted': 'info',
      'Growing': 'success',
      'Flowering': 'success',
      'Ready for harvest': 'warning',
      'Harvested': 'neutral',
      'Planned': 'neutral',
      'Failed': 'warning',
    };
    return <Badge variant={variants[status] || 'neutral'}>{status}</Badge>;
  };

  const getFarmName = (crop: any) => {
    if (crop.farm?.name) return crop.farm.name;
    const id = crop.farm_id?._id || crop.farm_id || crop.farm?._id;
    if (id && farms) {
      const match = farms.find((f: any) => (f._id || f.id) === id);
      if (match) return match.name;
    }
    return '-';
  };

  const getFieldName = (crop: any) => {
    if (crop.field?.name) return crop.field.name;
    const id = crop.field_id?._id || crop.field_id || crop.field?._id;
    if (id && allFields) {
      const match = allFields.find((f: any) => (f._id || f.id) === id);
      if (match) return match.name;
    }
    return '-';
  };

  return (
    <div>
      <PageHeader
        title="Crops"
        subtitle="Manage all your crops"
        actionLabel="Add Crop"
        onAction={openAddModal}
        icon={<Plus size={16} />}
      />

      <div className="flex gap-4 mb-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search crops..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={16} />}
          />
        </div>
        <div className="w-64">
          <Select
            placeholder="All Farms"
            options={farms?.map((f: any) => ({ value: f._id || f.id, label: f.name })) || []}
            value={farmFilter}
            onChange={(e) => setFarmFilter(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : crops && crops.length > 0 ? (
        <Table headers={['Crop', 'Farm', 'Field', 'Planting Date', 'Status', 'Actions']}>
          {crops.map((crop: any) => (
            <TableRow key={crop._id || crop.id}>
              <TableCell className="font-medium">{crop.name}</TableCell>
              <TableCell>{getFarmName(crop)}</TableCell>
              <TableCell>{getFieldName(crop)}</TableCell>
              <TableCell>{crop.planting_date ? formatDate(crop.planting_date) : '-'}</TableCell>
              <TableCell>{getStatusBadge(crop.status)}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(crop)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteId(crop._id || crop.id)}
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
          title="No crops added yet"
          description="Add your first crop to start tracking growth."
          actionLabel="Add Crop"
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
                {editingId ? 'Edit Crop' : 'Add Crop'}
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
                <label className="mb-1 block text-sm font-medium">Crop Name *</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Maize"
                  required
                />
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
                    fields?.map((f: any) => ({ value: f._id || f.id, label: f.name })) || []
                  }
                  value={form.field_id}
                  onChange={(e) => setForm({ ...form, field_id: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Planting Date</label>
                <Input
                  type="date"
                  value={form.planting_date}
                  onChange={(e) => setForm({ ...form, planting_date: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as CropStatus })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
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
                  {saving ? 'Saving...' : editingId ? 'Update Crop' : 'Save Crop'}
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
        title="Delete Crop"
        message="Are you sure you want to delete this crop?"
      />
    </div>
  );
};

export default Crops;