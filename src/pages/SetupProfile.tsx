import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';

export const SetupProfile: React.FC = () => {
  const { session, profile, fetchProfile } = useAuthStore();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If they already have a profile, send them to tracker
  useEffect(() => {
    if (profile) {
      navigate('/tracker', { replace: true });
    }
  }, [profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { error: insertError } = await supabase.from('users').insert({
        id: session.user.id,
        email: session.user.email || '',
        username,
        avatar_color: '#4B9EFF'
      });

      if (insertError) {
        if (insertError.code === '23505') {
          throw new Error('This username is already taken. Please choose another.');
        }
        throw insertError;
      }

      await fetchProfile(session.user.id);
      navigate('/tracker', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to setup profile');
    } finally {
      setLoading(false);
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border p-8 rounded-2xl">
        <h2 className="text-2xl font-heading font-bold text-text-primary mb-2">Almost there!</h2>
        <p className="text-sm text-text-muted mb-6">
          You successfully logged in. Now, pick a unique username so your friends can find you.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-mono">
                @
              </span>
              <input
                type="text"
                required
                pattern="^[a-zA-Z0-9_]{3,20}$"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="yourname"
                className="input-base w-full pl-8"
              />
            </div>
            <p className="text-xs text-text-muted mt-1.5">
              Letters, numbers, underscores only.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red/10 border border-red/20 rounded-lg text-sm text-red">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" loading={loading}>
            Complete Setup
          </Button>
        </form>
      </div>
    </div>
  );
};
