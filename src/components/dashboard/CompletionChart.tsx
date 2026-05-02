import React, { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { DailyStats } from '@/types';
import { Card } from '@/components/ui/Card';

interface Props {
  data: DailyStats[];
}

export const CompletionChart: React.FC<Props> = ({ data }) => {
  const chartData = useMemo(() => {
    return data.map(d => {
      const date = new Date(d.date);
      let label = d.date.split('-')[2]; // day
      if (data.length > 31) {
        label = date.toLocaleDateString('default', { month: 'short', day: 'numeric' });
      }
      return {
        name: label,
        pct: d.completionPct,
      };
    });
  }, [data]);

  return (
    <Card className="h-64 flex flex-col">
      <h3 className="text-text-primary font-medium text-sm mb-4">Daily Completion %</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2C3A" vertical={false} />
            <XAxis dataKey="name" stroke="#8B8FA8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#8B8FA8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ backgroundColor: '#161820', borderColor: '#2A2C3A', borderRadius: '8px' }}
              itemStyle={{ color: '#00C896' }}
              labelStyle={{ color: '#E2E4F0', marginBottom: '4px' }}
            />
            <Line
              type="monotone"
              dataKey="pct"
              stroke="#00C896"
              strokeWidth={3}
              dot={{ r: 3, fill: '#0E0F14', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#00C896' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
