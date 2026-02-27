import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useDarkMode } from '../../contexts/DarkModeContext';

export function MissedTaskTrends({ data }) {
  const { isDarkMode } = useDarkMode();

  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }

    return data.map((item) => ({
      week: item.week,
      missed: item.missed,
    }));
  }, [data]);

  if (!chartData || chartData.length === 0) {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{
          backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
          border: isDarkMode ? undefined : '1px solid #e2e8f0',
        }}
      >
        {/* Removed 'No missed task data available yet.' message as requested */}
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-6 shadow-sm"
      style={{
        backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
        border: isDarkMode ? undefined : '1px solid #e2e8f0',
      }}
    >
      <h3
        className="text-lg font-semibold mb-4"
        style={{ color: isDarkMode ? '#f1f5f9' : '#0f172a' }}
      >
        ⏭️ Missed Task Trends
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDarkMode ? '#1f2937' : '#e2e8f0'}
          />
          <XAxis
            dataKey="week"
            stroke={isDarkMode ? '#9ca3af' : '#64748b'}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            stroke={isDarkMode ? '#9ca3af' : '#64748b'}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
              border: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
              borderRadius: '8px',
              color: isDarkMode ? '#f1f5f9' : '#0f172a',
            }}
            formatter={(value) => [value, 'Missed Tasks']}
          />
          <Legend wrapperStyle={{ color: isDarkMode ? '#f1f5f9' : '#0f172a' }} />
          <Bar
            dataKey="missed"
            fill="#ef4444"
            radius={8}
            name="Missed Tasks"
            isAnimationActive={true}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
