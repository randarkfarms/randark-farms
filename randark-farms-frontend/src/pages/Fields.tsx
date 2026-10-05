import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fieldService, farmService } from '@/services/api';
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

type FieldStatus =
  | 'Preparing'
  | 'Planted'
  | 'Growing'
  | 'Ready for harvest'
  | 'Harvested'
  | 'Fallow';

const emptyForm = {
  name: '',
  farm_id: '',
  area: '',
  area_unit: 'acres',
  status: 'Preparing' as FieldStatus,
};

const STATUS_OPTIONS: { value: FieldStatus; label: string }[] = [
  { value: 'Preparing', label: 'Preparing' },
  { value: 'Planted', label: 'Planted' },
  { value: 'Growing', label: 'Growing' },
  { value: 'Ready for harvest', label: 'Ready for harvest' },
  { value: 'Harvested', label: 'Harvested' },
  { value: 'Fallow', label: 'Fallow' },
];

const Fields: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
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

  const {
    data: fields,
    isLoading,
  } = useQuery({
    queryKey: ['fields', debouncedSearch, farmFilter],
    queryFn: () =>
      fieldService.getAll({
        search: debouncedSearch,
        farm_id: farmFilter || undefined,
      }),
  });

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['fields'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await fieldService.delete(deleteId);
      showToast('Field deleted successfully');
      setDeleteId(null);
      refreshAll();
    } catch (error) {
      showToast('Failed to delete field', 'error');
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm({ ...emptyForm, farm_id: farmFilter || '' });
    setShowModal(true);
  };

  const openEditModal = (field: any) => {
    const fid = field._id || field.id;
    const farmId =
      (field.farm_id as any)?._id ||
      field.farm_id ||
      (field.farm as any)?._id ||
      (field.farm as any)?.id ||
      '';
    setEditingId(fid);
    setForm({
      name: field.name || '',
      farm_id: farmId,
      area: field.area != null ? String(field.area) : '',
      area_unit: field.area_unit || 'acres',
      status: (field.status as FieldStatus) || 'Preparing',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast('Field name is required', 'error');
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
        area: Number(form.area) || 0,
        area_unit: form.area_unit,
        status: form.status,
      };

      if (editingId) {
        await fieldService.update(editingId, payload);
        showToast('Field updated successfully');
      } else {
        await fieldService.create(payload);
        showToast('Field added successfully');
      }
      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
      refreshAll();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to save field';
      console.error('SAVE FIELD FAILED:', error?.response?.data || error);
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Resolve farm name from populated farm_id, or fall back to lookup in farms list
  const getFarmName = (field: any) => {
    const populated = (field.farm_id as any)?.name;
    if (populated) return populated;
    if (field.farm?.name) return field.farm.name;

    const id =
      (field.farm_id as any)?._id ||
      field.farm_id ||
      (field.farm as any)?._id;
    if (id && farms) {
      const match = farms.find((f: any) => (f._id || f.id) === id);
      if (match) return match.name;
    }
    return '-';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      'success' | 'warning' | 'info' | 'neutral'
    > = {
      Growing: 'success',
      Planted: 'info',
      'Ready for harvest': 'warning',
      Preparing: 'neutral',
      Harvested: 'neutral',
      Fallow: 'neutral',
    };
    return (
      <Badge variant={variants[status] || 'neutral'}>{status}</Badge>
    );
  };

  return (
    <div>
      <PageHeader
        title="Fields / Blocks"
        subtitle="Manage all fields across your farms"
        actionLabel="Add Field"
        onAction={openAddModal}
        icon={<Plus size={16} />}
      />

      <div className="flex gap-4 mb-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search fields..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={16} />}
          />
        </div>
        <div className="w-64">
          <Select
            placeholder="All Farms"
            options={
              farms?.map((f: any) => ({
                value: f._id || f.id,
                label: f.name,
              })) || []
            }
            value={farmFilter}
            onChange={(e) => setFarmFilter(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : fields && fields.length > 0 ? (
        <Table
          headers={[
            'Name',
            'Farm',
            'Area',
            'Status',
            'Actions',
          ]}
        >
          {fields.map((field: any) => {
            const fid = field._id || field.id;
            return (
              <TableRow
                key={fid}
                onClick={() => navigate(`/fields/${fid}`)}
              >
                <TableCell className="font-medium">{field.name}</TableCell>
                <TableCell>{getFarmName(field)}</TableCell>
                <TableCell>
                  {field.area} {field.area_unit}
                </TableCell>
                <TableCell>{getStatusBadge(field.status)}</TableCell>
                <TableCell>
                  <div
                    className="flex gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => openEditModal(field)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteId(fid)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </Table>
      ) : (
        <EmptyState
          icon={<Plus size={40} />}
          title="No fields added yet"
          description="Add your first field to start tracking crops and activities."
          actionLabel="Add Field"
          onAction={openAddModal}
        />
      )}

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4"
          onClick={() => !saving && setShowModal(false)}
        >
          <div
            className="my-8 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingId ? 'Edit Field' : 'Add Field'}
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
                <label className="mb-1 block text-sm font-medium">
                  Field Name *
                </label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="e.g. Block A"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Farm *
                </label>
                <Select
                  placeholder="Select a farm"
                  options={
                    farms?.map((f: any) => ({
                      value: f._id || f.id,
                      label: f.name,
                    })) || []
                  }
                  value={form.farm_id}
                  onChange={(e) =>
                    setForm({ ...form, farm_id: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Area
                  </label>
                  <Input
                    type="number"
                    value={form.area}
                    onChange={(e) =>
                      setForm({ ...form, area: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Unit
                  </label>
                  <select
                    value={form.area_unit}
                    onChange={(e) =>
                      setForm({ ...form, area_unit: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
                  >
                    <option value="acres">acres</option>
                    <option value="hectares">hectares</option>
                    <option value="sqm">sq meters</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as FieldStatus,
                    })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
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
                  {saving
                    ? 'Saving...'
                    : editingId
                    ? 'Update Field'
                    : 'Save Field'}
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
        title="Delete Field"
        message="Are you sure you want to delete this field?"
      />
    </div>
  );
};

export default Fields;