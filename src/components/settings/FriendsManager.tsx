import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { generateToken } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import type { FriendWithData } from '@/types';

interface Props {
  friends: FriendWithData[];
  onRemove: (id: string) => void;
}

export const FriendsManager: React.FC<Props> = ({ friends, onRemove }) => {
  const { session } = useAuthStore();
  const [inviteLink, setInviteLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!session?.user) return;
    setLoading(true);
    const token = generateToken();
    const { error } = await supabase.from('invite_tokens').insert({
      creator_user_id: session.user.id,
      token,
    });
    setLoading(false);
    if (!error) {
      const link = `${window.location.origin}/invite/${token}`;
      setInviteLink(link);
      setCopied(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-bg border border-border p-4 rounded-xl space-y-4">
        <h3 className="text-sm font-medium text-text-primary">Add a Friend</h3>
        <p className="text-xs text-text-muted">
          Generate a one-time invite link and share it. When they sign up or log in, you'll instantly be friends.
        </p>
        {!inviteLink ? (
          <Button onClick={handleGenerate} loading={loading} variant="secondary" size="sm">
            Generate Link
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={inviteLink}
              className="input-base text-xs font-mono py-2 bg-card"
            />
            <Button onClick={handleCopy} variant={copied ? 'primary' : 'secondary'} size="sm">
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium text-text-primary mb-3">Your Friends ({friends.length})</h3>
        {friends.length === 0 ? (
          <p className="text-sm text-text-muted italic">No friends yet.</p>
        ) : (
          <div className="space-y-2">
            {friends.map((f) => (
              <div key={f.profile.id} className="flex items-center justify-between p-3 bg-card border border-border rounded-xl">
                <div className="flex items-center gap-3">
                  <Avatar username={f.profile.username} color={f.profile.avatar_color} size="sm" />
                  <span className="text-sm font-medium text-text-primary">@{f.profile.username}</span>
                </div>
                <button
                  onClick={() => onRemove(f.profile.id)}
                  className="text-xs text-red hover:bg-red/10 px-2 py-1 rounded transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
