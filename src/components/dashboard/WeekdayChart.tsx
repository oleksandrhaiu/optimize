import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { WEEKDAY_LABELS } from '@/hooks/useDashboardStats';
import { Card } from '@/components/ui/Card';

interface Props {
  weekdayAvg: number[];
}

export const WeekdayChart: React.FC<Props> = ({ weekdayAvg }) => {
  const chartData = WEEKDAY_LABELS.map((label, i) => ({
    name: label,
    avg: weekdayAvg[i],
  }));

  return (
    <Card className="h-64 flex flex-col">
      <h3 className="text-text-primary font-medium text-sm mb-4">Avg by Day of Week</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2C3A" vertical={false} />
            <XAxis dataKey="name" stroke="#8B8FA8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#8B8FA8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ backgroundColor: '#161820', borderColor: '#2A2C3A', borderRadius: '8px' }}
              itemStyle={{ color: '#4B9EFF' }}
              labelStyle={{ color: '#E2E4F0', marginBottom: '4px' }}
              cursor={{ fill: '#2A2C3A', opacity: 0.4 }}
            />
            <Bar dataKey="avg" fill="#4B9EFF" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
