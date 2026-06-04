import React, { useEffect, useState, useCallback } from 'react';

// ─── Event bus (no context needed) ─────────────────────────────────────────────

type ToastType = 'error' | 'success' | 'info';

interface ToastEvent {
  id: number;
  message: string;
  type: ToastType;
}

let _id = 0;
const listeners: Set<(e: ToastEvent) => void> = new Set();

export function showToast(message: string, type: ToastType = 'info') {
  const event: ToastEvent = { id: ++_id, message, type };
  listeners.forEach(fn => fn(event));
}

export function showErrorToast(message: string) {
  showToast(message, 'error');
}

// ─── Toast item ─────────────────────────────────────────────────────────────────

const ICONS: Record<ToastType, string> = {
  error: '⚠️',
  success: '✅',
  info: 'ℹ️',
};

const COLORS: Record<ToastType, { border: string; bg: string; text: string }> = {
  error: {
    border: 'rgba(239,68,68,0.35)',
    bg: 'rgba(239,68,68,0.08)',
    text: '#FCA5A5',
  },
  success: {
    border: 'rgba(16,185,129,0.35)',
    bg: 'rgba(16,185,129,0.08)',
    text: '#6EE7B7',
  },
  info: {
    border: 'rgba(139,92,246,0.35)',
    bg: 'rgba(139,92,246,0.08)',
    text: '#C4B5FD',
  },
};

const ToastItem: React.FC<{ toast: ToastEvent; onDone: (id: number) => void }> = ({ toast, onDone }) => {
  const [visible, setVisible] = useState(false);
  const c = COLORS[toast.type];

  useEffect(() => {
    // Trigger entrance
    const show = setTimeout(() => setVisible(true), 10);
    // Auto-dismiss
    const hide = setTimeout(() => setVisible(false), 3500);
    const remove = setTimeout(() => onDone(toast.id), 4000);
    return () => { clearTimeout(show); clearTimeout(hide); clearTimeout(remove); };
  }, [toast.id, onDone]);

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg transition-all duration-300"
      style={{
        background: `rgba(12,13,22,0.95)`,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${c.border}`,
        boxShadow: `0 0 20px ${c.border}, 0 8px 32px rgba(0,0,0,0.5)`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.96)',
        pointerEvents: 'auto',
      }}
    >
      <span className="text-lg leading-none flex-shrink-0">{ICONS[toast.type]}</span>
      <p className="text-sm font-medium" style={{ color: c.text }}>{toast.message}</p>
      <button
        onClick={() => { setVisible(false); setTimeout(() => onDone(toast.id), 300); }}
        className="ml-1 text-text-subtle hover:text-text-muted transition-colors flex-shrink-0"
        aria-label="Dismiss"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
};

// ─── Toast container (mount once in App) ───────────────────────────────────────

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastEvent[]>([]);

  useEffect(() => {
    const handler = (e: ToastEvent) => setToasts(prev => [...prev, e]);
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  const remove = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-20 md:bottom-6 left-1/2 z-[9999] flex flex-col gap-2 pointer-events-none"
      style={{ transform: 'translateX(-50%)', minWidth: '280px', maxWidth: '420px' }}
    >
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDone={remove} />
      ))}
    </div>
  );
};
