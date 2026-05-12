import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  BarChart2,
  Settings,
  Search,
  ChevronDown,
  LogOut,
  ListChecks,
  Users,
  Download,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from './Avatar';
import { clx } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import type { UserProfile, Habit, HabitLog } from '@/types';
import { exportHabitsCsv } from '@/lib/exportCsv';

const NAV_ITEMS = [
  { to: '/tracker',   label: 'Tracker',   icon: LayoutGrid },
  { to: '/dashboard', label: 'Dashboard', icon: BarChart2 },
  { to: '/habits',    label: 'Habits',    icon: ListChecks },
  { to: '/friends',   label: 'Friends',   icon: Users },
];

/** Quick user search dropdown */
const NavSearch: React.FC = () => {
  const navigate = useNavigate();
  const { session } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false); setQuery(''); setResults([]);
      }
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const q = query.trim().replace(/^@/, '');
    const timer = setTimeout(async () => {
      setSearching(true);
      const { data } = await supabase
        .from('users').select('*')
        .ilike('username', `%${q}%`)
        .neq('id', session?.user.id ?? '')
        .limit(6);
      setResults((data as UserProfile[]) ?? []);
      setSearching(false);
    }, 280);
    return () => clearTimeout(timer);
  }, [query, session?.user.id]);

  const goTo = (username: string) => {
    navigate(`/u/${username}`); setOpen(false); setQuery(''); setResults([]);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className={clx(
          'p-2 rounded-xl transition-all duration-200',
          open
            ? 'text-violet bg-violet/10'
            : 'text-text-muted hover:text-text-primary hover:bg-violet/[0.07]',
        )}
        title="Find users"
      >
        <Search size={16} strokeWidth={1.8} />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] w-72 dropdown-card rounded-2xl z-50 overflow-hidden animate-slide-up">
          <div className="flex items-center gap-2 px-3 py-3 border-b border-white/[0.05]">
            <Search size={13} className="text-text-subtle flex-shrink-0" strokeWidth={1.8} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by username…"
              className="flex-1 bg-transparent border-none focus:outline-none text-sm text-text-primary placeholder-text-subtle"
            />
            {searching && (
              <svg width="13" height="13" viewBox="0 0 24 24" className="animate-spin flex-shrink-0 text-text-subtle" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" opacity="0.2" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            )}
          </div>
          {results.length > 0 ? (
            <div className="py-1.5 space-y-0.5 px-1.5">
              {results.map(u => (
                <button
                  key={u.id}
                  onClick={() => goTo(u.username)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-violet/[0.08] transition-colors text-left group"
                >
                  <Avatar username={u.username} color={u.avatar_color} size="sm" />
                  <span className="text-sm font-medium text-text-primary group-hover:text-violet transition-colors">
                    @{u.username}
                  </span>
                </button>
              ))}
            </div>
          ) : query.trim() && !searching ? (
            <p className="px-4 py-5 text-xs text-text-muted text-center">No users found</p>
          ) : (
            <p className="px-4 py-5 text-xs text-text-subtle text-center">Type a username to search</p>
          )}
        </div>
      )}
    </div>
  );
};

