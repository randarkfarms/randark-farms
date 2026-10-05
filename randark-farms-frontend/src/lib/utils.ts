import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';
import { DATE_FORMAT } from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, pattern = DATE_FORMAT) {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern);
}

export function formatCurrency(amount: number, currency = 'GH₵') {
  return `${currency} ${amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, length = 50) {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function isToday(date: string | Date) {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
}

export function isOverdue(date: string | Date) {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return d < new Date() && !isToday(d);
}