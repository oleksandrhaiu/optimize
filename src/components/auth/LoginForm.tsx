import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOAuth = async (provider: 'google' | 'github') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/tracker` },
    });
    if (error) setError(error.message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let loginEmail = email;

    // Support username login
    if (!email.includes('@')) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .ilike('username', email)
        .maybeSingle();

      if (userError || !userData) {
        setError('User not found');
        setLoading(false);
        return;
      }
      loginEmail = userData.email;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const invite = params.get('invite');
    navigate(invite ? `/invite/${invite}` : '/tracker');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div
          className="text-sm px-4 py-3 rounded-xl"
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#F87171',
          }}
        >
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-sm text-text-muted">Email or Username</label>
        <input
          id="login-email"
          type="text"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="input-base"
          placeholder="you@example.com or username"
          autoComplete="email"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm text-text-muted">Password</label>
        <input
          id="login-password"
          type="password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="input-base"
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </div>

      <button type="submit" disabled={loading} className="w-full btn-primary mt-2 py-3">
        {loading && (
          <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin" fill="none">
            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        )}
        {loading ? 'Signing in…' : 'Sign In'}
      </button>

      <div className="relative py-4 flex items-center">
        <div className="flex-grow border-t" style={{ borderColor: 'rgba(28,30,52,0.8)' }} />
        <span className="flex-shrink-0 mx-4 text-text-subtle text-xs uppercase tracking-wider">Or</span>
        <div className="flex-grow border-t" style={{ borderColor: 'rgba(28,30,52,0.8)' }} />
      </div>

      <button
        type="button"
        onClick={() => handleOAuth('google')}
        className="w-full btn-secondary flex gap-2 items-center justify-center py-3"
      >
        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continue with Google
      </button>

      <p className="text-center text-sm text-text-muted">
        Don't have an account?{' '}
        <Link
          to={`/register${params.get('invite') ? `?invite=${params.get('invite')}` : ''}`}
          className="font-medium"
          style={{ color: '#A78BFA' }}
        >
          Create one
        </Link>
      </p>
    </form>
  );
};
