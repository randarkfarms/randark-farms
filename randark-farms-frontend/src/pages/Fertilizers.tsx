import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fertilizerService, farmService, fieldService } from '@/services/api';
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

const emptyForm = {
  date: new Date().toISOString().split('T')[0],
  fertilizer_name: '',
  farm_id: '',
  field_id: '',
  quantity: '',
  unit: 'kg',
  cost: '',
  notes: '',
};

const Fertilizers: React.FC = () => {
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

  const { data: fieldsForFarm } = useQuery({
    queryKey: ['fields', form.farm_id],
    queryFn: () => fieldService.getAll({ farm_id: form.farm_id }),
    enabled: !!form.farm_id,
  });

  const { data: records, isLoading, refetch } = useQuery({
    queryKey: ['fertilizers', debouncedSearch, farmFilter],
    queryFn: () => fertilizerService.getAll({ search: debouncedSearch, farm_id: farmFilter || undefined }),
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await fertilizerService.delete(deleteId);
      showToast('Fertilizer record deleted');
      setDeleteId(null);
      refetch();
    } catch (error) {
      showToast('Failed to delete record', 'error');
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm({ ...emptyForm, farm_id: farmFilter || '' });
    setShowModal(true);
  };

  const openEditModal = (record: any) => {
    const rid = record._id || record.id;
    const farmId =
      record.farm_id?._id || record.farm_id || record.farm?._id || record.farm?.id || '';
    const fieldId =
      record.field_id?._id || record.field_id || record.field?._id || record.field?.id || '';
    setEditingId(rid);
    setForm({
      date: record.date
        ? new Date(record.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      fertilizer_name: record.fertilizer_name || '',
      farm_id: farmId,
      field_id: fieldId,
      quantity: record.quantity != null ? String(record.quantity) : '',
      unit: record.unit || 'kg',
      cost: record.cost != null ? String(record.cost) : '',
      notes: record.notes || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fertilizer_name.trim()) {
      showToast('Fertilizer name is required', 'error');
      return;
    }
    if (!form.farm_id) {
      showToast('Please select a farm', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        date: form.date,
        fertilizer_name: form.fertilizer_name,
        farm_id: form.farm_id,
        unit: form.unit,
      };
      if (form.field_id) payload.field_id = form.field_id;
      if (form.quantity !== '') payload.quantity = Number(form.quantity) || 0;
      if (form.cost !== '') payload.cost = Number(form.cost) || 0;
      if (form.notes) payload.notes = form.notes;

      if (editingId) {
        await fertilizerService.update(editingId, payload);
        showToast('Fertilizer record updated');
      } else {
        await fertilizerService.create(payload);
        showToast('Fertilizer record added');
      }
      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
      refetch();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || 'Failed to save record';
      console.error('SAVE FERTILIZER FAILED:', error?.response?.data || error);
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const getFarmName = (record: any) => {
    if (record.farm?.name) return record.farm.name;
    const id = record.farm_id?._id || record.farm_id || record.farm?._id;
    if (id && farms) {
      const match = farms.find((f: any) => (f._id || f.id) === id);
      if (match) return match.name;
    }
    return '-';
  };

  const getFieldName = (record: any) => {
    if (record.field?.name) return record.field.name;
    const id = record.field_id?._id || record.field_id || record.field?._id;
    if (id && allFields) {
      const match = allFields.find((f: any) => (f._id || f.id) === id);
      if (match) return match.name;
    }
    return '-';
  };

  return (
    <div>
      <PageHeader
        title="Fertilizer Records"
        subtitle="Track all fertilizer applications"
        actionLabel="Record Fertilizer"
        onAction={openAddModal}
        icon={<Plus size={16} />}
      />

      <div className="flex gap-4 mb-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search fertilizers..."
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
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : records && records.length > 0 ? (
        <Table headers={['Date', 'Fertilizer', 'Farm', 'Field', 'Quantity', 'Cost', 'Actions']}>
          {records.map((record: any) => (
            <TableRow key={record._id || record.id}>
              <TableCell>{formatDate(record.date)}</TableCell>
              <TableCell className="font-medium">{record.fertilizer_name}</TableCell>
              <TableCell>{getFarmName(record)}</TableCell>
              <TableCell>{getFieldName(record)}</TableCell>
              <TableCell>{record.quantity} {record.unit}</TableCell>
              <TableCell>{record.cost ? formatCurrency(record.cost) : '-'}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(record)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteId(record._id || record.id)}
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
          title="No fertilizer records"
          description="Record your first fertilizer application."
          actionLabel="Record Fertilizer"
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
                {editingId ? 'Edit Fertilizer Record' : 'Record Fertilizer'}
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
                <label className="mb-1 block text-sm font-medium">Fertilizer Name *</label>
                <Input
                  value={form.fertilizer_name}
                  onChange={(e) => setForm({ ...form, fertilizer_name: e.target.value })}
                  placeholder="e.g. NPK 15-15-15, Urea"
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
                    fieldsForFarm?.map((f: any) => ({ value: f._id || f.id, label: f.name })) || []
                  }
                  value={form.field_id}
                  onChange={(e) => setForm({ ...form, field_id: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Quantity</label>
                  <Input
                    type="number"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Unit</label>
                  <select
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="tonnes">tonnes</option>
                    <option value="bags">bags</option>
                    <option value="litres">litres</option>
                  </select>
                </div>
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
                  {saving ? 'Saving...' : editingId ? 'Update Record' : 'Save Record'}
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
        title="Delete Fertilizer Record"
        message="Are you sure you want to delete this record?"
      />
    </div>
  );
};

export default Fertilizers;