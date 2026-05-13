import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutGrid, BarChart2, ListChecks, Users } from 'lucide-react';
import { clx } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Home',    icon: BarChart2 },
  { to: '/tracker',   label: 'Tracker', icon: LayoutGrid },
  { to: '/habits',    label: 'Habits',  icon: ListChecks },
  { to: '/friends',   label: 'Social',  icon: Users }
];

export const BottomNav: React.FC = () => {
  const { session } = useAuthStore();
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });

  useEffect(() => {
    if (!navRef.current) return;
    // Small timeout to ensure DOM paints and NavLinks have the "active" class applied by React Router
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

  if (!session) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg/90 backdrop-blur-xl border-t border-border/40 pb-safe">
      <div className="flex items-center justify-around px-2 py-2 relative" ref={navRef}>
        {/* Sliding pill */}
        <div
          className="absolute top-1 bottom-1 rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-0"
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
            className={({ isActive }) => clx(
              "flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all duration-300 relative z-10",
              isActive ? "text-violet active" : "text-text-muted hover:text-text-primary"
            )}
            style={{ background: 'transparent' }} // Let pill handle bg
          >
            {({ isActive }) => (
              <>
                <div className={clx("transition-transform duration-300", isActive && "scale-110")}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                <span className="text-[10px] font-semibold tracking-wide">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};
