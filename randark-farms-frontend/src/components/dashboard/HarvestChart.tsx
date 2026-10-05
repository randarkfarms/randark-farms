import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface HarvestChartProps {
  data: { month: string; quantity: number }[];
}

const formatQuantity = (n: number) => {
  if (n == null) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString();
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
        <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
        <span className="text-sm font-semibold text-emerald-600">
          {value.toLocaleString()}
        </span>
        <span className="text-[11px] text-gray-500">units harvested</span>
      </div>
    </div>
  );
};

const HarvestChart: React.FC<HarvestChartProps> = ({ data }) => {
  const hasData = Array.isArray(data) && data.length > 0;

  if (!hasData) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-500">
        No harvest data yet
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 8, bottom: 0, left: -12 }}
        >
          <defs>
            <linearGradient id="harvestFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
              <stop offset="60%" stopColor="#10b981" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="harvestStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#34d399" />
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
            tickFormatter={formatQuantity}
            width={48}
          />

          <Tooltip
            cursor={{
              stroke: '#10b981',
              strokeWidth: 1,
              strokeDasharray: '3 3',
            }}
            content={<CustomTooltip />}
          />

          <Area
            type="monotone"
            dataKey="quantity"
            stroke="url(#harvestStroke)"
            strokeWidth={2.75}
            fill="url(#harvestFill)"
            dot={{
              r: 3.5,
              fill: '#10b981',
              stroke: 'white',
              strokeWidth: 1.5,
            }}
            activeDot={{
              r: 6,
              fill: '#10b981',
              stroke: 'white',
              strokeWidth: 2.5,
            }}
            animationDuration={900}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HarvestChart;