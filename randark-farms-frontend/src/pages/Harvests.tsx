import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { harvestService, farmService, fieldService, cropService } from '@/services/api';
import Table, { TableRow, TableCell } from '@/components/ui/Table';
import Card from '@/components/ui/Card';
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
  crop_id: '',
  farm_id: '',
  field_id: '',
  quantity: '',
  unit: 'kg',
  price_per_unit: '',
  notes: '',
};

const Harvests: React.FC = () => {
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

  const { data: allCrops } = useQuery({
    queryKey: ['crops', 'all'],
    queryFn: () => cropService.getAll(),
  });

  const { data: fieldsForFarm } = useQuery({
    queryKey: ['fields', form.farm_id],
    queryFn: () => fieldService.getAll({ farm_id: form.farm_id }),
    enabled: !!form.farm_id,
  });

  const { data: cropsForFarm } = useQuery({
    queryKey: ['crops', form.farm_id],
    queryFn: () => cropService.getAll({ farm_id: form.farm_id }),
    enabled: !!form.farm_id,
  });

  const { data: harvests, isLoading, refetch } = useQuery({
    queryKey: ['harvests', debouncedSearch, farmFilter],
    queryFn: () => harvestService.getAll({ search: debouncedSearch, farm_id: farmFilter || undefined }),
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await harvestService.delete(deleteId);
      showToast('Harvest deleted');
      setDeleteId(null);
      refetch();
    } catch (error) {
      showToast('Failed to delete harvest', 'error');
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm({ ...emptyForm, farm_id: farmFilter || '' });
    setShowModal(true);
  };

  const openEditModal = (harvest: any) => {
    const hid = harvest._id || harvest.id;
    const farmId =
      harvest.farm_id?._id || harvest.farm_id || harvest.farm?._id || harvest.farm?.id || '';
    const fieldId =
      harvest.field_id?._id || harvest.field_id || harvest.field?._id || harvest.field?.id || '';
    const cropId =
      harvest.crop_id?._id || harvest.crop_id || harvest.crop?._id || harvest.crop?.id || '';
    setEditingId(hid);
    setForm({
      date: harvest.date
        ? new Date(harvest.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      crop_id: cropId,
      farm_id: farmId,
      field_id: fieldId,
      quantity: harvest.quantity != null ? String(harvest.quantity) : '',
      unit: harvest.unit || 'kg',
      price_per_unit:
        harvest.price_per_unit != null ? String(harvest.price_per_unit) : '',
      notes: harvest.notes || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.farm_id) {
      showToast('Please select a farm', 'error');
      return;
    }
    if (form.quantity === '' || Number(form.quantity) <= 0) {
      showToast('Please enter a valid quantity', 'error');
      return;
    }
    setSaving(true);
    try {
      const qty = Number(form.quantity) || 0;
      const price = Number(form.price_per_unit) || 0;
      const payload: any = {
        date: form.date,
        farm_id: form.farm_id,
        quantity: qty,
        unit: form.unit,
      };
      if (form.crop_id) payload.crop_id = form.crop_id;
      if (form.field_id) payload.field_id = form.field_id;
      if (form.price_per_unit !== '') {
        payload.price_per_unit = price;
        payload.total_revenue = qty * price;
      }
      if (form.notes) payload.notes = form.notes;

      if (editingId) {
        await harvestService.update(editingId, payload);
        showToast('Harvest updated');
      } else {
        await harvestService.create(payload);
        showToast('Harvest recorded');
      }
      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
      refetch();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || 'Failed to save harvest';
      console.error('SAVE HARVEST FAILED:', error?.response?.data || error);
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const getFarmName = (harvest: any) => {
    if (harvest.farm?.name) return harvest.farm.name;
    const id = harvest.farm_id?._id || harvest.farm_id || harvest.farm?._id;
    if (id && farms) {
      const match = farms.find((f: any) => (f._id || f.id) === id);
      if (match) return match.name;
    }
    return '-';
  };

  const getCropName = (harvest: any) => {
    if (harvest.crop?.name) return harvest.crop.name;
    const id = harvest.crop_id?._id || harvest.crop_id || harvest.crop?._id;
    if (id && allCrops) {
      const match = allCrops.find((c: any) => (c._id || c.id) === id);
      if (match) return match.name;
    }
    return '-';
  };

  const totalRevenue =
    harvests?.reduce((sum: number, h: any) => sum + (Number(h.total_revenue) || 0), 0) || 0;

  const previewTotal =
    (Number(form.quantity) || 0) * (Number(form.price_per_unit) || 0);

  return (
    <div>
      <PageHeader
        title="Harvests"
        subtitle="Track all harvest records"
        actionLabel="Record Harvest"
        onAction={openAddModal}
        icon={<Plus size={16} />}
      />

      <Card className="mb-4">
        <p className="text-sm text-gray-500">Total Revenue</p>
        <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
      </Card>

      <div className="flex gap-4 mb-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search harvests..."
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
      ) : harvests && harvests.length > 0 ? (
        <Table headers={['Date', 'Crop', 'Farm', 'Quantity', 'Revenue', 'Actions']}>
          {harvests.map((harvest: any) => (
            <TableRow key={harvest._id || harvest.id}>
              <TableCell>{formatDate(harvest.date)}</TableCell>
              <TableCell className="font-medium">{getCropName(harvest)}</TableCell>
              <TableCell>{getFarmName(harvest)}</TableCell>
              <TableCell>{harvest.quantity} {harvest.unit}</TableCell>
              <TableCell>{formatCurrency(harvest.total_revenue || 0)}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(harvest)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteId(harvest._id || harvest.id)}
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
          title="No harvests recorded"
          description="Record your first harvest."
          actionLabel="Record Harvest"
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
                {editingId ? 'Edit Harvest' : 'Record Harvest'}
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
                <label className="mb-1 block text-sm font-medium">Farm *</label>
                <Select
                  placeholder="Select a farm"
                  options={farms?.map((f: any) => ({ value: f._id || f.id, label: f.name })) || []}
                  value={form.farm_id}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      farm_id: e.target.value,
                      field_id: '',
                      crop_id: '',
                    })
                  }
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Crop</label>
                <Select
                  placeholder={form.farm_id ? 'Select a crop' : 'Select a farm first'}
                  options={
                    cropsForFarm?.map((c: any) => ({
                      value: c._id || c.id,
                      label: c.name,
                    })) || []
                  }
                  value={form.crop_id}
                  onChange={(e) => setForm({ ...form, crop_id: e.target.value })}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Quantity *</label>
                  <Input
                    type="number"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    placeholder="0"
                    required
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
                    <option value="crates">crates</option>
                    <option value="pieces">pieces</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Price per Unit</label>
                <Input
                  type="number"
                  value={form.price_per_unit}
                  onChange={(e) => setForm({ ...form, price_per_unit: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              {previewTotal > 0 && (
                <div className="rounded-md bg-blue-50 px-3 py-2 text-sm">
                  <span className="text-gray-600">Total revenue: </span>
                  <span className="font-semibold">{formatCurrency(previewTotal)}</span>
                </div>
              )}

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
                  {saving ? 'Saving...' : editingId ? 'Update Harvest' : 'Save Harvest'}
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
        title="Delete Harvest"
        message="Are you sure you want to delete this harvest?"
      />
    </div>
  );
};

export default Harvests;