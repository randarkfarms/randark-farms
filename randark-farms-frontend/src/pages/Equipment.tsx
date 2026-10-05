import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { equipmentService } from '@/services/api';
import Table, { TableRow, TableCell } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/layout/PageHeader';
import { Plus, Search, Edit, Trash2, X, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/hooks/useToast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { formatDate } from '@/lib/utils';

const EQUIPMENT_TYPES = [
  'Tractor',
  'Plough',
  'Harvester',
  'Sprayer',
  'Irrigation pump',
  'Water tank',
  'Generator',
  'Vehicle',
  'Tool',
  'Other',
] as const;

type EquipmentType = (typeof EQUIPMENT_TYPES)[number];

const STATUSES = ['Available', 'In use', 'Under maintenance', 'Out of service'] as const;
type EquipmentStatus = (typeof STATUSES)[number];

const emptyForm = {
  name: '',
  equipment_id: '',
  type: 'Tractor' as EquipmentType,
  status: 'Available' as EquipmentStatus,
  purchase_date: '',
  purchase_cost: '',
  next_maintenance: '',
  notes: '',
};

const Equipment: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const { data: equipment, isLoading, refetch } = useQuery({
    queryKey: ['equipment', debouncedSearch, statusFilter],
    queryFn: () =>
      equipmentService.getAll({
        search: debouncedSearch,
        status: statusFilter || undefined,
      }),
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await equipmentService.delete(deleteId);
      showToast('Equipment deleted');
      setDeleteId(null);
      refetch();
    } catch (error) {
      showToast('Failed to delete equipment', 'error');
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    const eid = item._id || item.id;
    setEditingId(eid);
    setForm({
      name: item.name || '',
      equipment_id: item.equipment_id || '',
      type: (item.type as EquipmentType) || 'Other',
      status: (item.status as EquipmentStatus) || 'Available',
      purchase_date: item.purchase_date
        ? new Date(item.purchase_date).toISOString().split('T')[0]
        : '',
      purchase_cost: item.purchase_cost != null ? String(item.purchase_cost) : '',
      next_maintenance: item.next_maintenance
        ? new Date(item.next_maintenance).toISOString().split('T')[0]
        : '',
      notes: item.notes || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast('Equipment name is required', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        name: form.name,
        equipment_id: form.equipment_id,
        type: form.type,
        status: form.status,
      };
      if (form.purchase_date) payload.purchase_date = form.purchase_date;
      if (form.purchase_cost !== '') payload.purchase_cost = Number(form.purchase_cost) || 0;
      if (form.next_maintenance) payload.next_maintenance = form.next_maintenance;
      if (form.notes) payload.notes = form.notes;

      if (editingId) {
        await equipmentService.update(editingId, payload);
        showToast('Equipment updated');
      } else {
        await equipmentService.create(payload);
        showToast('Equipment added');
      }
      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
      refetch();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || 'Failed to save equipment';
      console.error('SAVE EQUIPMENT FAILED:', error?.response?.data || error);
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
      'Available': 'success',
      'In use': 'info',
      'Under maintenance': 'warning',
      'Out of service': 'danger',
    };
    return <Badge variant={variants[status] || 'neutral'}>{status}</Badge>;
  };

  return (
    <div>
      <PageHeader
        title="Equipment"
        subtitle="Manage all farm machinery and tools"
        actionLabel="Add Equipment"
        onAction={openAddModal}
        icon={<Plus size={16} />}
      />

      <div className="flex gap-4 mb-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search equipment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={16} />}
          />
        </div>
        <div className="w-48">
          <Select
            placeholder="All Statuses"
            options={[
              { value: 'Available', label: 'Available' },
              { value: 'In use', label: 'In Use' },
              { value: 'Under maintenance', label: 'Under Maintenance' },
              { value: 'Out of service', label: 'Out of Service' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : equipment && equipment.length > 0 ? (
        <Table headers={['Name', 'ID', 'Type', 'Status', 'Next Maintenance', 'Actions']}>
          {equipment.map((item: any) => (
            <TableRow key={item._id || item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.equipment_id}</TableCell>
              <TableCell>{item.type}</TableCell>
              <TableCell>{getStatusBadge(item.status)}</TableCell>
              <TableCell>
                {item.next_maintenance ? formatDate(item.next_maintenance) : '-'}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(item)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteId(item._id || item.id)}
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
          icon={<Wrench size={40} />}
          title="No equipment added"
          description="Add your first equipment to track maintenance."
          actionLabel="Add Equipment"
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
                {editingId ? 'Edit Equipment' : 'Add Equipment'}
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
                <label className="mb-1 block text-sm font-medium">Equipment Name *</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Massey Ferguson 385"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Equipment ID / Code</label>
                <Input
                  value={form.equipment_id}
                  onChange={(e) => setForm({ ...form, equipment_id: e.target.value })}
                  placeholder="e.g. TR-001"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Type *</label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm({ ...form, type: e.target.value as EquipmentType })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    {EQUIPMENT_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Status *</label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value as EquipmentStatus })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Purchase Date</label>
                  <Input
                    type="date"
                    value={form.purchase_date}
                    onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Purchase Cost</label>
                  <Input
                    type="number"
                    value={form.purchase_cost}
                    onChange={(e) => setForm({ ...form, purchase_cost: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Next Maintenance</label>
                <Input
                  type="date"
                  value={form.next_maintenance}
                  onChange={(e) => setForm({ ...form, next_maintenance: e.target.value })}
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
                  {saving ? 'Saving...' : editingId ? 'Update Equipment' : 'Save Equipment'}
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
        title="Delete Equipment"
        message="Are you sure you want to delete this equipment?"
      />
    </div>
  );
};

export default Equipment;