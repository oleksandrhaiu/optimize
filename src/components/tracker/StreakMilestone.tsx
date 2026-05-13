import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MILESTONE_CONFIG: Record<number, { emoji: string; label: string; color: string }> = {
  7:   { emoji: '🔥', label: '1 Week Streak!',    color: '#F59E0B' },
  14:  { emoji: '⚡', label: '2 Weeks Strong!',   color: '#A78BFA' },
  30:  { emoji: '🏆', label: '30-Day Champion!',  color: '#F59E0B' },
  60:  { emoji: '💎', label: '60 Days Unstoppable!', color: '#60A5FA' },
  100: { emoji: '🚀', label: '100-Day Legend!',   color: '#10B981' },
  365: { emoji: '⭐', label: 'One Full Year!',    color: '#F472B6' },
};

interface StreakMilestoneProps {
  streak: number;
  onDismiss: () => void;
}

export const StreakMilestone: React.FC<StreakMilestoneProps> = ({ streak, onDismiss }) => {
  const config = MILESTONE_CONFIG[streak];
  if (!config) return null;

  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onDismiss}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          onClick={e => e.stopPropagation()}
          className="relative flex flex-col items-center text-center px-10 py-10 rounded-[2rem] max-w-xs w-full mx-4"
          style={{
            background: 'rgba(12,13,22,0.96)',
            border: `1px solid ${config.color}30`,
            boxShadow: `0 0 60px ${config.color}20, 0 40px 80px rgba(0,0,0,0.5)`,
          }}
        >
          {/* Glow ring */}
          <div
            className="absolute inset-0 rounded-[2rem] pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 50% 0%, ${config.color}15, transparent 70%)`,
            }}
          />

          {/* Emoji */}
          <motion.div
            animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-7xl mb-4 relative z-10"
          >
            {config.emoji}
          </motion.div>

          {/* Streak number */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-heading font-black text-7xl mb-1 relative z-10"
            style={{ color: config.color }}
          >
            {streak}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-xs text-text-subtle uppercase tracking-widest font-bold mb-4 relative z-10"
          >
            day streak
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="font-heading font-bold text-xl text-text-primary mb-6 relative z-10"
          >
            {config.label}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 1 }}
            className="text-[10px] text-text-subtle relative z-10"
          >
            Tap anywhere to continue
          </motion.p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
