import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: number;
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 24, className }) => {
  return <Loader2 className={cn('animate-spin text-brand-600', className)} size={size} />;
};

export default Spinner;