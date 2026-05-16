import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { acceptInvite } from '@/hooks/useFriends';
import { PageLoader } from '@/components/ui/LoadingSpinner';

export const InviteAccept: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { session, initialized } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [alreadyFriends, setAlreadyFriends] = useState(false);
  const acceptedRef = useRef(false);

  useEffect(() => {
    if (!initialized) return;
    if (!session) {
      navigate(`/register?invite=${token}`);
      return;
    }
    if (!token) { navigate('/tracker'); return; }
    if (acceptedRef.current) return;
    acceptedRef.current = true;

    acceptInvite(token, session.user.id).then(({ error, alreadyFriends: already }) => {
      if (error) {
        setMessage(error);
        setStatus('error');
      } else {
        setAlreadyFriends(Boolean(already));
        setStatus('success');
        setTimeout(() => navigate('/tracker'), 2000);
      }
    });
  }, [initialized, session, token, navigate]);

  if (status === 'loading') return <PageLoader />;

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl p-8 max-w-sm w-full text-center space-y-4 animate-slide-up">
        {status === 'success' ? (
          <>
            <div className="w-16 h-16 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center mx-auto">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M5 16L12 23L27 7" stroke="#00C896" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="font-heading font-bold text-xl text-text-primary">
              {alreadyFriends ? 'Already friends!' : 'Friend added!'}
            </h2>
            <p className="text-text-muted text-sm">
              {alreadyFriends
                ? 'You are already connected. Redirecting…'
                : 'Redirecting to your tracker…'}
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-red/15 border border-red/30 flex items-center justify-center mx-auto">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M8 8L24 24M24 8L8 24" stroke="#FF5F5F" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="font-heading font-bold text-xl text-text-primary">Invite Error</h2>
            <p className="text-text-muted text-sm">{message}</p>
            <button onClick={() => navigate('/tracker')} className="btn-secondary text-sm">
              Go to Tracker
            </button>
          </>
        )}
      </div>
    </div>
  );
};
