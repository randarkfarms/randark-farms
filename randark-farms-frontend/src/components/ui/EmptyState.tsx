import React from 'react';
import { cn } from '@/lib/utils';
import Button from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, actionLabel, onAction, className }) => {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      {icon && <div className="text-gray-400 mb-4">{icon}</div>}
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
      {description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-md">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-4" variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;