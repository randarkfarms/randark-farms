import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface ExpenseChartProps {
  data: { month: string; total: number }[];
}

const formatAxisNumber = (n: number) => {
  if (n == null) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return String(n);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  const value = payload[0].value as number;
  return (
    <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 shadow-lg dark:border-gray-800 dark:bg-gray-900">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <div className="flex items-center gap-1.5 mt-0.5">
        <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
        <span className="text-sm font-semibold text-amber-600">
          {formatCurrency(value)}
        </span>
      </div>
    </div>
  );
};

const ExpenseChart: React.FC<ExpenseChartProps> = ({ data }) => {
  const hasData = Array.isArray(data) && data.length > 0;

  if (!hasData) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-500">
        No expense data yet
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 8, bottom: 0, left: -12 }}
          barCategoryGap="22%"
        >
          <defs>
            {/* Default bar gradient (amber → orange) */}
            <linearGradient id="expenseBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity={1} />
              <stop offset="100%" stopColor="#ea580c" stopOpacity={0.85} />
            </linearGradient>
            {/* Brighter version shown on hover */}
            <linearGradient id="expenseBarHover" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fcd34d" stopOpacity={1} />
              <stop offset="100%" stopColor="#f97316" stopOpacity={1} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="4 6"
            vertical={false}
            stroke="currentColor"
            className="text-gray-200 dark:text-gray-800"
          />

          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: 'currentColor' }}
            className="text-gray-500"
            axisLine={false}
            tickLine={false}
            dy={6}
          />

          <YAxis
            tick={{ fontSize: 11, fill: 'currentColor' }}
            className="text-gray-500"
            axisLine={false}
            tickLine={false}
            tickFormatter={formatAxisNumber}
            width={48}
          />

          <Tooltip
            cursor={{ fill: 'rgba(245, 158, 11, 0.10)' }}
            content={<CustomTooltip />}
          />

          <Bar
            dataKey="total"
            radius={[6, 6, 0, 0]}
            maxBarSize={48}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {data.map((_, i) => (
              <Cell key={i} fill="url(#expenseBar)" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpenseChart;