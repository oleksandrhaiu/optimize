import React from 'react';
import { motion } from 'framer-motion';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import type { Habit } from '@/types';

interface WeeklyReviewProps {
  reviewData: {
    weekCompletionPct: number;
    greenDays: number;
    bestHabits: Array<{ habit: Habit; completionRate: number }>;
    totalScheduledDays: number;
  };
  onDismiss: () => void;
}

const getRating = (pct: number): { label: string; color: string; emoji: string } => {
  if (pct >= 90) return { label: 'Outstanding', color: '#10B981', emoji: '🏆' };
  if (pct >= 75) return { label: 'Great week',  color: '#34D399', emoji: '🔥' };
  if (pct >= 50) return { label: 'Solid effort',color: '#F59E0B', emoji: '💪' };
  if (pct >= 25) return { label: 'Keep going',  color: '#F97316', emoji: '📈' };
  return           { label: 'Fresh start',  color: '#A78BFA', emoji: '🌱' };
};

export const WeeklyReview: React.FC<WeeklyReviewProps> = ({ reviewData, onDismiss }) => {
  const { weekCompletionPct, greenDays, bestHabits } = reviewData;
  const rating = getRating(weekCompletionPct);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md"
      style={{ height: '100dvh', width: '100vw' }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="w-[90%] max-w-sm mx-auto rounded-[2.5rem] overflow-hidden"
        style={{
          background: 'rgba(12,13,22,0.97)',
          border: '1px solid rgba(28,30,52,0.9)',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header glow */}
        <div
          className="relative px-7 pt-8 pb-6 text-center"
          style={{ background: `linear-gradient(180deg, ${rating.color}12, transparent)` }}
        >
          <p className="text-4xl mb-2">{rating.emoji}</p>
          <p className="text-[11px] text-text-subtle uppercase tracking-[0.15em] font-bold mb-1">Weekly Review</p>
          <h2 className="font-heading font-black text-2xl text-text-primary">{rating.label}</h2>
        </div>

        <div className="px-7 pb-7 space-y-5">
          {/* Main stat */}
          <div
            className="rounded-2xl p-5 text-center"
            style={{
              background: `linear-gradient(135deg, ${rating.color}12, rgba(12,13,22,0.8))`,
              border: `1px solid ${rating.color}25`,
            }}
          >
            <p
              className="font-heading font-black text-5xl"
              style={{ color: rating.color }}
            >
              <AnimatedNumber value={weekCompletionPct} suffix="%" />
            </p>
            <p className="text-xs text-text-muted mt-1">weekly completion</p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <p className="font-heading font-bold text-2xl" style={{ color: '#10B981' }}>
                <AnimatedNumber value={greenDays} />
              </p>
              <p className="text-[10px] text-text-muted mt-0.5">perfect days</p>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)' }}>
              <p className="font-heading font-bold text-2xl text-violet">
                7
              </p>
              <p className="text-[10px] text-text-muted mt-0.5">days tracked</p>
            </div>
          </div>

          {/* Best habits */}
          {bestHabits.length > 0 && (
            <div>
              <p className="text-[11px] text-text-subtle uppercase tracking-wider font-bold mb-2.5">Top habits this week</p>
              <div className="space-y-2">
                {bestHabits.map(({ habit, completionRate }, i) => (
                  <div key={habit.id} className="flex items-center gap-3">
                    <span className="text-sm w-5 text-center text-text-subtle font-mono">{i + 1}.</span>
                    <span className="text-lg">{habit.icon ?? '•'}</span>
                    <span className="text-sm text-text-primary flex-1 truncate">{habit.name}</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-1 rounded-full w-16"
                        style={{ background: `linear-gradient(90deg, #8B5CF6 ${completionRate}%, rgba(28,30,52,0.6) ${completionRate}%)` }}
                      />
                      <span
                        className="text-xs font-mono font-semibold w-9 text-right"
                        style={{ color: completionRate >= 80 ? '#10B981' : completionRate >= 50 ? '#F59E0B' : '#EF4444' }}
                      >
                        {completionRate}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={onDismiss}
            className="w-full py-3.5 rounded-2xl bg-accent text-bg font-bold text-sm hover:bg-accent/90 active:scale-95 transition-all shadow-lg shadow-accent/20"
          >
            Start a new week 🚀
          </button>

          <button
            onClick={onDismiss}
            className="w-full text-[10px] text-text-subtle hover:text-text-muted transition-colors uppercase tracking-widest font-bold pb-1"
          >
            Dismiss
          </button>
        </div>
      </motion.div>
    </div>
  );
};
