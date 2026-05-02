import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

export const Login: React.FC = () => (
  <div className="min-h-screen bg-bg flex items-center justify-center p-4">
    <div className="w-full max-w-sm space-y-8 animate-slide-up">
      {/* Logo */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-accent-green/15 border border-accent-green/30 flex items-center justify-center mx-auto">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M4 14L10.5 20.5L24 6" stroke="#00C896" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="font-heading text-2xl font-bold text-text-primary">HabitSync</h1>
        <p className="text-text-muted text-sm">Track habits. Stay accountable.</p>
      </div>

      {/* Card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl">
        <h2 className="font-heading font-semibold text-text-primary mb-5">Sign In</h2>
        <LoginForm />
      </div>
    </div>
  </div>
);
