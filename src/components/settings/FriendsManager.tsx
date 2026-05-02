import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { generateToken } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from '@/components/ui/Avatar';
import { clx } from '@/lib/utils';
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
  const [removingId, setRemovingId] = useState<string | null>(null);

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

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    await onRemove(id);
    setRemovingId(null);
  };

  return (
    <div className="space-y-6">

      {/* ── Invite card ─────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-accent-green/20 bg-gradient-to-br from-accent-green/10 to-transparent p-5 space-y-4">
        {/* decorative glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-accent-green/10 blur-3xl pointer-events-none" />

        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent-green/15 border border-accent-green/25 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M13 10a3 3 0 1 0-6 0 3 3 0 0 0 6 0ZM10 2v2M10 16v2M2 10h2M16 10h2" stroke="#00C896" strokeWidth="1.6" strokeLinecap="round"/>
              <path d="M10 13a3 3 0 0 0 0-6" stroke="#00C896" strokeWidth="1.6" strokeLinecap="round" opacity="0.5"/>
            </svg>
          </div>
          <div>
            <h3 className="font-heading font-semibold text-text-primary text-sm">Invite a Friend</h3>
            <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
              Generate a personal invite link. When your friend opens it and signs up — you'll both be automatically connected.
            </p>
          </div>
        </div>

        {inviteLink ? (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 bg-bg/70 border border-border/60 rounded-xl px-3 py-2">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 text-text-subtle">
                <path d="M5.5 8.5L8.5 5.5M6 3l-.793.793a2.5 2.5 0 0 0 3.536 3.535L9.5 6.5M7.5 11l-.793.793a2.5 2.5 0 0 1-3.535-3.535L4 7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                readOnly
                value={inviteLink}
                className="flex-1 bg-transparent border-none focus:outline-none text-xs font-mono text-text-muted min-w-0 cursor-text"
                onClick={e => (e.target as HTMLInputElement).select()}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className={clx(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                  copied
                    ? 'bg-accent-green text-bg'
                    : 'bg-accent-green/15 text-accent-green hover:bg-accent-green/25 border border-accent-green/25'
                )}
              >
                {copied ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M2 10V2h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Copy Link
                  </>
                )}
              </button>
              <button
                onClick={handleGenerate}
                title="Generate new link"
                className="px-3 py-2.5 rounded-xl bg-white/[0.04] border border-border/60 text-text-muted hover:text-text-primary hover:border-border transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M11.5 7A4.5 4.5 0 1 1 7 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M7 2.5l2-2M7 2.5l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent-green text-bg text-sm font-semibold hover:bg-accent-green/90 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {loading ? (
              <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" opacity="0.25"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
            {loading ? 'Generating…' : 'Generate Invite Link'}
          </button>
        )}
      </div>

      {/* ── Friends list ─────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-text-primary">
            Your Friends
            <span className="ml-2 text-text-subtle font-mono text-xs font-normal">({friends.length})</span>
          </h3>
        </div>

        {friends.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-border/30 flex items-center justify-center text-2xl mb-1">👥</div>
            <p className="text-sm font-medium text-text-primary">No friends yet</p>
            <p className="text-xs text-text-muted">Share your invite link above to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {friends.map((f) => (
              <div
                key={f.profile.id}
                className="group flex items-center justify-between p-3 bg-bg border border-border/60 rounded-xl hover:border-border transition-all"
              >
                <div className="flex items-center gap-3">
                  <Avatar username={f.profile.username} color={f.profile.avatar_color} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">@{f.profile.username}</p>
                    <p className="text-xs text-text-muted">{f.todayScore}% today</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(f.profile.id)}
                  disabled={removingId === f.profile.id}
                  className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-xs text-text-subtle hover:text-red px-2 py-1 rounded-lg hover:bg-red/10 transition-all"
                >
                  {removingId === f.profile.id ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" className="animate-spin" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" opacity="0.25"/>
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                      <path d="M2 3.5H12M4.5 3.5V2C4.5 1.448 4.948 1 5.5 1H8.5C9.052 1 9.5 1.448 9.5 2V3.5M5.5 6.5V10.5M8.5 6.5V10.5M3 3.5L3.5 11.5C3.5 12.052 3.948 12.5 4.5 12.5H9.5C10.052 12.5 10.5 12.052 10.5 11.5L11 3.5"
                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  )}
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
