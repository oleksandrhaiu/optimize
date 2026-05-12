import React from 'react';
import {
  Flame, Zap, Target, Rocket, Trophy, Gem, Moon, Waves,
  Dumbbell, Brain, Salad, BookOpen, Droplets, Activity, Bed,
  Footprints, Pill, Smile, Scale, Heart, Coffee, Sun,
  CheckCircle, CircleDashed, CheckSquare, ListChecks,
  AlertCircle, AlertTriangle, Info, Plus, Minus, X, Check
} from 'lucide-react';
import { clx } from '@/lib/utils';

export const ICONS = {
  Flame, Zap, Target, Rocket, Trophy, Gem, Moon, Waves,
  Dumbbell, Brain, Salad, BookOpen, Droplets, Activity, Bed,
  Footprints, Pill, Smile, Scale, Heart, Coffee, Sun,
  CheckCircle, CircleDashed, CheckSquare, ListChecks,
  AlertCircle, AlertTriangle, Info, Plus, Minus, X, Check
};

export type IconName = keyof typeof ICONS;

export const ICON_NAMES = Object.keys(ICONS) as IconName[];

interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, 'name'> {
  name: string | null | undefined;
  size?: number | string;
  className?: string;
  fallback?: React.ReactNode;
}

export const DynamicIcon: React.FC<IconProps> = ({ name, size = 20, className, fallback, ...props }) => {
  if (!name || !(name in ICONS)) {
    return <>{fallback}</>;
  }
  const IconComponent = ICONS[name as IconName];
  return <IconComponent size={size} className={className} {...props} />;
};

interface IconPickerProps {
  current: string | null;
  onSelect: (iconName: string) => void;
  onClose: () => void;
}

export const IconPicker: React.FC<IconPickerProps> = ({ current, onSelect, onClose }) => {
  // A curated list of good icons for habits
  const habitIcons: IconName[] = [
    'Flame', 'Zap', 'Target', 'Rocket', 'Trophy', 'Gem', 'Moon', 'Waves',
    'Dumbbell', 'Brain', 'Salad', 'BookOpen', 'Droplets', 'Activity', 'Bed',
    'Footprints', 'Pill', 'Smile', 'Scale', 'Heart', 'Coffee', 'Sun'
  ];

  return (
    <div className="absolute top-[calc(100%+8px)] left-0 z-50 p-3 dropdown-card rounded-2xl w-64 shadow-xl animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Select Icon</span>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors text-text-subtle hover:text-text-primary">
          <X size={14} strokeWidth={2.5} />
        </button>
      </div>
      <div className="grid grid-cols-6 gap-1">
        {habitIcons.map((name) => {
          const Icon = ICONS[name];
          const isSelected = current === name;
          return (
            <button
              key={name}
              onClick={() => { onSelect(name); onClose(); }}
              className={clx(
                'aspect-square flex items-center justify-center rounded-xl transition-all duration-200',
                isSelected
                  ? 'bg-violet/20 text-violet shadow-[0_0_10px_rgba(139,92,246,0.2)] border border-violet/30'
                  : 'text-text-muted hover:bg-white/5 hover:text-text-primary hover:scale-110'
              )}
            >
              <Icon size={18} strokeWidth={2} />
            </button>
          );
        })}
      </div>
    </div>
  );
};
