import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { inventoryService } from '@/services/api';
import Table, { TableRow, TableCell } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/layout/PageHeader';
import { Plus, Search, Edit, Trash2, X, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/hooks/useToast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { formatDate } from '@/lib/utils';

const CATEGORIES = [
  'Fertilizer',
  'Chemical',
  'Seed',
  'Packaging',
  'Spare part',
  'Farm supply',
  'Other',
] as const;

type InventoryCategory = (typeof CATEGORIES)[number];

const emptyForm = {
  name: '',
  category: 'Farm supply' as InventoryCategory,
  quantity: '',
  unit: 'units',
  minimum_stock_level: '',
  expiry_date: '',
  notes: '',
};

const Inventory: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const { data: items, isLoading, refetch } = useQuery({
    queryKey: ['inventory', debouncedSearch, categoryFilter, lowStockOnly],
    queryFn: () =>
      inventoryService.getAll({
        search: debouncedSearch,
        category: categoryFilter || undefined,
        low_stock: lowStockOnly ? 'true' : undefined,
      }),
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await inventoryService.delete(deleteId);
      showToast('Item deleted');
      setDeleteId(null);
      refetch();
    } catch (error) {
      showToast('Failed to delete item', 'error');
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    const iid = item._id || item.id;
    setEditingId(iid);
    setForm({
      name: item.name || '',
      category: (item.category as InventoryCategory) || 'Farm supply',
      quantity: item.quantity != null ? String(item.quantity) : '',
      unit: item.unit || 'units',
      minimum_stock_level:
        item.minimum_stock_level != null ? String(item.minimum_stock_level) : '',
      expiry_date: item.expiry_date
        ? new Date(item.expiry_date).toISOString().split('T')[0]
        : '',
      notes: item.notes || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast('Item name is required', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        name: form.name,
        category: form.category,
        quantity: Number(form.quantity) || 0,
        unit: form.unit,
        minimum_stock_level: Number(form.minimum_stock_level) || 0,
      };
      if (form.expiry_date) payload.expiry_date = form.expiry_date;
      if (form.notes) payload.notes = form.notes;

      if (editingId) {
        await inventoryService.update(editingId, payload);
        showToast('Item updated');
      } else {
        await inventoryService.create(payload);
        showToast('Item added');
      }
      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
      refetch();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || 'Failed to save item';
      console.error('SAVE INVENTORY FAILED:', error?.response?.data || error);
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const getStockBadge = (item: any) => {
    const qty = Number(item.quantity) || 0;
    const min = Number(item.minimum_stock_level) || 0;
    if (qty === 0) return <Badge variant="danger">Out of Stock</Badge>;
    if (qty <= min) return <Badge variant="warning">Low Stock</Badge>;
    return <Badge variant="success">In Stock</Badge>;
  };

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle="Manage all farm supplies and materials"
        actionLabel="Add Item"
        onAction={openAddModal}
        icon={<Plus size={16} />}
      />

      <div className="flex gap-4 mb-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search inventory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={16} />}
          />
        </div>
        <div className="w-48">
          <Select
            placeholder="All Categories"
            options={CATEGORIES.map((c) => ({ value: c, label: c }))}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-sm">Low Stock Only</span>
        </label>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : items && items.length > 0 ? (
        <Table headers={['Item', 'Category', 'Quantity', 'Min Level', 'Status', 'Expiry Date', 'Actions']}>
          {items.map((item: any) => (
            <TableRow key={item._id || item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>{item.quantity} {item.unit}</TableCell>
              <TableCell>{item.minimum_stock_level}</TableCell>
              <TableCell>{getStockBadge(item)}</TableCell>
              <TableCell>{item.expiry_date ? formatDate(item.expiry_date) : '-'}</TableCell>
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
          icon={<Package size={40} />}
          title="No inventory items"
          description="Add your first inventory item to track supplies."
          actionLabel="Add Item"
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
                {editingId ? 'Edit Item' : 'Add Item'}
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
                <label className="mb-1 block text-sm font-medium">Item Name *</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. NPK 15-15-15"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value as InventoryCategory })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
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
                    <option value="units">units</option>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="litres">litres</option>
                    <option value="ml">ml</option>
                    <option value="bags">bags</option>
                    <option value="pieces">pieces</option>
                    <option value="boxes">boxes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Minimum Stock Level</label>
                <Input
                  type="number"
                  value={form.minimum_stock_level}
                  onChange={(e) => setForm({ ...form, minimum_stock_level: e.target.value })}
                  placeholder="0"
                />
                <p className="mt-1 text-xs text-gray-500">
                  You'll be warned when quantity drops to or below this level.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Expiry Date</label>
                <Input
                  type="date"
                  value={form.expiry_date}
                  onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
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
                  {saving ? 'Saving...' : editingId ? 'Update Item' : 'Save Item'}
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
        title="Delete Item"
        message="Are you sure you want to delete this inventory item?"
      />
    </div>
  );
};

export default Inventory;