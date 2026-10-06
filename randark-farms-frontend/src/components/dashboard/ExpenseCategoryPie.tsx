import React from 'react';
import DonutChart, { DonutSlice } from './DonutChart';

interface Props {
  data: { category: string; total: number }[];
}

const PALETTE = [
  '#10b981',
  '#f59e0b',
  '#3b82f6',
  '#8b5cf6',
  '#ef4444',
  '#06b6d4',
  '#ec4899',
  '#84cc16',
  '#f97316',
  '#6366f1',
];

const ExpenseCategoryPie: React.FC<Props> = ({ data }) => {
  const sorted = [...(data || [])]
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  const slices: DonutSlice[] = sorted.map((d, i) => ({
    label: d.category,
    value: Math.round(d.total),
    color: PALETTE[i % PALETTE.length],
  }));

  const total = slices.reduce((sum, s) => sum + s.value, 0);

  return (
    <DonutChart
      data={slices}
      centerLabel="Total (GHS)"
      centerValue={total}
      emptyMessage="No expense categories yet"
    />
  );
};

export default ExpenseCategoryPie;