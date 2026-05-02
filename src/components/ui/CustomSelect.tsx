import React, { useState, useRef, useEffect } from 'react';
import { clx } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
  icon?: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options, className }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value) ?? options[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className={clx('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={clx(
          'w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl',
          'bg-bg border text-sm text-text-primary transition-all duration-150',
          open ? 'border-blue/50 ring-2 ring-blue/10' : 'border-border hover:border-text-subtle',
        )}
      >
        <span className="flex items-center gap-2">
          {selected?.icon && <span>{selected.icon}</span>}
          {selected?.label}
        </span>
        <svg
          className={clx('text-text-muted transition-transform duration-150 flex-shrink-0', open && 'rotate-180')}
          width="12" height="12" viewBox="0 0 12 12" fill="none"
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 bg-card border border-border rounded-xl shadow-card overflow-hidden animate-slide-up">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={clx(
                'w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors duration-100 text-left',
                opt.value === value
                  ? 'bg-accent-green/10 text-accent-green'
                  : 'text-text-primary hover:bg-white/[0.04]',
              )}
            >
              {opt.icon && <span>{opt.icon}</span>}
              {opt.label}
              {opt.value === value && (
                <svg className="ml-auto" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
