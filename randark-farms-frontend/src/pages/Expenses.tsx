import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { expenseService, farmService } from '@/services/api';
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

const CATEGORIES = [
  'Fertilizer',
  'Chemicals',
  'Seeds',
  'Labour',
  'Fuel',
  'Transport',
  'Machinery',
  'Repairs',
  'Irrigation',
  'Equipment',
  'Packaging',
  'Land preparation',
  'Other',
] as const;

type ExpenseCategory = (typeof CATEGORIES)[number];

const emptyForm = {
  date: new Date().toISOString().split('T')[0],
  category: 'Other' as ExpenseCategory,
  description: '',
  farm_id: '',
  amount: '',
  notes: '',
};

const Expenses: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [farmFilter, setFarmFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
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

  const { data: expenses, isLoading, refetch } = useQuery({
    queryKey: ['expenses', debouncedSearch, farmFilter, categoryFilter],
    queryFn: () =>
      expenseService.getAll({
        search: debouncedSearch,
        farm_id: farmFilter || undefined,
        category: categoryFilter || undefined,
      }),
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await expenseService.delete(deleteId);
      showToast('Expense deleted');
      setDeleteId(null);
      refetch();
    } catch (error) {
      showToast('Failed to delete expense', 'error');
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm({ ...emptyForm, farm_id: farmFilter || '' });
    setShowModal(true);
  };

  const openEditModal = (expense: any) => {
    const eid = expense._id || expense.id;
    const farmId =
      expense.farm_id?._id || expense.farm_id || expense.farm?._id || expense.farm?.id || '';
    setEditingId(eid);
    setForm({
      date: expense.date
        ? new Date(expense.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      category: (expense.category as ExpenseCategory) || 'Other',
      description: expense.description || '',
      farm_id: farmId,
      amount: expense.amount != null ? String(expense.amount) : '',
      notes: expense.notes || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim()) {
      showToast('Description is required', 'error');
      return;
    }
    if (form.amount === '' || Number(form.amount) <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        date: form.date,
        category: form.category,
        description: form.description,
        amount: Number(form.amount),
      };
      if (form.farm_id) payload.farm_id = form.farm_id;
      if (form.notes) payload.notes = form.notes;

      if (editingId) {
        await expenseService.update(editingId, payload);
        showToast('Expense updated');
      } else {
        await expenseService.create(payload);
        showToast('Expense added');
      }
      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
      refetch();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || 'Failed to save expense';
      console.error('SAVE EXPENSE FAILED:', error?.response?.data || error);
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const getFarmName = (expense: any) => {
    if (expense.farm?.name) return expense.farm.name;
    const id = expense.farm_id?._id || expense.farm_id || expense.farm?._id;
    if (id && farms) {
      const match = farms.find((f: any) => (f._id || f.id) === id);
      if (match) return match.name;
    }
    return '-';
  };

  const totalExpenses =
    expenses?.reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0) || 0;

  return (
    <div>
      <PageHeader
        title="Expenses"
        subtitle="Track all farm expenses"
        actionLabel="Add Expense"
        onAction={openAddModal}
        icon={<Plus size={16} />}
      />

      <Card className="mb-4">
        <p className="text-sm text-gray-500">Total Expenses</p>
        <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
      </Card>

      <div className="flex gap-4 mb-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search expenses..."
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
            placeholder="All Categories"
            options={CATEGORIES.map((c) => ({ value: c, label: c }))}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : expenses && expenses.length > 0 ? (
        <Table headers={['Date', 'Category', 'Description', 'Farm', 'Amount', 'Actions']}>
          {expenses.map((expense: any) => (
            <TableRow key={expense._id || expense.id}>
              <TableCell>{formatDate(expense.date)}</TableCell>
              <TableCell className="font-medium">{expense.category}</TableCell>
              <TableCell>{expense.description}</TableCell>
              <TableCell>{getFarmName(expense)}</TableCell>
              <TableCell>{formatCurrency(expense.amount)}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(expense)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteId(expense._id || expense.id)}
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
          title="No expenses recorded"
          description="Add your first expense to track spending."
          actionLabel="Add Expense"
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
                {editingId ? 'Edit Expense' : 'Add Expense'}
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
                <label className="mb-1 block text-sm font-medium">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value as ExpenseCategory })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Description *</label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Bought 10 bags of NPK"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Farm</label>
                <Select
                  placeholder="Select a farm (optional)"
                  options={farms?.map((f: any) => ({ value: f._id || f.id, label: f.name })) || []}
                  value={form.farm_id}
                  onChange={(e) => setForm({ ...form, farm_id: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Amount *</label>
                <Input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                  required
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
                  {saving ? 'Saving...' : editingId ? 'Update Expense' : 'Save Expense'}
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
        title="Delete Expense"
        message="Are you sure you want to delete this expense?"
      />
    </div>
  );
};

export default Expenses;