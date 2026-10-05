import React from 'react';
import { cn } from '@/lib/utils';

interface TableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

const Table: React.FC<TableProps> = ({ headers, children, className }) => {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {headers.map((header, idx) => (
              <th
                key={idx}
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
          {children}
        </tbody>
      </table>
    </div>
  );
};

export const TableRow: React.FC<{ children: React.ReactNode; onClick?: () => void; className?: string }> = ({ children, onClick, className }) => (
  <tr
    onClick={onClick}
    className={cn('hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors', className)}
  >
    {children}
  </tr>
);

export const TableCell: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <td className={cn('px-4 py-3 text-sm text-gray-900 dark:text-gray-100', className)}>{children}</td>
);

export default Table;