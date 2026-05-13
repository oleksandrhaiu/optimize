import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { clx } from '@/lib/utils';

interface HoldToCompleteProps {
  onComplete: () => void;
  isDone: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const HoldToComplete: React.FC<HoldToCompleteProps> = ({
  onComplete, isDone, children, className, disabled
}) => {
  const [isPressing, setIsPressing] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controls = useAnimation();

  // Clean up
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled || isDone) {
      // If already done, a normal click can toggle it off, but we can just fire onComplete immediately to toggle.
      if (!disabled && isDone) {
        onComplete();
      }
      return;
    }
    
    // Only primary button
    if (e.button !== 0) return;

    setIsPressing(true);
    controls.start({
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5, ease: 'linear' }
    });

    if (navigator.vibrate) navigator.vibrate(10); // initial tap

    timeoutRef.current = setTimeout(() => {
      setIsPressing(false);
      controls.stop();
      if (navigator.vibrate) navigator.vibrate([30, 50, 30]); // success haptic
      onComplete();
    }, 500);
  };

  const handlePointerUp = () => {
    if (disabled || isDone) return;
    setIsPressing(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    controls.stop();
    controls.start({ scale: 0, opacity: 0, transition: { duration: 0.2 } });
  };

  return (
    <motion.button
      type="button"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerUp}
      whileTap={!disabled && !isDone ? { scale: 0.96 } : undefined}
      className={clx(
        "relative overflow-hidden group touch-none select-none",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {/* Fill Background */}
      {!isDone && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={controls}
          className="absolute inset-0 bg-accent/20 rounded-xl pointer-events-none origin-center"
        />
      )}
      
      {/* Success State Background */}
      {isDone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-emerald-500/10 rounded-xl pointer-events-none"
        />
      )}

      {/* Content */}
      <div className="relative z-10 flex items-center w-full h-full">
        {children}
      </div>
    </motion.button>
  );
};
