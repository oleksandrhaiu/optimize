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

  const handleOAuth = async (provider: 'google' | 'github') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/setup-profile`,
      },
    });
    if (error) setError(error.message);
  };

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

          <div className="relative py-4 flex items-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink-0 mx-4 text-text-muted text-xs uppercase tracking-wider">Or continue with</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => handleOAuth('google')} 
            className="w-full text-sm flex gap-2 items-center justify-center"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
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
