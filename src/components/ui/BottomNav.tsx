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
    <div className="md:hidden fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-4 right-4 z-50">
      <div 
        className="glass rounded-[28px] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] px-2 py-2 relative" 
        ref={navRef}
        style={{
          background: 'rgba(12, 13, 22, 0.8)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Sliding pill */}
        <div
          className="absolute top-2 bottom-2 rounded-[20px] transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1.2)] z-0"
          style={{
            left: pillStyle.left,
            width: pillStyle.width,
            opacity: pillStyle.opacity,
            background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(139,92,246,0.1))',
            border: '1px solid rgba(139,92,246,0.3)',
            boxShadow: 'inset 0 0 12px rgba(139,92,246,0.1)',
          }}
        />
        <div className="flex items-center justify-around relative z-10">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => clx(
                "flex flex-col items-center gap-1 py-2.5 px-3 rounded-[18px] transition-all duration-300 min-w-[64px]",
                isActive ? "text-violet active" : "text-text-muted"
              )}
            >
              {({ isActive }) => (
                <>
                  <div className={clx(
                    "transition-all duration-500 transform",
                    isActive ? "scale-110 -translate-y-0.5" : "scale-100"
                  )}>
                    <Icon 
                      size={20} 
                      strokeWidth={isActive ? 2.5 : 2} 
                      className={clx(
                        "transition-colors duration-300",
                        isActive ? "drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" : ""
                      )}
                    />
                  </div>
                  <span className={clx(
                    "text-[10px] font-bold tracking-tight transition-all duration-300",
                    isActive ? "opacity-100 scale-105" : "opacity-70 scale-100"
                  )}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};
