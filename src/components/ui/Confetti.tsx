import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiProps {
  trigger: boolean; // when this flips to true → fire
}

export const Confetti: React.FC<ConfettiProps> = ({ trigger }) => {
  const firedRef = useRef(false);

  useEffect(() => {
    if (trigger && !firedRef.current) {
      firedRef.current = true;
      fireConfetti();
    }
    if (!trigger) {
      firedRef.current = false;
    }
  }, [trigger]);

  return null; // purely imperative
};

import React from 'react';

function fireConfetti() {
  const count = 200;
  const defaults = { origin: { y: 0.7 } };

  const fire = (particleRatio: number, opts: confetti.Options) => {
    confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });
  };

  fire(0.25, { spread: 26, startVelocity: 55, colors: ['#00C896', '#00E5A8'] });
  fire(0.2,  { spread: 60, colors: ['#FFD700', '#FFA500'] });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ['#00C896', '#FFD700', '#FF6B6B'] });
  fire(0.1,  { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1,  { spread: 120, startVelocity: 45 });
}
