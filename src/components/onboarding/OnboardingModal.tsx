import React, { useState } from 'react';
import { clx } from '@/lib/utils';

const STEPS = [
  {
    emoji: '👋',
    title: 'Welcome to HabitSync',
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

const STORAGE_KEY = 'habitSync.onboarded';

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
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) { onDone(); return; }
    setStep(s => s + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-card animate-slide-up text-center">
        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 pt-5">
          {STEPS.map((_, i) => (
            <div key={i} className={clx(
              'h-1.5 rounded-full transition-all duration-300',
              i === step ? 'w-6 bg-accent-green' : i < step ? 'w-3 bg-accent-green/40' : 'w-3 bg-border',
            )} />
          ))}
        </div>

        {/* Content */}
        <div className="px-8 py-7">
          <div className="text-5xl mb-4 animate-fade-in" key={step}>{current.emoji}</div>
          <h2 className="font-heading font-bold text-lg text-text-primary mb-2">{current.title}</h2>
          <p className="text-sm text-text-muted leading-relaxed">{current.description}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 px-6 pb-6">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm text-text-muted hover:text-text-primary hover:border-border transition-all">
              Back
            </button>
          )}
          <button onClick={handleNext}
            className="flex-1 py-2.5 rounded-xl bg-accent-green text-bg text-sm font-semibold hover:bg-accent-green/90 transition-all">
            {isLast ? "Let's go! 🚀" : 'Next →'}
          </button>
        </div>

        {/* Skip */}
        {!isLast && (
          <button onClick={onDone} className="text-[10px] text-text-subtle hover:text-text-muted pb-4 transition-colors">
            Skip intro
          </button>
        )}
      </div>
    </div>
  );
};
