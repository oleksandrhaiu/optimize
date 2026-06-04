import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CHANGELOG, LATEST_VERSION, hasUnseenUpdate, markAsSeen } from '@/lib/changelog';
import type { ChangelogEntry } from '@/lib/changelog';

// ─── Shared util ─────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

// ─── Single entry card (used in full history) ────────────────────────────────

const EntryCard: React.FC<{ entry: ChangelogEntry; isLatest?: boolean }> = ({ entry, isLatest }) => (
  <div
    className="rounded-2xl p-4 space-y-3"
    style={{
      background: isLatest
        ? 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(12,13,22,0.6))'
        : 'rgba(12,13,22,0.5)',
      border: `1px solid ${isLatest ? 'rgba(139,92,246,0.2)' : 'rgba(28,30,52,0.6)'}`,
    }}
  >
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <span className="text-xl leading-none">{entry.emoji}</span>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-text-primary">{entry.title}</p>
            {isLatest && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(139,92,246,0.2)', color: '#A78BFA' }}
              >
                NEW
              </span>
            )}
          </div>
          <p className="text-[11px] text-text-subtle mt-0.5">{formatDate(entry.date)}</p>
        </div>
      </div>
      <span
        className="text-[10px] font-mono px-2 py-0.5 rounded-lg flex-shrink-0"
        style={{ background: 'rgba(28,30,52,0.8)', color: 'rgb(100,104,148)' }}
      >
        v{entry.version}
      </span>
    </div>

    <ul className="space-y-1.5">
      {entry.features.map((f, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className="text-sm leading-tight flex-shrink-0 mt-0.5">{f.icon}</span>
          <span className="text-xs text-text-muted leading-relaxed">{f.text}</span>
        </li>
      ))}
    </ul>
  </div>
);

// ─── Full history modal ───────────────────────────────────────────────────────

interface HistoryModalProps {
  onClose: () => void;
}

export const UpdatesHistoryModal: React.FC<HistoryModalProps> = ({ onClose }) => (
  <AnimatePresence>
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="w-full max-w-md max-h-[85vh] flex flex-col rounded-3xl overflow-hidden"
        style={{
          background: 'rgba(10,11,20,0.98)',
          border: '1px solid rgba(28,30,52,0.9)',
          boxShadow: '0 40px 80px rgba(0,0,0,0.7)',
        }}
        initial={{ scale: 0.93, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 8 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
          <div>
            <p className="text-[11px] text-text-subtle uppercase tracking-widest font-bold mb-0.5">App Updates</p>
            <h2 className="font-heading font-black text-xl text-text-primary">What's New</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3 scrollbar-hide">
          {CHANGELOG.map((entry, i) => (
            <EntryCard key={entry.version} entry={entry} isLatest={i === 0} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

// ─── Auto "What's New" modal (shown once per version) ────────────────────────

interface WhatsNewModalProps {
  onClose: () => void;
}

export const WhatsNewModal: React.FC<WhatsNewModalProps> = ({ onClose }) => {
  const latest = CHANGELOG[0];

  const handleClose = () => {
    markAsSeen();
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(16px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={e => e.target === e.currentTarget && handleClose()}
      >
        <motion.div
          className="w-full max-w-sm rounded-[2rem] overflow-hidden"
          style={{
            background: 'rgba(10,11,20,0.99)',
            border: '1px solid rgba(139,92,246,0.2)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(139,92,246,0.08)',
          }}
          initial={{ y: 40, scale: 0.94, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: 20, scale: 0.96, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        >
          {/* Header glow */}
          <div
            className="relative px-7 pt-8 pb-5 text-center"
            style={{ background: 'linear-gradient(180deg, rgba(139,92,246,0.1), transparent)' }}
          >
            <div
              className="absolute -top-6 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full blur-3xl pointer-events-none"
              style={{ background: 'rgba(139,92,246,0.15)' }}
            />
            <span className="text-4xl mb-3 block relative z-10">{latest.emoji}</span>
            <p className="text-[10px] text-text-subtle uppercase tracking-[0.15em] font-bold mb-1 relative z-10">
              What's New · v{latest.version}
            </p>
            <h2 className="font-heading font-black text-2xl text-text-primary relative z-10">
              {latest.title}
            </h2>
            <p className="text-xs text-text-subtle mt-1 relative z-10">{formatDate(latest.date)}</p>
          </div>

          {/* Features list */}
          <div className="px-6 pb-6 space-y-2.5">
            {latest.features.map((f, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{
                  background: 'rgba(139,92,246,0.04)',
                  border: '1px solid rgba(139,92,246,0.1)',
                }}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
              >
                <span className="text-lg leading-none flex-shrink-0">{f.icon}</span>
                <p className="text-sm text-text-muted leading-snug">{f.text}</p>
              </motion.div>
            ))}

            <motion.button
              onClick={handleClose}
              className="w-full mt-4 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                color: '#fff',
                boxShadow: '0 8px 24px rgba(139,92,246,0.35)',
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              whileTap={{ scale: 0.97 }}
            >
              Got it, let's go! 🚀
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWhatsNew() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Small delay so it doesn't flash on first paint
    const t = setTimeout(() => {
      if (hasUnseenUpdate()) setShow(true);
    }, 800);
    return () => clearTimeout(t);
  }, []);

  return { show, dismiss: () => { markAsSeen(); setShow(false); } };
}

export { LATEST_VERSION, hasUnseenUpdate };
