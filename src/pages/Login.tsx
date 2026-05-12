import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { Logo } from '@/components/ui/Logo';

export const Login: React.FC = () => (
  <div
    className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
    style={{ background: 'rgb(7,8,15)' }}
  >
    {/* Background orbs */}
    <div
      className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-20"
      style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)', filter: 'blur(80px)' }}
    />
    <div
      className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-15"
      style={{ background: 'radial-gradient(circle, #6366F1 0%, transparent 70%)', filter: 'blur(100px)' }}
    />
    <div
      className="absolute top-[40%] right-[20%] w-[200px] h-[200px] rounded-full opacity-10"
      style={{ background: 'radial-gradient(circle, #10B981 0%, transparent 70%)', filter: 'blur(60px)' }}
    />

    <div className="w-full max-w-sm relative z-10">
      {/* Logo */}
      <div className="text-center space-y-4 mb-8">
        <div className="relative inline-block animate-float" style={{ animationDuration: '4s' }}>
          <Logo size={64} className="drop-shadow-[0_0_24px_rgba(139,92,246,0.3)] mx-auto" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">Lumina</h1>
          <p className="text-text-muted text-sm mt-1">Track habits. Stay accountable.</p>
        </div>
      </div>

      {/* Glass card */}
      <div
        className="rounded-2xl p-6 animate-scale-in"
        style={{
          background: 'rgba(12,13,22,0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(139,92,246,0.15)',
          borderTopColor: 'rgba(255,255,255,0.06)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.08)',
        }}
      >
        <h2 className="font-heading font-semibold text-lg text-text-primary mb-5">Sign In</h2>
        <LoginForm />
      </div>
    </div>
  </div>
);
