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
import { Logo } from '@/components/ui/Logo';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from './Avatar';
import { clx } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import type { UserProfile, Habit, HabitLog } from '@/types';
import { exportHabitsCsv } from '@/lib/exportCsv';
import { UpdatesHistoryModal } from '@/components/ui/WhatsNewModal';
import { hasUnseenUpdate, markAsSeen } from '@/lib/changelog';
import { useTranslation } from 'react-i18next';
import i18n from '@/lib/i18n';

const LANGUAGES = [
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'ru', label: 'RU', flag: '🇷🇺' },
  { code: 'uk', label: 'UA', flag: '🇺🇦' },
];

const NAV_ITEMS_KEYS = [
  { to: '/tracker',   labelKey: 'nav.tracker',   icon: LayoutGrid },
  { to: '/dashboard', labelKey: 'nav.dashboard', icon: BarChart2 },
  { to: '/habits',    labelKey: 'nav.habits',    icon: ListChecks },
  { to: '/friends',   labelKey: 'nav.friends',   icon: Users },
];

/** Quick user search dropdown */
const NavSearch: React.FC = () => {
  const navigate = useNavigate();
  const { session } = useAuthStore();
  const { t } = useTranslation();
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
              placeholder={t('nav.searchPlaceholder')}
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
            <p className="px-4 py-5 text-xs text-text-muted text-center">{t('nav.noUsersFound')}</p>
          ) : (
            <p className="px-4 py-5 text-xs text-text-subtle text-center">{t('nav.typeToSearch')}</p>
          )}
        </div>
      )}
    </div>
  );
};

export const Navbar: React.FC = () => {
  const { profile, session, signOut } = useAuthStore();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [updatesOpen, setUpdatesOpen] = useState(false);
  const [hasUnseen, setHasUnseen] = useState(() => hasUnseenUpdate());
  const [currentLang, setCurrentLang] = useState(i18n.language?.slice(0, 2) || 'en');
  const menuRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const [exporting, setExporting] = useState(false);

  const handleOpenUpdates = () => {
    setMenuOpen(false);
    setUpdatesOpen(true);
    markAsSeen();
    setHasUnseen(false);
  };

  const switchLang = (code: string) => {
    i18n.changeLanguage(code);
    setCurrentLang(code);
  };

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
          <Logo size={28} className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
          <span className="font-heading font-bold text-lg tracking-wide text-text-primary hidden sm:block">
            Lumina
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
          {NAV_ITEMS_KEYS.map(({ to, labelKey, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => clx('nav-link relative z-10', isActive && 'active')}
              style={{ background: 'transparent', border: 'transparent' }}
            >
              <Icon size={15} strokeWidth={1.8} />
              {t(labelKey)}
            </NavLink>
          ))}
        </div>

        {/* Spacer mobile */}
        <div className="flex-1 sm:hidden" />

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
                    {t('nav.profileSettings')}
                  </NavLink>
                  <button
                    onClick={handleOpenUpdates}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-sm rounded-xl transition-all duration-150 text-text-muted hover:text-text-primary hover:bg-white/[0.05]"
                  >
                    <span className="relative">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      {hasUnseen && (
                        <span
                          className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                          style={{ background: '#8B5CF6', boxShadow: '0 0 6px rgba(139,92,246,0.8)' }}
                        />
                      )}
                    </span>
                    What's New
                    {hasUnseen && (
                      <span
                        className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: 'rgba(139,92,246,0.2)', color: '#A78BFA' }}
                      >
                        {t('updates.new')}
                      </span>
                    )}
                  </button>

                  {/* Language switcher */}
                  <div className="px-3 py-2">
                    <p className="text-[10px] text-text-subtle uppercase tracking-wider mb-2 font-semibold">{t('common.language')}</p>
                    <div className="flex gap-1.5">
                      {LANGUAGES.map(lang => (
                        <button
                          key={lang.code}
                          onClick={() => switchLang(lang.code)}
                          className={clx(
                            'flex-1 py-1.5 rounded-lg text-xs font-bold transition-all duration-150',
                            currentLang === lang.code
                              ? 'text-violet'
                              : 'text-text-subtle hover:text-text-primary hover:bg-white/[0.04]',
                          )}
                          style={currentLang === lang.code ? {
                            background: 'rgba(139,92,246,0.15)',
                            border: '1px solid rgba(139,92,246,0.3)',
                          } : {
                            background: 'rgba(28,30,52,0.4)',
                            border: '1px solid rgba(28,30,52,0.6)',
                          }}
                        >
                          {lang.flag} {lang.label}
                        </button>
                      ))}
                    </div>
                  </div>
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
                    {t('nav.exportData')}
                  </button>
                  <div className="h-px bg-white/[0.05] my-1" />
                  <button
                    onClick={() => { setMenuOpen(false); signOut(); }}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-sm rounded-xl transition-all duration-150 text-red/90 hover:text-red hover:bg-red/[0.08]"
                  >
                    <LogOut size={14} strokeWidth={1.8} />
                    {t('nav.signOut')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Updates history modal */}
      {updatesOpen && <UpdatesHistoryModal onClose={() => setUpdatesOpen(false)} />}
    </nav>
  );
};
