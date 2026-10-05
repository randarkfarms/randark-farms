import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className, onClick, hoverable }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'card p-5',
        hoverable && 'transition-shadow hover:shadow-card-hover cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;