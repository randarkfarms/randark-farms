import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/api';
import TasksPanel from '@/components/dashboard/TasksPanel';
import RecentActivities from '@/components/dashboard/RecentActivities';
import ExpenseChart from '@/components/dashboard/ExpenseChart';
import HarvestChart from '@/components/dashboard/HarvestChart';
import InventoryAlerts from '@/components/dashboard/InventoryAlerts';
import ExpenseCategoryPie from '@/components/dashboard/ExpenseCategoryPie';
import Spinner from '@/components/ui/Spinner';
import {
  MapPin,
  Sprout,
  Wallet,
  CheckSquare,
  Plus,
  Activity,
  Droplets,
  Leaf,
  Package,
  Wrench,
  ArrowUpRight,
  TrendingUp,
  Calendar,
  Sparkles,
  PieChart as PieIcon,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardService.getDashboardData,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 60_000,
    staleTime: 0,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Spinner size={40} />
        <p className="text-sm text-gray-500">Loading your farm overview…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        Error loading dashboard. Please refresh or check the backend.
      </div>
    );
  }

  const summary = data?.summary;
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const greetingEmoji = hour < 12 ? '☀️' : hour < 17 ? '🌤️' : '🌙';
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const overdueCount =
    data?.upcoming_tasks?.filter((t: any) => t.status === 'Overdue').length || 0;

  const stats = [
    {
      title: 'Total Farms',
      value: String(summary?.total_farms || 0),
      icon: <MapPin size={22} />,
      subtext: 'Registered farms',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Total Area',
      value: `${summary?.total_area || 0}`,
      suffix: 'acres',
      icon: <Sprout size={22} />,
      subtext: 'Across all farms',
      gradient: 'from-green-500 to-lime-600',
    },
    {
      title: 'Monthly Expenses',
      value: formatCurrency(summary?.monthly_expenses || 0),
      icon: <Wallet size={22} />,
      subtext: 'This month',
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      title: 'Upcoming Tasks',
      value: String(summary?.upcoming_tasks || 0),
      icon: <CheckSquare size={22} />,
      subtext: overdueCount > 0 ? `${overdueCount} overdue` : 'On track',
      subtextClass: overdueCount > 0 ? 'text-red-600 font-medium' : '',
      gradient: 'from-indigo-500 to-purple-600',
    },
  ];

  const quickActions = [
    { label: 'Add Farm', icon: MapPin, to: '/farms', color: 'bg-emerald-500' },
    { label: 'Add Activity', icon: Activity, to: '/activities', color: 'bg-blue-500' },
    { label: 'Record Spraying', icon: Droplets, to: '/spraying', color: 'bg-cyan-500' },
    { label: 'Record Fertilizer', icon: Leaf, to: '/fertilizers', color: 'bg-lime-600' },
    { label: 'Add Expense', icon: Wallet, to: '/expenses', color: 'bg-amber-500' },
    { label: 'Record Harvest', icon: Package, to: '/harvests', color: 'bg-orange-500' },
    { label: 'Add Task', icon: CheckSquare, to: '/tasks', color: 'bg-indigo-500' },
    { label: 'Equipment', icon: Wrench, to: '/equipment', color: 'bg-slate-500' },
  ];

  return (
    <div className="space-y-6">
      {/* ── HERO ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 p-6 md:p-8 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-52 w-52 rounded-full bg-yellow-300/20 blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-100 text-sm mb-2">
              <Sparkles size={14} />
              <span>Randark Farms • Dashboard</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {greeting}, {user?.name?.split(' ')[0] || 'Admin'} {greetingEmoji}
            </h1>
            <p className="text-emerald-50/90 mt-1 text-sm md:text-base">
              Here's what's happening across your farm operations today.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-50/80">
              <Calendar size={14} />
              <span>{today}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {overdueCount > 0 && (
              <button
                onClick={() => navigate('/tasks')}
                className="group flex items-center gap-2 rounded-xl bg-red-500/90 hover:bg-red-500 px-4 py-2.5 text-sm font-medium shadow-lg transition-all hover:scale-[1.02]"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                </span>
                {overdueCount} overdue task{overdueCount > 1 ? 's' : ''}
              </button>
            )}
            <button
              onClick={() => navigate('/activities')}
              className="group flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur px-4 py-2.5 text-sm font-medium shadow-lg transition-all hover:scale-[1.02]"
            >
              <Plus size={16} />
              Log Activity
              <ArrowUpRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </button>
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.title}
            className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
          >
            <div
              className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${s.gradient} opacity-[0.08] transition-transform duration-500 group-hover:scale-150`}
            />

            <div className="relative flex items-start justify-between">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${s.gradient} text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
              >
                {s.icon}
              </div>
              <TrendingUp
                size={16}
                className="text-gray-300 transition-colors group-hover:text-emerald-500"
              />
            </div>

            <div className="relative mt-4">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {s.title}
              </p>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {s.value}
                </span>
                {s.suffix && (
                  <span className="text-sm text-gray-500">{s.suffix}</span>
                )}
              </div>
              <p className={`mt-1 text-xs ${s.subtextClass || 'text-gray-500'}`}>
                {s.subtext}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── EXPENSE PIE + TREND ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center gap-2">
            <PieIcon size={18} className="text-amber-500" />
            <div>
              <h2 className="text-base font-semibold">
                Expenses by Category
              </h2>
              <p className="text-xs text-gray-500">
                Where your money is going
              </p>
            </div>
          </div>
          <ExpenseCategoryPie data={data?.expenses_by_category || []} />
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 transition-shadow hover:shadow-md">
          <h2 className="text-base font-semibold mb-1 flex items-center gap-2">
            <Wallet size={18} className="text-amber-500" />
            Expenses Trend
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            Monthly spending over time
          </p>
          <ExpenseChart data={data?.expenses_by_month || []} />
        </div>
      </div>

      {/* ── TASKS + ALERTS / ACTIVITY ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 h-full">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <CheckSquare size={18} className="text-indigo-500" />
                  Upcoming Tasks
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  What needs your attention
                </p>
              </div>
              <button
                onClick={() => navigate('/tasks')}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                View all <ArrowUpRight size={12} />
              </button>
            </div>
            <TasksPanel
              tasks={data?.upcoming_tasks || []}
              onTaskClick={(id) => navigate(`/tasks?task=${id}`)}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Wrench size={18} className="text-amber-500" />
                Inventory Alerts
              </h2>
              <button
                onClick={() => navigate('/inventory')}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
              >
                Manage
              </button>
            </div>
            <InventoryAlerts items={data?.inventory_alerts || []} />
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Activity size={18} className="text-blue-500" />
                Recent Activity
              </h2>
              <button
                onClick={() => navigate('/activities')}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
              >
                View all
              </button>
            </div>
            <RecentActivities activities={data?.recent_activities || []} />
          </div>
        </div>
      </div>

      {/* ── HARVEST CHART ────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 transition-shadow hover:shadow-md">
        <h2 className="text-base font-semibold mb-1 flex items-center gap-2">
          <Package size={18} className="text-orange-500" />
          Harvest Revenue
        </h2>
        <p className="text-xs text-gray-500 mb-3">
          Income from harvests
        </p>
        <HarvestChart data={data?.harvest_by_month || []} />
      </div>

      {/* ── QUICK ACTIONS ────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Sparkles size={18} className="text-emerald-500" />
            Quick Actions
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Jump straight into the most common tasks
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => navigate(action.to)}
                className="group relative flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-100 bg-white p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${action.color} text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                >
                  <Icon size={20} />
                </div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;