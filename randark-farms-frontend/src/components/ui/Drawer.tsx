import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  side?: 'right' | 'left';
  size?: 'sm' | 'md' | 'lg';
}

const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, title, children, footer, side = 'right', size = 'md' }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div
        className={cn(
          'relative bg-white dark:bg-gray-800 shadow-xl h-full w-full flex flex-col',
          widthClasses[size],
          side === 'right' ? 'ml-auto' : 'mr-auto'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">{footer}</div>}
      </div>
    </div>
  );
};

export default Drawer;