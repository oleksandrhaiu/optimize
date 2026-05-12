import React, { useEffect, useState, useRef } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  suffix?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, duration = 1500, suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0); // Start from 0 on mount for initial animation
  const prevValue = useRef(0);

  useEffect(() => {
    const start = prevValue.current;
    const end = value;
    if (start === end) {
      setDisplayValue(value);
      return;
    }
    
    const startTime = performance.now();
    
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Extremely smooth exponential out easing
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      let current = start + (end - start) * ease;
      
      // Step by 10s if we're far from the end, then smoothly step by 1s
      if (Math.abs(end - current) > 10 && progress < 0.8) {
        current = Math.round(current / 10) * 10;
      } else {
        current = Math.round(current);
      }
      
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
