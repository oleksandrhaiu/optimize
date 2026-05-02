import React from 'react';
import { getInitials, clx } from '@/lib/utils';

interface AvatarProps {
  username: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
};

export const Avatar: React.FC<AvatarProps> = ({ username, color, size = 'md', className }) => {
  return (
    <div
      className={clx(
        'rounded-full flex items-center justify-center font-mono font-semibold flex-shrink-0 select-none',
        sizeMap[size],
        className,
      )}
      style={{ backgroundColor: `${color}22`, border: `2px solid ${color}55`, color }}
    >
      {getInitials(username)}
    </div>
  );
};