export const Navbar: React.FC = () => {
  const { profile, session, signOut } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!session?.user.id) return;
    setMenuOpen(false);
    setExporting(true);
    const { data: habits } = await supabase.from('habits').select('*').eq('user_id', session.user.id);
    const { data: logs } = await supabase.from('habit_logs').select('*').eq('user_id', session.user.id);
    if (habits && logs) {
      exportHabitsCsv(habits as Habit[], logs as HabitLog[]);
    }
    setExporting(false);
  };

  useEffect(() => {
    if (!navRef.current) return;
    const t = setTimeout(() => {
      const activeEl = navRef.current?.querySelector('.active') as HTMLElement;
      if (activeEl) {
        setPillStyle({
          left: activeEl.offsetLeft,
          width: activeEl.offsetWidth,
          opacity: 1
        });
      } else {
        setPillStyle(prev => ({ ...prev, opacity: 0 }));
      }
    }, 10);
    return () => clearTimeout(t);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <nav
      className="sticky top-0 z-30 glass border-b border-white/[0.05] pt-[env(safe-area-inset-top)]"
      style={{ boxShadow: '0 1px 0 rgba(139,92,246,0.08)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-2">

        {/* Logo */}
        <NavLink to="/tracker" className="flex items-center gap-2.5 mr-3 flex-shrink-0 group">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:rotate-6 group-hover:shadow-glow-accent"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(124,58,237,0.05))',
              border: '1px solid rgba(139,92,246,0.35)',
              boxShadow: '0 0 14px rgba(139,92,246,0.18)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="url(#logo-circle)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 4L12 14.01l-3-3" stroke="url(#logo-check)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="logo-circle" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#8B5CF6" />
                  <stop offset="1" stopColor="#34D399" />
                </linearGradient>
                <linearGradient id="logo-check" x1="9" y1="4" x2="22" y2="14" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#A78BFA" />
                  <stop offset="1" stopColor="#F472B6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="font-heading font-bold text-sm text-text-primary hidden sm:block tracking-tight">
            HabitSync
          </span>
        </NavLink>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-1 flex-1 relative" ref={navRef}>
          {/* Sliding pill */}
          <div
            className="absolute top-1 bottom-1 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-0"
            style={{
              left: pillStyle.left,
              width: pillStyle.width,
              opacity: pillStyle.opacity,
              background: 'linear-gradient(to bottom, rgba(139,92,246,0.15), rgba(139,92,246,0.05))',
              border: '1px solid rgba(139,92,246,0.2)',
              boxShadow: '0 0 10px rgba(139,92,246,0.1)',
            }}
          />
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => clx('nav-link relative z-10', isActive && 'active')}
              style={{ background: 'transparent', border: 'transparent' }} // Let the pill provide the bg
            >
              <Icon size={15} strokeWidth={1.8} />
              {label}
            </NavLink>
          ))}
        </div>

        {/* Spacer mobile */}
        <div className="flex-1 sm:hidden" />

        {/* Mobile nav icons */}
        <div className="flex sm:hidden items-center gap-0.5">
          {NAV_ITEMS.map(({ to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clx(
                  'p-2.5 rounded-xl transition-all duration-200',
                  isActive
                    ? 'text-violet bg-violet/10'
                    : 'text-text-muted hover:text-text-primary hover:bg-violet/[0.07]',
                )
              }
            >
              <Icon size={17} strokeWidth={1.8} />
            </NavLink>
          ))}
        </div>

        <NavSearch />

        {/* User menu */}
        {profile && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(v => !v)}
              className={clx(
                'flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl transition-all duration-200',
                menuOpen
                  ? 'bg-violet/[0.1] ring-1 ring-violet/20'
                  : 'hover:bg-violet/[0.07]',
              )}
              aria-label="User menu"
            >
              <Avatar username={profile.username} color={profile.avatar_color} size="sm" />
              <span className="text-sm text-text-muted hidden sm:block">@{profile.username}</span>
              <ChevronDown
                size={12}
                className={clx('text-text-subtle transition-transform duration-200 hidden sm:block', menuOpen && 'rotate-180')}
                strokeWidth={2}
              />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-56 dropdown-card rounded-2xl z-50 overflow-hidden animate-slide-up">
                <div className="px-4 py-3.5 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2.5">
                    <Avatar username={profile.username} color={profile.avatar_color} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text-primary">@{profile.username}</p>
                      <p className="text-xs text-text-muted truncate">{profile.email}</p>
                    </div>
                  </div>
                </div>
                <div className="p-1.5 space-y-0.5">
                  <NavLink
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-sm rounded-xl transition-all duration-150 text-text-muted hover:text-text-primary hover:bg-white/[0.05]"
                  >
                    <Settings size={14} strokeWidth={1.8} />
                    Profile Settings
                  </NavLink>
                  <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-sm rounded-xl transition-all duration-150 text-text-muted hover:text-text-primary hover:bg-white/[0.05]"
                  >
                    {exporting ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" className="animate-spin" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" opacity="0.25"/>
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <Download size={14} strokeWidth={1.8} />
                    )}
                    Export Data
                  </button>
                  <div className="h-px bg-white/[0.05] my-1" />
                  <button
                    onClick={() => { setMenuOpen(false); signOut(); }}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-sm rounded-xl transition-all duration-150 text-red/90 hover:text-red hover:bg-red/[0.08]"
                  >
                    <LogOut size={14} strokeWidth={1.8} />
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
