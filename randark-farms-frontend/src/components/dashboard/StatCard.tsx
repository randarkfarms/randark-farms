import React from 'react';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, subtext, trend, trendLabel, className }) => {
  return (
    <Card className={cn('flex items-start justify-between', className)}>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        {trendLabel && (
          <p className={cn('text-xs mt-1', trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500')}>
            {trendLabel}
          </p>
        )}
      </div>
      <div className="p-2 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
        {icon}
      </div>
    </Card>
  );
};

export default StatCard;