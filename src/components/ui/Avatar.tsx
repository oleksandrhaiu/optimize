import React from 'react';
import { getInitials, clx } from '@/lib/utils';

interface AvatarProps {
  username: string;
  color: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  online?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
};

const dotMap = {
  sm: 'w-2.5 h-2.5 -bottom-0.5 -right-0.5 border-[2px]',
  md: 'w-3 h-3 -bottom-0.5 -right-0.5 border-[2px]',
  lg: 'w-4 h-4 bottom-0 right-0 border-[2.5px]',
  xl: 'w-5 h-5 bottom-0.5 right-0.5 border-[3px]',
};

export const Avatar: React.FC<AvatarProps> = ({
  username,
  color,
  size = 'md',
  online,
  className,
}) => {
  return (
    <div className={clx('relative flex-shrink-0', className)}>
      <div
        className={clx(
          'rounded-2xl flex items-center justify-center font-heading font-bold select-none',
          sizeMap[size],
        )}
        style={{
          background: `linear-gradient(135deg, ${color}22, ${color}15)`,
          border: `1.5px solid ${color}35`,
          color,
        }}
      >
        {getInitials(username)}
      </div>

      {online !== undefined && (
        <span
          className={clx(
            'absolute rounded-full border-bg transition-all duration-500',
            dotMap[size],
            online
              ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
              : 'bg-[#3E4268]',
          )}
        />
      )}

      {/* Pulse ring when online */}
      {online && (
        <span
          className={clx(
            'absolute rounded-full animate-pulse-ring',
            dotMap[size],
          )}
          style={{ background: 'rgba(52,211,153,0.4)' }}
        />
      )}
    </div>
  );
};
