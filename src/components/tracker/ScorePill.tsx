import React from 'react';
import { clx } from '@/lib/utils';

interface ScorePillProps {
  score: number;
  className?: string;
}

export const ScorePill: React.FC<ScorePillProps> = ({ score, className }) => {
  const tier = score >= 80 ? 'high' : score >= 50 ? 'mid' : 'low';
  return (
    <span className={clx('score-pill', tier, className)}>
      {score}%
    </span>
  );
};
