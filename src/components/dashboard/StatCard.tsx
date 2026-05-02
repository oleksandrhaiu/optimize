import React from 'react';
import { Card } from '@/components/ui/Card';
import { clx } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  color?: 'green' | 'blue' | 'amber' | 'red';
  subtitle?: string;
}

const colorMap = {
  green: { bg: 'bg-accent/10', border: 'border-accent/20', text: 'text-accent', icon: 'bg-accent/15' },
  blue:  { bg: 'bg-blue/10', border: 'border-blue/20', text: 'text-blue', icon: 'bg-blue/15' },
  amber: { bg: 'bg-amber/10', border: 'border-amber/20', text: 'text-amber', icon: 'bg-amber/15' },
  red:   { bg: 'bg-red/10', border: 'border-red/20', text: 'text-red', icon: 'bg-red/15' },
};

export const StatCard: React.FC<StatCardProps> = ({ label, value, unit, icon, color = 'green', subtitle }) => {
  const c = colorMap[color];
  return (
    <div className={clx('rounded-2xl border p-5 flex items-start gap-4', c.bg, c.border)}>
      <div className={clx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', c.icon)}>
        <span className={c.text}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-text-muted text-xs font-medium mb-1">{label}</p>
        <p className={clx('font-mono-nums text-2xl font-semibold', c.text)}>
          {value}
          {unit && <span className="text-sm font-normal text-text-muted ml-1">{unit}</span>}
        </p>
        {subtitle && <p className="text-text-muted text-xs mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
};
