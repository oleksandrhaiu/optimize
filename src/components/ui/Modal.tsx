import React, { useEffect } from 'react';
import { clx } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: 'sm' | 'md' | 'lg';
}

const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' };

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, width = 'md' }) => {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />
      {/* Panel */}
      <div
        className={clx(
          'relative w-full bg-card border border-border rounded-2xl shadow-2xl animate-slide-up z-10',
          widths[width],
        )}
      >
        {(title || true) && (
          <div className="flex items-center justify-between p-5 border-b border-border">
            {title && <h2 className="font-heading font-semibold text-text-primary">{title}</h2>}
            <button
              onClick={onClose}
              className="ml-auto text-text-muted hover:text-text-primary transition-colors"
              aria-label="Close modal"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M2 2L16 16M16 2L2 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};
