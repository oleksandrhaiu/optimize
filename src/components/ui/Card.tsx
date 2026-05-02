import React from 'react';
import { clx } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const Card: React.FC<CardProps> = ({ children, className, padding = 'md' }) => {
  return (
    <div className={clx('bg-card border border-border rounded-2xl', paddings[padding], className)}>
      {children}
    </div>
  );
};
