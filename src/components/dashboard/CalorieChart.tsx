import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import type { DailyStats } from '@/types';
import { Card } from '@/components/ui/Card';
import { getCalorieZone } from '@/lib/utils';

interface Props {
  data: DailyStats[];
  calMin: number | null;
  calMax: number | null;
}

const colorMap = {
  green: '#00C896',
  amber: '#F5A623',
  red: '#FF5F5F',
  none: '#4B9EFF',
};

export const CalorieChart: React.FC<Props> = ({ data, calMin, calMax }) => {
  const chartData = useMemo(() => {
    return data
      .filter(d => d.calories !== null)
      .map(d => {
        const date = new Date(d.date);
        let label = d.date.split('-')[2];
        if (data.length > 31) {
          label = date.toLocaleDateString('default', { month: 'short', day: 'numeric' });
        }
        return {
          name: label,
          cal: d.calories,
          zone: getCalorieZone(d.calories!, calMin, calMax),
        };
      });
  }, [data, calMin, calMax]);

  if (chartData.length === 0) return null;

  return (
    <Card className="h-64 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-text-primary font-medium text-sm">Calories Logged</h3>
        {calMin && calMax && (
          <span className="text-xs text-text-muted font-mono">
            Target: {calMin} – {calMax}
          </span>
        )}
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2C3A" vertical={false} />
            <XAxis dataKey="name" stroke="#8B8FA8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#8B8FA8" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#161820', borderColor: '#2A2C3A', borderRadius: '8px' }}
              itemStyle={{ color: '#E2E4F0' }}
              labelStyle={{ color: '#8B8FA8', marginBottom: '4px' }}
              cursor={{ fill: '#2A2C3A', opacity: 0.4 }}
            />
            <Bar dataKey="cal" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colorMap[entry.zone]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
