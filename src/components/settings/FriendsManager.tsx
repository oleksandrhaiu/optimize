import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { generateToken } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from '@/components/ui/Avatar';
import { clx } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import type { FriendWithData, UserProfile } from '@/types';

interface Props {
  friends: FriendWithData[];
  onRemove: (id: string) => void;
  onRefetch: () => void;
}

export const FriendsManager: React.FC<Props> = ({ friends, onRemove, onRefetch }) => {
  const { session } = useAuthStore();
  const navigate = useNavigate();

  const [inviteLink, setInviteLink] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<UserProfile | null | 'not-found' | 'self'>(null);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  const [removingId, setRemovingId] = useState<string | null>(null);

  // ── Invite ──────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!session?.user) return;
    setGenerating(true);
    const token = generateToken();
    const { error } = await supabase.from('invite_tokens').insert({
      creator_user_id: session.user.id,
      token,
    });
    setGenerating(false);
    if (!error) {
      setInviteLink(`${window.location.origin}/invite/${token}`);
      setCopied(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // ── Search ──────────────────────────────────────────────────
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim().toLowerCase().replace(/^@/, '');
    if (!q) return;
    setSearching(true);
    setSearchResult(null);
    setAddSuccess(false);

    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('username', q)
      .maybeSingle();

    setSearching(false);
    if (!data) { setSearchResult('not-found'); return; }
    if (data.id === session?.user.id) { setSearchResult('self'); return; }
    setSearchResult(data as UserProfile);
  };

  const handleAddFriend = async (targetUser: UserProfile) => {
    if (!session?.user) return;
    setAdding(true);

    // Check if already friends
    const { data: existing } = await supabase
      .from('friendships')
      .select('id')
      .or(`and(user_a_id.eq.${session.user.id},user_b_id.eq.${targetUser.id}),and(user_a_id.eq.${targetUser.id},user_b_id.eq.${session.user.id})`)
      .maybeSingle();

    if (!existing) {
      await supabase.from('friendships').insert({
        user_a_id: session.user.id,
        user_b_id: targetUser.id,
        status: 'accepted',
      });
    }

    setAdding(false);
    setAddSuccess(true);
    setSearchQuery('');
    setSearchResult(null);
    onRefetch();
  };

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    await onRemove(id);
    setRemovingId(null);
  };

  const isFriend = (uid: string) => friends.some(f => f.profile.id === uid);

  return (
    <div className="space-y-6">

      {/* ── Invite card ────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-accent-green/20 bg-gradient-to-br from-accent-green/10 to-transparent p-5 space-y-4">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-accent-green/10 blur-3xl pointer-events-none" />

        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent-green/15 border border-accent-green/25 flex items-center justify-center flex-shrink-0 mt-0.5 text-base leading-none">
            🔗
          </div>
          <div>
            <h3 className="font-heading font-semibold text-text-primary text-sm">Invite Link</h3>
            <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
              Share this link — anyone who opens it and signs up gets added as your friend automatically.
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
                {copied ? '✓ Copied!' : '📋 Copy Link'}
              </button>
              {/* Refresh — new link */}
              <button
                onClick={handleGenerate}
                disabled={generating}
                title="Generate new link"
                className="px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-border/60 text-text-muted hover:text-text-primary hover:border-border transition-all disabled:opacity-50 flex items-center justify-center"
              >
                <svg
                  width="14" height="14" viewBox="0 0 20 20" fill="none"
                  className={generating ? 'animate-spin' : ''}
                >
                  <path d="M4 10a6 6 0 0 1 6-6 6 6 0 0 1 4.243 1.757L16 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M16 4v3.5H12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 10a6 6 0 0 1-6 6 6 6 0 0 1-4.243-1.757L4 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M4 16v-3.5H7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent-green text-bg text-sm font-semibold hover:bg-accent-green/90 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {generating ? (
              <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" opacity="0.25"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            ) : '🔗'}
            {generating ? 'Generating…' : 'Generate Invite Link'}
          </button>
        )}
      </div>

      {/* ── Search by username ──────────────────────────────── */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-text-primary">Find by Username</h3>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm font-mono pointer-events-none">@</span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setSearchResult(null); setAddSuccess(false); }}
              placeholder="username"
              className="input-base pl-7 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={!searchQuery.trim() || searching}
            className="px-4 py-2.5 rounded-xl bg-white/[0.06] border border-border/60 text-sm text-text-muted hover:text-text-primary hover:border-border transition-all disabled:opacity-40 flex items-center gap-1.5"
          >
            {searching ? (
              <svg width="14" height="14" viewBox="0 0 24 24" className="animate-spin" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" opacity="0.25"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M15 15l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            )}
            Find
          </button>
        </form>

        {/* Search result */}
        {searchResult === 'not-found' && (
          <p className="text-xs text-text-muted px-1">No user found with that username.</p>
        )}
        {searchResult === 'self' && (
          <p className="text-xs text-text-muted px-1">That's you! 😄</p>
        )}
        {addSuccess && (
          <p className="text-xs text-accent-green px-1">✓ Friend added successfully!</p>
        )}
        {searchResult && searchResult !== 'not-found' && searchResult !== 'self' && (
          <div className="flex items-center justify-between p-3 bg-bg border border-border/70 rounded-xl">
            <div className="flex items-center gap-3">
              <Avatar username={searchResult.username} color={searchResult.avatar_color} size="sm" />
              <div>
                <button
                  onClick={() => navigate(`/u/${searchResult.username}`)}
                  className="text-sm font-medium text-text-primary hover:text-accent-green transition-colors text-left"
                >
                  @{searchResult.username}
                </button>
                <p className="text-xs text-text-muted">Tap name to view profile</p>
              </div>
            </div>
            {isFriend(searchResult.id) ? (
              <span className="text-xs text-accent-green font-medium px-2 py-1 rounded-lg bg-accent-green/10">
                Friends ✓
              </span>
            ) : (
              <button
                onClick={() => handleAddFriend(searchResult as UserProfile)}
                disabled={adding}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-green text-bg text-xs font-semibold hover:bg-accent-green/90 transition-all disabled:opacity-60"
              >
                {adding ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" className="animate-spin" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" opacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                ) : '+'}
                {adding ? 'Adding…' : 'Add Friend'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Friends list ─────────────────────────────────────── */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-text-primary">
          Your Friends
          <span className="ml-2 text-text-subtle font-mono text-xs font-normal">({friends.length})</span>
        </h3>

        {friends.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-border/30 flex items-center justify-center text-2xl mb-1">👥</div>
            <p className="text-sm font-medium text-text-primary">No friends yet</p>
            <p className="text-xs text-text-muted">Use the invite link or search by username above</p>
          </div>
        ) : (
          <div className="space-y-2">
            {friends.map((f) => (
              <div
                key={f.profile.id}
                className="group flex items-center justify-between p-3 bg-bg border border-border/60 rounded-xl hover:border-border transition-all"
              >
                <button
                  onClick={() => navigate(`/u/${f.profile.username}`)}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left"
                >
                  <Avatar username={f.profile.username} color={f.profile.avatar_color} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary hover:text-accent-green transition-colors truncate">
                      @{f.profile.username}
                    </p>
                    <p className="text-xs text-text-muted">{f.todayScore}% today</p>
                  </div>
                </button>
                <button
                  onClick={() => handleRemove(f.profile.id)}
                  disabled={removingId === f.profile.id}
                  className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-xs text-text-subtle hover:text-red px-2 py-1 rounded-lg hover:bg-red/10 transition-all ml-2 flex-shrink-0"
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
