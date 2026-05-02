import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { randomAvatarColor } from '@/lib/utils';

type Step = 'credentials' | 'username';

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [step, setStep] = useState<Step>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      setUserId(data.user.id);
      setStep('username');
    }
    setLoading(false);
  };

  const handleUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setError('');
    setLoading(true);

    // Check username uniqueness
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('username', username.toLowerCase())
      .maybeSingle();

    if (existing) {
      setError('Username already taken. Try another.');
      setLoading(false);
      return;
    }

    // Create profile
    const { error: profileError } = await supabase.from('users').insert({
      id: userId,
      username: username.toLowerCase(),
      email,
      avatar_color: randomAvatarColor(),
    });

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    // Handle invite token
    const invite = params.get('invite');
    if (invite) {
      navigate(`/invite/${invite}`);
    } else {
      navigate('/tracker');
    }
  };

  return (
    <div>
      {step === 'credentials' ? (
        <form onSubmit={handleCredentials} className="space-y-4">
          {error && (
            <div className="bg-red/10 border border-red/30 text-red text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-sm text-text-muted">Email</label>
            <input
              id="register-email"
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
              id="register-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-base"
              placeholder="min. 6 characters"
              autoComplete="new-password"
            />
          </div>
          <Button type="submit" loading={loading} className="w-full mt-2">
            Continue
          </Button>
          <p className="text-center text-sm text-text-muted">
            Already have an account?{' '}
            <Link
              to={`/login${params.get('invite') ? `?invite=${params.get('invite')}` : ''}`}
              className="text-accent-green hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      ) : (
        <form onSubmit={handleUsername} className="space-y-4">
          <p className="text-sm text-text-muted text-center">Choose a username others will see.</p>
          {error && (
            <div className="bg-red/10 border border-red/30 text-red text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-sm text-text-muted">Username</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm font-mono">@</span>
              <input
                id="register-username"
                type="text"
                required
                minLength={2}
                maxLength={20}
                pattern="[a-zA-Z0-9_]+"
                value={username}
                onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                className="input-base pl-7"
                placeholder="yarik"
                autoComplete="username"
                autoFocus
              />
            </div>
            <p className="text-xs text-text-muted">Letters, numbers, underscores only.</p>
          </div>
          <Button type="submit" loading={loading} className="w-full mt-2">
            Create Account
          </Button>
        </form>
      )}
    </div>
  );
};
