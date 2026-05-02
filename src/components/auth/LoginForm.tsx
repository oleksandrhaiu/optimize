import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';

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
      options: {
        redirectTo: `${window.location.origin}/tracker`,
      },
    });
    if (error) setError(error.message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // If there's an invite token in URL, redirect to accept it
    const invite = params.get('invite');
    navigate(invite ? `/invite/${invite}` : '/tracker');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red/10 border border-red/30 text-red text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}
      <div className="space-y-1.5">
        <label className="text-sm text-text-muted">Email</label>
        <input
          id="login-email"
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="input-base"
          placeholder="you@example.com"
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
      <Button type="submit" loading={loading} className="w-full mt-2">
        Sign In
      </Button>

      <div className="relative py-4 flex items-center">
        <div className="flex-grow border-t border-border"></div>
        <span className="flex-shrink-0 mx-4 text-text-muted text-xs uppercase tracking-wider">Or continue with</span>
        <div className="flex-grow border-t border-border"></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button type="button" variant="secondary" onClick={() => handleOAuth('google')} className="w-full text-sm">
          Google
        </Button>
        <Button type="button" variant="secondary" onClick={() => handleOAuth('github')} className="w-full text-sm">
          GitHub
        </Button>
      </div>
      <p className="text-center text-sm text-text-muted">
        Don't have an account?{' '}
        <Link
          to={`/register${params.get('invite') ? `?invite=${params.get('invite')}` : ''}`}
          className="text-accent-green hover:underline"
        >
          Create one
        </Link>
      </p>
    </form>
  );
};
