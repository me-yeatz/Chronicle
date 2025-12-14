import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PlanEvent, Category } from '../types';

interface StatsChartProps {
  events: PlanEvent[];
  variant?: 'light' | 'dark';
  title?: string;
  className?: string;
}

const COLORS = {
  [Category.WORK]: '#32292F',
  [Category.STUDY]: '#8A9A5B',
  [Category.TRAVEL]: '#FFAB91', // Peach
  [Category.PERSONAL]: '#BC4B51',
  [Category.HEALTH]: '#818CF8'
};

// For dark variant, adjust colors slightly for visibility
const DARK_COLORS = {
  ...COLORS,
  [Category.WORK]: '#F3EFE0', // Bone for work in dark mode
};

const StatsChart: React.FC<StatsChartProps> = ({ events, variant = 'light', title = 'Category Distribution', className = '' }) => {
  const data = React.useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach(e => {
      counts[e.category] = (counts[e.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [events]);

  const activeColors = variant === 'dark' ? DARK_COLORS : COLORS;

  return (
    <div className={className}>
      {title && <h3 className={`font-bold mb-2 ${variant === 'dark' ? 'text-bone' : 'text-charcoal'}`}>{title}</h3>}
      <div className="h-64 w-full flex flex-col items-center justify-center">
         {data.length > 0 ? (
           <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={variant === 'dark' ? 50 : 60}
                outerRadius={variant === 'dark' ? 70 : 80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={activeColors[entry.name as Category] || '#ccc'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                  backgroundColor: '#fff',
                  color: '#32292F',
                  padding: '12px 16px',
                  fontWeight: 'bold'
                }}
                itemStyle={{ color: '#32292F' }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                formatter={(value) => <span style={{ color: variant === 'dark' ? '#F3EFE0' : '#32292F', fontWeight: 600, margin: '0 10px 0 5px' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
         ) : (
           <p className={`text-sm font-medium ${variant === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Add events to see stats</p>
         )}
      </div>
    </div>
  );
};

export default StatsChart;