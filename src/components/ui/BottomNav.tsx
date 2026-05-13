import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { clx } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

export const BottomNav: React.FC = () => {
  const { session } = useAuthStore();
  const location = useLocation();

  if (!session) return null;

  const NAV_ITEMS = [
    {
      to: '/dashboard',
      label: 'Home',
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? '0' : '2'} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      )
    },
    {
      to: '/tracker',
      label: 'Tracker',
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? '0' : '2'} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
      )
    },
    {
      to: '/habits',
      label: 'Habits',
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? '0' : '2'} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="9" y1="9" x2="15" y2="9"></line>
          <line x1="9" y1="15" x2="15" y2="15"></line>
        </svg>
      )
    },
    {
      to: '/friends',
      label: 'Social',
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? '0' : '2'} strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      )
    }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg/90 backdrop-blur-xl border-t border-border/40 pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={clx(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 min-w-[64px]",
                isActive ? "text-accent" : "text-text-muted hover:text-text-primary"
              )}
            >
              <div className={clx("transition-transform duration-300", isActive && "scale-110")}>
                {item.icon(isActive)}
              </div>
              <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};
