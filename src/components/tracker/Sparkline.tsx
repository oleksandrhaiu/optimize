import React from 'react';

interface SparklineProps {
  values: number[]; // 0–100, oldest to newest (7 values)
  width?: number;
  height?: number;
}

export const Sparkline: React.FC<SparklineProps> = ({ values, width = 80, height = 28 }) => {
  if (values.length < 2) return null;

  const max = Math.max(...values, 1);
  const padX = 2;
  const padY = 2;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const points = values.map((v, i) => {
    const x = padX + (i / (values.length - 1)) * innerW;
    const y = padY + innerH - (v / max) * innerH;
    return `${x},${y}`;
  });

  const polyline = points.join(' ');

  // Fill area
  const firstX = padX;
  const lastX = padX + innerW;
  const bottomY = padY + innerH;
  const areaPoints = `${firstX},${bottomY} ${polyline} ${lastX},${bottomY}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      <defs>
        <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00C896" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#00C896" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#spark-grad)" />
      <polyline
        points={polyline}
        stroke="#00C896"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Today dot */}
      <circle
        cx={padX + innerW}
        cy={padY + innerH - (values[values.length - 1] / max) * innerH}
        r="2.5"
        fill="#00C896"
      />
    </svg>
  );
};
