import React, { useEffect, useState, useRef } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  suffix?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, duration = 600, suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0); // Start from 0 on mount for initial animation
  const prevValue = useRef(0);

  useEffect(() => {
    const start = prevValue.current;
    const end = value;
    if (start === end) return;
    
    const startTime = performance.now();
    
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * ease);
      
      setDisplayValue(current);
      
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        prevValue.current = value;
      }
    };
    
    requestAnimationFrame(tick);
  }, [value, duration]);

  return <>{displayValue}{suffix}</>;
};
