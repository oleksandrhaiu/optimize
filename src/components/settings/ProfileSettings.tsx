import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { AVATAR_COLORS } from '@/lib/utils';

const AVATAR_EMOJIS = [
  '🦊', '🐺', '🦁', '🐯', '🦄', '🐸', '🐼', '🦅',
  '🌊', '🔥', '⚡', '🌙', '🌿', '💎', '🎯', '🚀',
];const THEMES = [
  { id: 'dark', name: 'Dark Mode', color: '#161820' },
  { id: 'light', name: 'Light Mode', color: '#FFFFFF' },
];


export const ProfileSettings: React.FC = () => {
  const { profile, setProfile } = useAuthStore();
  const [username, setUsername] = useState(profile?.username ?? '');
  const [selectedColor, setSelectedColor] = useState(profile?.avatar_color ?? AVATAR_COLORS[0]);
  const [selectedTheme, setSelectedTheme] = useState(profile?.theme === 'light' ? 'light' : 'dark');
  const [soundEnabled, setSoundEnabled] = useState(profile?.sound_enabled ?? true);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!profile) return null;

  const hasChanges =
    username !== profile.username ||
    selectedColor !== profile.avatar_color ||
    selectedTheme !== profile.theme ||
    soundEnabled !== profile.sound_enabled;

  const handleSave = async () => {
    if (!username.trim()) return;
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    const { data, error: err } = await supabase
      .from('users')
      .update({ 
        username: username.trim(), 
        avatar_color: selectedColor,
        theme: selectedTheme,
        sound_enabled: soundEnabled
      })
      .eq('id', profile.id)
      .select()
      .single();

    setSaving(false);

    if (err) {
      if (err.message.includes('duplicate') || err.message.includes('unique')) {
        setError('That username is already taken. Try another one.');
      } else {
        setError(err.message);
      }
    } else if (data) {
      setProfile(data as typeof profile);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    }
  };

  // Preview avatar — use emoji as initials if selected
  const previewInitials = selectedEmoji ?? profile.username.slice(0, 2).toUpperCase();

  return (
    <div className="space-y-8">
      {/* Avatar preview */}
      <div className="flex items-center gap-5">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center font-mono font-bold text-lg flex-shrink-0 select-none"
          style={{
            backgroundColor: `${selectedColor}22`,
            border: `2px solid ${selectedColor}55`,
            color: selectedColor,
          }}
        >
          {selectedEmoji ?? profile.username.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="font-heading font-semibold text-text-primary">@{username || profile.username}</p>
          <p className="text-text-muted text-xs mt-0.5">{profile.email}</p>
        </div>
      </div>

      {/* Username */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-primary">Username</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">@</span>
          <input
            type="text"
            value={username}
            onChange={e => { setUsername(e.target.value); setError(null); }}
            className="input-base pl-7"
            placeholder="your_username"
            maxLength={30}
          />
        </div>
        <p className="text-xs text-text-subtle">Letters, numbers, underscores only.</p>
      </div>

      {/* Avatar color */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-text-primary">Avatar color</label>
        <div className="flex flex-wrap gap-2">
          {AVATAR_COLORS.map(color => (
            <button
              key={color}
              type="button"
              onClick={() => setSelectedColor(color)}
              className="w-8 h-8 rounded-xl transition-all duration-150 flex items-center justify-center"
              style={{
                backgroundColor: `${color}30`,
                border: `2px solid ${selectedColor === color ? color : `${color}40`}`,
                transform: selectedColor === color ? 'scale(1.15)' : 'scale(1)',
              }}
            >
              {selectedColor === color && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Avatar emoji */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-text-primary">
          Avatar icon
          <span className="text-text-subtle font-normal ml-2 text-xs">(optional)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedEmoji(null)}
            className={`w-9 h-9 rounded-xl text-xs font-mono font-bold transition-all duration-150 flex items-center justify-center ${
              selectedEmoji === null
                ? 'bg-white/[0.08] border border-border ring-1 ring-accent/40'
                : 'bg-bg border border-border/60 text-text-muted hover:border-border'
            }`}
            style={{ color: selectedColor }}
          >
            {profile.username.slice(0, 2).toUpperCase()}
          </button>
          {AVATAR_EMOJIS.map(emoji => (
            <button
              key={emoji}
              type="button"
              onClick={() => setSelectedEmoji(emoji === selectedEmoji ? null : emoji)}
              className={`w-9 h-9 rounded-xl text-lg transition-all duration-150 ${
                selectedEmoji === emoji
                  ? 'bg-white/[0.08] border border-border ring-1 ring-accent/40 scale-110'
                  : 'bg-bg border border-border/60 hover:border-border hover:scale-105'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
        <p className="text-xs text-text-subtle">
          Emoji icons are display-only and won't be saved to the server yet.
        </p>
      </div>

      <div className="h-px w-full bg-border/50" />
 
      {/* App Theme */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-text-primary">App theme</label>
        <div className="flex flex-wrap gap-3">
          {THEMES.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setSelectedTheme(t.id);
                document.documentElement.setAttribute('data-theme', t.id); // Preview instantly
                document.documentElement.style.colorScheme = t.id;
                const meta = document.querySelector('meta[name="theme-color"]');
                meta?.setAttribute('content', t.id === 'light' ? '#F9FAFB' : '#0E0F14');
              }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 border flex items-center gap-2 ${
                selectedTheme === t.id
                  ? 'bg-white/[0.08] border-border ring-1 ring-accent/40 text-text-primary'
                  : 'bg-bg border-border/60 text-text-muted hover:border-border'
              }`}
            >
              <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: t.color }} />
              {t.name}
            </button>
          ))}
        </div>
      </div>



      {/* Sound Settings */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-text-primary flex items-center gap-2">
          Sound Effects
        </label>
        <button
          type="button"
          onClick={() => setSoundEnabled(v => !v)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all w-full sm:w-auto ${
            soundEnabled
              ? 'bg-accent/10 border-accent/30 text-text-primary'
              : 'bg-bg border-border text-text-muted'
          }`}
        >
          <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${
            soundEnabled ? 'border-accent bg-accent/20' : 'border-border'
          }`}>
            {soundEnabled && (
              <svg className="text-accent" width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span className="text-sm font-medium">{soundEnabled ? 'Sounds On' : 'Sounds Off'}</span>
        </button>
      </div>

      {/* Error / success */}
      {error && (
        <div className="text-sm text-red bg-red/10 border border-red/20 rounded-xl px-4 py-2.5 animate-fade-in">
          {error}
        </div>
      )}
      {success && (
        <div className="text-sm text-accent bg-accent/10 border border-accent/20 rounded-xl px-4 py-2.5 animate-fade-in">
          ✓ Profile updated!
        </div>
      )}

      {/* Save */}
      <Button
        onClick={handleSave}
        loading={saving}
        disabled={!hasChanges || !username.trim()}
      >
        Save changes
      </Button>
    </div>
  );
};
