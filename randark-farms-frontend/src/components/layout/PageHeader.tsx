import React from 'react';
import Button from '@/components/ui/Button';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actionLabel, onAction, icon }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} icon={icon}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default PageHeader;