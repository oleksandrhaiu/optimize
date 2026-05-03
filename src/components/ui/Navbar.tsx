import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from './Avatar';
import { clx } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import type { UserProfile } from '@/types';

const NAV_ITEMS = [
  {
    to: '/tracker',
    label: 'Tracker',
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
        <path d="M2 12L5.5 7.5L8.5 10L12 5L14 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="1" y="13" width="14" height="1.5" rx="0.75" fill="currentColor" />
      </svg>
    ),
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: (
      <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
        <path fillRule="evenodd" clipRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" fill="currentColor" />
      </svg>
    ),
  },
];

/** Quick user search dropdown in the Navbar */
const NavSearch: React.FC = () => {
  const navigate = useNavigate();
  const { session } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
        setResults([]);
      }
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const q = query.trim().replace(/^@/, '');
    const timer = setTimeout(async () => {
      setSearching(true);
      const { data } = await supabase
        .from('users')
        .select('*')
        .ilike('username', `%${q}%`)
        .neq('id', session?.user.id ?? '')
        .limit(5);
      setResults((data as UserProfile[]) ?? []);
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const goToProfile = (username: string) => {
    navigate(`/u/${username}`);
    setOpen(false);
    setQuery('');
    setResults([]);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className={clx(
          'p-2 rounded-lg transition-all duration-150',
          open ? 'text-text-primary bg-card-hover' : 'text-text-muted hover:text-text-primary hover:bg-card-hover',
        )}
        title="Find users"
      >
        <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
          <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.7"/>
          <path d="M15 15l3.5 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-72 bg-card border border-border rounded-2xl shadow-card z-50 overflow-hidden animate-slide-up">
          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/50">
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none" className="text-text-subtle flex-shrink-0">
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.7"/>
              <path d="M15 15l3.5 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by username…"
              className="flex-1 bg-transparent border-none focus:outline-none text-base sm:text-sm text-text-primary placeholder-text-subtle"
            />
            {searching && (
              <svg width="13" height="13" viewBox="0 0 24 24" className="animate-spin flex-shrink-0 text-text-subtle" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" opacity="0.25"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            )}
          </div>

          {/* Results */}
          {results.length > 0 ? (
            <div className="py-1">
              {results.map(u => (
                <button
                  key={u.id}
                  onClick={() => goToProfile(u.username)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-card-hover transition-colors text-left"
                >
                  <Avatar username={u.username} color={u.avatar_color} size="sm" />
                  <span className="text-sm font-medium text-text-primary">@{u.username}</span>
                </button>
              ))}
            </div>
          ) : query.trim() && !searching ? (
            <p className="px-4 py-4 text-xs text-text-muted text-center">No users found</p>
          ) : !query.trim() ? (
            <p className="px-4 py-4 text-xs text-text-subtle text-center">Type a username to search</p>
          ) : null}
        </div>
      )}
    </div>
  );
};

export const Navbar: React.FC = () => {
  const { profile, signOut } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <nav className="sticky top-0 z-30 glass border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">

        {/* Logo */}
        <NavLink to="/tracker" className="flex items-center gap-2.5 mr-3 flex-shrink-0 group">
          <div className="w-7 h-7 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center group-hover:bg-accent/20 transition-colors duration-150">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M2 7L5.5 10.5L12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-heading font-bold text-sm text-text-primary hidden sm:block tracking-tight">
            HabitSync
          </span>
        </NavLink>

        {/* Desktop Nav */}
        <div className="hidden sm:flex items-center gap-0.5 flex-1">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clx('nav-link', isActive && 'active')
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Spacer on mobile */}
        <div className="flex-1 sm:hidden" />

        {/* Mobile nav */}
        <div className="flex sm:hidden items-center gap-1">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clx(
                  'p-2.5 rounded-lg transition-colors duration-150',
                  isActive ? 'text-accent bg-accent/10' : 'text-text-muted hover:text-text-primary hover:bg-card-hover',
                )
              }
            >
              {item.icon}
            </NavLink>
          ))}
        </div>

        {/* Search */}
        <NavSearch />

        {/* User menu */}
        {profile && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(v => !v)}
              className={clx(
                'flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl transition-all duration-150',
                menuOpen ? 'bg-card-hover' : 'hover:bg-card-hover',
              )}
              aria-label="User menu"
            >
              <Avatar username={profile.username} color={profile.avatar_color} size="sm" />
              <span className="text-sm text-text-muted hidden sm:block">@{profile.username}</span>
              <svg
                className={clx('text-text-subtle transition-transform duration-150 hidden sm:block', menuOpen && 'rotate-180')}
                width="12" height="12" viewBox="0 0 12 12" fill="none"
              >
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-[calc(100%+6px)] w-52 bg-card border border-border rounded-xl shadow-card z-50 overflow-hidden animate-slide-up">
                <div className="px-4 py-3 border-b border-border/60">
                  <p className="text-sm font-medium text-text-primary">@{profile.username}</p>
                  <p className="text-xs text-text-muted truncate mt-0.5">{profile.email}</p>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => { setMenuOpen(false); signOut(); }}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red hover:bg-red/8 rounded-lg transition-colors duration-100"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M5 12H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h2M9.5 9.5L12 7m0 0L9.5 4.5M12 7H5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
