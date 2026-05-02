import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from './Avatar';
import { clx } from '@/lib/utils';

const NAV_ITEMS = [
  {
    to: '/tracker',
    label: 'Tracker',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 12L5.5 7.5L8.5 10L12 5L14 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="1" y="13" width="14" height="1.5" rx="0.75" fill="currentColor" />
      </svg>
    ),
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 1.5v1M8 13.5v1M1.5 8h1M13.5 8h1M3.05 3.05l.71.71M12.24 12.24l.71.71M12.24 3.76l-.71.71M3.76 12.24l-.71.71" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export const Navbar: React.FC = () => {
  const { profile, signOut } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-30 glass border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
        {/* Logo */}
        <NavLink to="/tracker" className="flex items-center gap-2 mr-2 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-accent-green/20 border border-accent-green/40 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7L5.5 10.5L12 3" stroke="#00C896" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-heading font-bold text-sm text-text-primary hidden sm:block">HabitSync</span>
        </NavLink>

        {/* Desktop Nav */}
        <div className="hidden sm:flex items-center gap-1 flex-1">
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

        {/* User menu */}
        {profile && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              aria-label="User menu"
            >
              <Avatar username={profile.username} color={profile.avatar_color} size="sm" />
              <span className="text-sm text-text-muted hidden sm:block">@{profile.username}</span>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-10 w-44 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-slide-up">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-medium text-text-primary">@{profile.username}</p>
                  <p className="text-xs text-text-muted truncate">{profile.email}</p>
                </div>
                <button
                  onClick={() => { setMenuOpen(false); signOut(); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-red hover:bg-red/10 transition-colors"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mobile nav trigger */}
        <div className="flex sm:hidden items-center gap-2">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clx(
                  'p-2 rounded-lg transition-colors',
                  isActive ? 'text-accent-green bg-accent-green/10' : 'text-text-muted',
                )
              }
            >
              {item.icon}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};
