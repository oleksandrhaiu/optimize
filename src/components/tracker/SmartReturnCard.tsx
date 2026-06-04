import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SmartReturn } from '@/lib/smartReturn';
import { useTranslation } from 'react-i18next';

interface SmartReturnCardProps extends SmartReturn {
  onDismiss: () => void;
  onToggleHabit?: (habitId: string) => void;
}

// ─── Drift card (2–7 days away) ──────────────────────────────────────────────

const DriftCard: React.FC<SmartReturnCardProps> = ({
  gapDays, suggestedHabit, suggestedHabitRate, onDismiss, onToggleHabit,
}) => {
  const { t } = useTranslation();

  return (
    <motion.div
      className="rounded-2xl p-5 mb-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.07) 0%, rgba(12,13,22,0.7) 100%)',
        border: '1px solid rgba(139,92,246,0.18)',
      }}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
    >
      {/* Ambient glow */}
      <div
        className="absolute -top-10 -left-10 w-40 h-40 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(139,92,246,0.08)' }}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">👋</span>
            <p className="font-heading font-bold text-base text-text-primary">
              {t('smartReturn.welcomeBack')}
            </p>
          </div>

          {/* Message — compassionate, no shame */}
          <p className="text-sm text-text-muted mb-4 leading-relaxed">
            {t('smartReturn.driftMessage', { days: gapDays })}
          </p>

          {/* Suggested habit — THE key insight */}
          {suggestedHabit && (
            <div
              className="rounded-xl p-3.5 mb-3"
              style={{
                background: 'rgba(139,92,246,0.06)',
                border: '1px solid rgba(139,92,246,0.14)',
              }}
            >
              <p className="text-[10px] text-text-subtle uppercase tracking-wider font-semibold mb-2">
                {t('smartReturn.startWith')}
              </p>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  {suggestedHabit.icon && (
                    <span className="text-xl flex-shrink-0">{suggestedHabit.icon}</span>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      {suggestedHabit.name}
                    </p>
                    <p className="text-[10px] text-text-subtle">
                      {t('smartReturn.completionRate', { rate: suggestedHabitRate })}
                    </p>
                  </div>
                </div>

                {onToggleHabit && (
                  <button
                    onClick={() => { onToggleHabit(suggestedHabit.id); onDismiss(); }}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200"
                    style={{
                      background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                      color: '#fff',
                      boxShadow: '0 4px 12px rgba(139,92,246,0.35)',
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {t('smartReturn.doItNow')}
                  </button>
                )}
              </div>
            </div>
          )}

          <p className="text-[11px] text-text-subtle italic">
            {t('smartReturn.neverMissTwice')}
          </p>
        </div>

        {/* Dismiss */}
        <button
          onClick={onDismiss}
          className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-lg text-text-subtle hover:text-text-muted transition-colors"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
};

// ─── Reset card (8+ days away) ────────────────────────────────────────────────

const ResetCard: React.FC<SmartReturnCardProps> = ({
  gapDays, suggestedHabit, onDismiss, onToggleHabit,
}) => {
  const { t } = useTranslation();

  return (
    <motion.div
      className="rounded-2xl p-5 mb-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(12,13,22,0.7) 100%)',
        border: '1px solid rgba(16,185,129,0.18)',
      }}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
    >
      <div
        className="absolute -top-10 -right-10 w-44 h-44 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(16,185,129,0.07)' }}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🌱</span>
            <p className="font-heading font-bold text-base text-text-primary">
              {t('smartReturn.freshStart')}
            </p>
          </div>

          <p className="text-sm text-text-muted mb-4 leading-relaxed">
            {t('smartReturn.resetMessage', { days: gapDays })}
          </p>

          {/* One habit focus */}
          {suggestedHabit && (
            <div
              className="rounded-xl p-3.5 mb-3"
              style={{
                background: 'rgba(16,185,129,0.05)',
                border: '1px solid rgba(16,185,129,0.14)',
              }}
            >
              <p className="text-[10px] text-text-subtle uppercase tracking-wider font-semibold mb-2">
                {t('smartReturn.oneHabitToday')}
              </p>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  {suggestedHabit.icon && (
                    <span className="text-xl flex-shrink-0">{suggestedHabit.icon}</span>
                  )}
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {suggestedHabit.name}
                  </p>
                </div>
                {onToggleHabit && (
                  <button
                    onClick={() => { onToggleHabit(suggestedHabit.id); onDismiss(); }}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #10B981, #059669)',
                      color: '#fff',
                      boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {t('smartReturn.doItNow')}
                  </button>
                )}
              </div>
            </div>
          )}

          <p className="text-[11px] text-text-subtle italic">
            {t('smartReturn.compassion')}
          </p>
        </div>

        <button
          onClick={onDismiss}
          className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-lg text-text-subtle hover:text-text-muted transition-colors"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
};

// ─── Public component ─────────────────────────────────────────────────────────

export const SmartReturnCard: React.FC<SmartReturnCardProps> = (props) => (
  <AnimatePresence>
    {props.state === 'drift' && <DriftCard key="drift" {...props} />}
    {props.state === 'reset' && <ResetCard key="reset" {...props} />}
  </AnimatePresence>
);
