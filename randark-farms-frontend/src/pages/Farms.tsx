import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { farmService } from '@/services/farmService';
import Table, { TableRow, TableCell } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/layout/PageHeader';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

const emptyForm = {
  name: '',
  code: '',
  location: '',
  total_area: '',
  area_unit: 'acres',
};

const Farms: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const { data: farms, isLoading, refetch } = useQuery({
    queryKey: ['farms', debouncedSearch],
    queryFn: () => farmService.getAll({ search: debouncedSearch }),
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await farmService.delete(deleteId);
      showToast('Farm deleted successfully');
      setDeleteId(null);
      refetch();
    } catch (error) {
      showToast('Failed to delete farm', 'error');
    }
  };

  const openAddModal = () => {
    setForm(emptyForm);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast('Farm name is required', 'error');
      return;
    }
    setSaving(true);
    try {
      await farmService.create({
        ...form,
        total_area: Number(form.total_area) || 0,
      });
      showToast('Farm added successfully');
      setShowModal(false);
      setForm(emptyForm);
      refetch();
    } catch (error: any) {
      showToast(error?.message || 'Failed to add farm', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Farms"
        subtitle="Manage all your farms"
        actionLabel="Add Farm"
        onAction={openAddModal}
        icon={<Plus size={16} />}
      />

      <div className="mb-4 max-w-md">
        <Input
          placeholder="Search farms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search size={16} />}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : farms && farms.length > 0 ? (
        <Table headers={['Name', 'Code', 'Location', 'Area', 'Status', 'Date Added', 'Actions']}>
          {farms.map((farm: any) => (
            <TableRow key={farm.id} onClick={() => navigate(`/farms/${farm.id}`)}>
              <TableCell className="font-medium">{farm.name}</TableCell>
              <TableCell>{farm.code}</TableCell>
              <TableCell>{farm.location}</TableCell>
              <TableCell>{farm.total_area} {farm.area_unit}</TableCell>
              <TableCell><Badge variant="success">Active</Badge></TableCell>
              <TableCell>{formatDate(farm.date_added)}</TableCell>
              <TableCell>
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => navigate(`/farms/${farm.id}`)} className="text-blue-600 hover:text-blue-800">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => setDeleteId(farm.id)} className="text-red-600 hover:text-red-800">
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
          title="No farms added yet"
          description="Add your first farm to start managing your operations."
          actionLabel="Add Farm"
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
              <h2 className="text-lg font-semibold">Add Farm</h2>
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
                <label className="mb-1 block text-sm font-medium">Farm Name *</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Randark Main Farm"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Farm Code</label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="e.g. RMF-01"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Location</label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Kumasi, Ghana"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Total Area</label>
                  <Input
                    type="number"
                    value={form.total_area}
                    onChange={(e) => setForm({ ...form, total_area: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Unit</label>
                  <select
                    value={form.area_unit}
                    onChange={(e) => setForm({ ...form, area_unit: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="acres">acres</option>
                    <option value="hectares">hectares</option>
                    <option value="sqm">sq meters</option>
                  </select>
                </div>
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
                  {saving ? 'Saving...' : 'Save Farm'}
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
        title="Delete Farm"
        message="Are you sure you want to delete this farm? This action cannot be undone."
      />
    </div>
  );
};

export default Farms;