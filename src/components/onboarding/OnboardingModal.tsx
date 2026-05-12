import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clx } from '@/lib/utils';

const STEPS = [
  {
    emoji: '👋',
    title: 'Welcome to Lumina',
    description: 'Build better habits together. Track daily, stay consistent, and see your progress over time.',
  },
  {
    emoji: '📋',
    title: 'Add your first habits',
    description: 'Go to Settings → My Habits and add habits you want to track. Use templates to get started instantly.',
  },
  {
    emoji: '✅',
    title: 'Log every day',
    description: 'Check off habits in the Tracker. For numeric habits, enter your value. Tap a habit name to see its full history.',
  },
  {
    emoji: '👥',
    title: 'Stay accountable',
    description: 'Invite friends, see their progress in real time, and compete on the weekly leaderboard.',
  },
];

const STORAGE_KEY = 'lumina.onboarded';

export function useOnboarding(habitsLength: number) {
  const [show, setShow] = useState(() => {
    return !localStorage.getItem(STORAGE_KEY) && habitsLength === 0;
  });

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setShow(false);
  };

  return { show, dismiss };
}

export const OnboardingModal: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for next, -1 for back
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) { onDone(); return; }
    setDirection(1);
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setDirection(-1);
    setStep(s => s - 1);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card border border-border rounded-[2rem] w-full max-w-sm shadow-2xl overflow-hidden text-center flex flex-col my-auto max-h-[calc(100dvh-2rem)]"
      >
        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 pt-6 shrink-0">
          {STEPS.map((_, i) => (
            <div key={i} className={clx(
              'h-1.5 rounded-full transition-all duration-300',
              i === step ? 'w-6 bg-accent' : i < step ? 'w-3 bg-accent/40' : 'w-3 bg-border',
            )} />
          ))}
        </div>
 
        {/* Content Area with Animation */}
        <div className="relative min-h-[240px] px-6 py-6 overflow-hidden flex-1 flex flex-col justify-center">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.15 }
              }}
              className="flex flex-col items-center justify-center"
            >
              <div className="text-5xl sm:text-6xl mb-4 sm:mb-6">{current.emoji}</div>
              <h2 className="font-heading font-bold text-lg sm:text-xl text-text-primary mb-2 sm:mb-3">{current.title}</h2>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed text-center px-2">{current.description}</p>
            </motion.div>
          </AnimatePresence>
        </div>
 
        {/* Actions */}
        <div className="flex items-center gap-2 px-6 pb-6 mt-auto shrink-0">
          {step > 0 && (
            <button onClick={handleBack}
              className="flex-1 py-3 rounded-2xl border border-border text-sm text-text-muted hover:text-text-primary transition-all font-medium">
              Back
            </button>
          )}
          <button onClick={handleNext}
            className="flex-1 py-3 rounded-2xl bg-accent text-bg text-sm font-bold hover:bg-accent/90 transition-all shadow-lg shadow-accent/20">
            {isLast ? "Let's go! 🚀" : 'Next →'}
          </button>
        </div>
 
        {/* Skip */}
        {!isLast && (
          <button onClick={onDone} className="text-[10px] text-text-subtle hover:text-text-muted pb-4 transition-colors uppercase tracking-widest font-bold shrink-0">
            Skip intro
          </button>
        )}
      </motion.div>
    </div>
  );
};
