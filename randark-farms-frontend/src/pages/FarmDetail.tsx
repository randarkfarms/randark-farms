import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  farmService,
  fieldService,
  activityService,
  expenseService,
  harvestService,
} from '@/services/api';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Table, { TableRow, TableCell } from '@/components/ui/Table';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import {
  MapPin,
  Calendar,
  Activity,
  Wallet,
  Package,
  Plus,
  ArrowLeft,
  Grid,
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

type Tab = 'overview' | 'fields' | 'activities' | 'expenses' | 'harvests';

const FarmDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Guard: don't fetch if id is missing or literally "undefined"
  const hasValidId = !!id && id !== 'undefined' && id !== 'null';

  const { data: farm, isLoading: farmLoading } = useQuery({
    queryKey: ['farm', id],
    queryFn: () => farmService.getById(id!),
    enabled: hasValidId,
  });

  const { data: fields } = useQuery({
    queryKey: ['fields', id],
    queryFn: () => fieldService.getAll({ farm_id: id }),
    enabled: hasValidId,
  });

  const { data: activities } = useQuery({
    queryKey: ['activities', id],
    queryFn: () => activityService.getAll({ farm_id: id }),
    enabled: hasValidId,
  });

  const { data: expenses } = useQuery({
    queryKey: ['expenses', id],
    queryFn: () => expenseService.getAll({ farm_id: id }),
    enabled: hasValidId,
  });

  const { data: harvests } = useQuery({
    queryKey: ['harvests', id],
    queryFn: () => harvestService.getAll({ farm_id: id }),
    enabled: hasValidId,
  });

  // Invalid id in URL
  if (!hasValidId) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="text-lg font-semibold text-amber-800 mb-1">
          Invalid farm link
        </h2>
        <p className="text-sm text-amber-700 mb-4">
          The farm ID in the URL is missing or invalid. Try opening the farm from
          the list.
        </p>
        <Button onClick={() => navigate('/farms')}>
          <ArrowLeft size={16} className="mr-2" />
          Back to Farms
        </Button>
      </div>
    );
  }

  if (farmLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={40} />
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold mb-1">Farm not found</h2>
        <p className="text-sm text-gray-500 mb-4">
          This farm may have been deleted or the link is incorrect.
        </p>
        <Button onClick={() => navigate('/farms')}>
          <ArrowLeft size={16} className="mr-2" />
          Back to Farms
        </Button>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'fields', label: 'Fields' },
    { id: 'activities', label: 'Activities' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'harvests', label: 'Harvests' },
  ];

  const totalExpenses =
    expenses?.reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0) ||
    0;
  const totalRevenue =
    harvests?.reduce(
      (sum: number, h: any) => sum + (Number(h.total_revenue) || 0),
      0
    ) || 0;

  return (
    <div>
      <button
        onClick={() => navigate('/farms')}
        className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft size={16} className="mr-1" /> Back to Farms
      </button>

      <PageHeader
        title={farm.name}
        subtitle={`${farm.location || '—'} · ${farm.total_area || 0} ${farm.area_unit || ''}`}
        actionLabel="Add Activity"
        onAction={() => navigate('/activities')}
        icon={<Plus size={16} />}
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                active
                  ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
              {tab.id === 'fields' && fields && fields.length > 0 && (
                <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  {fields.length}
                </span>
              )}
              {tab.id === 'activities' && activities && activities.length > 0 && (
                <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  {activities.length}
                </span>
              )}
              {tab.id === 'expenses' && expenses && expenses.length > 0 && (
                <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  {expenses.length}
                </span>
              )}
              {tab.id === 'harvests' && harvests && harvests.length > 0 && (
                <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  {harvests.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── OVERVIEW ───────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Location
                  </p>
                  <p className="font-semibold truncate">{farm.location || '—'}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Date Added
                  </p>
                  <p className="font-semibold">
                    {farm.date_added ? formatDate(farm.date_added) : '—'}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                  <Activity size={18} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Activities
                  </p>
                  <p className="font-semibold">{activities?.length || 0}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                  <Wallet size={18} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Total Expenses
                  </p>
                  <p className="font-semibold">{formatCurrency(totalExpenses)}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Extra stats row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                Fields / Blocks
              </p>
              <p className="text-2xl font-bold">{fields?.length || 0}</p>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                Harvest Revenue
              </p>
              <p className="text-2xl font-bold text-emerald-600">
                {formatCurrency(totalRevenue)}
              </p>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                Net (Revenue − Expenses)
              </p>
              <p
                className={`text-2xl font-bold ${
                  totalRevenue - totalExpenses >= 0
                    ? 'text-emerald-600'
                    : 'text-red-600'
                }`}
              >
                {formatCurrency(totalRevenue - totalExpenses)}
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* ── FIELDS ─────────────────────────────────── */}
      {activeTab === 'fields' && (
        <>
          {fields && fields.length > 0 ? (
            <Table headers={['Name', 'Area', 'Status', 'Crop']}>
              {fields.map((field: any) => {
                const fid = field._id || field.id;
                return (
                  <TableRow
                    key={fid}
                    onClick={() => navigate(`/fields/${fid}`)}
                  >
                    <TableCell className="font-medium">{field.name}</TableCell>
                    <TableCell>
                      {field.area} {field.area_unit}
                    </TableCell>
                    <TableCell>
                      <Badge variant="success">{field.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {field.crop_id?.name || field.crop?.name || '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </Table>
          ) : (
            <EmptyState
              icon={<Grid size={40} />}
              title="No fields yet"
              description="This farm has no fields or blocks set up."
              actionLabel="Add Field"
              onAction={() => navigate('/fields')}
            />
          )}
        </>
      )}

      {/* ── ACTIVITIES ─────────────────────────────── */}
      {activeTab === 'activities' && (
        <>
          {activities && activities.length > 0 ? (
            <Table headers={['Date', 'Activity Type', 'Field', 'Description']}>
              {activities.map((activity: any) => (
                <TableRow key={activity._id || activity.id}>
                  <TableCell>
                    {activity.date ? formatDate(activity.date) : '-'}
                  </TableCell>
                  <TableCell>{activity.activity_type || '-'}</TableCell>
                  <TableCell>
                    {activity.field_id?.name || activity.field?.name || '-'}
                  </TableCell>
                  <TableCell>{activity.description || '-'}</TableCell>
                </TableRow>
              ))}
            </Table>
          ) : (
            <EmptyState
              icon={<Activity size={40} />}
              title="No activities recorded"
              description="Log your first activity for this farm."
              actionLabel="Add Activity"
              onAction={() => navigate('/activities')}
            />
          )}
        </>
      )}

      {/* ── EXPENSES ───────────────────────────────── */}
      {activeTab === 'expenses' && (
        <>
          {expenses && expenses.length > 0 ? (
            <Table headers={['Date', 'Category', 'Description', 'Amount']}>
              {expenses.map((expense: any) => (
                <TableRow key={expense._id || expense.id}>
                  <TableCell>
                    {expense.date ? formatDate(expense.date) : '-'}
                  </TableCell>
                  <TableCell>{expense.category || '-'}</TableCell>
                  <TableCell>{expense.description || '-'}</TableCell>
                  <TableCell>{formatCurrency(expense.amount || 0)}</TableCell>
                </TableRow>
              ))}
            </Table>
          ) : (
            <EmptyState
              icon={<Wallet size={40} />}
              title="No expenses recorded"
              description="Track your first expense for this farm."
              actionLabel="Add Expense"
              onAction={() => navigate('/expenses')}
            />
          )}
        </>
      )}

      {/* ── HARVESTS ───────────────────────────────── */}
      {activeTab === 'harvests' && (
        <>
          {harvests && harvests.length > 0 ? (
            <Table headers={['Date', 'Crop', 'Quantity', 'Revenue']}>
              {harvests.map((harvest: any) => (
                <TableRow key={harvest._id || harvest.id}>
                  <TableCell>
                    {harvest.date ? formatDate(harvest.date) : '-'}
                  </TableCell>
                  <TableCell>
                    {harvest.crop_id?.name || harvest.crop?.name || '-'}
                  </TableCell>
                  <TableCell>
                    {harvest.quantity} {harvest.unit}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(harvest.total_revenue || 0)}
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          ) : (
            <EmptyState
              icon={<Package size={40} />}
              title="No harvests recorded"
              description="Record your first harvest for this farm."
              actionLabel="Record Harvest"
              onAction={() => navigate('/harvests')}
            />
          )}
        </>
      )}
    </div>
  );
};

export default FarmDetail;