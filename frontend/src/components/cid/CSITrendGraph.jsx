import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useDarkMode } from '../../contexts/DarkModeContext';

const MODE_COLORS = {
  Peak: '#10b981',
  Stable: '#3b82f6',
  Fatigue: '#f59e0b',
  Burnout: '#ef4444',
};

export function CSITrendGraph({ data }) {
  const { isDarkMode } = useDarkMode();

  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }

    return data.map((item) => ({
      date: new Date(item.index_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      csi: item.csi_score,
      mode: item.status_label,
      fullDate: item.index_date,
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
        <p style={{ color: isDarkMode ? '#9ca3af' : '#475569' }}>
          No CSI trend data available yet. Complete your morning check-in to see trends.
        </p>
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
        📈 CSI Trend (Last 7 Days)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDarkMode ? '#1f2937' : '#e2e8f0'}
          />
          <XAxis
            dataKey="date"
            stroke={isDarkMode ? '#9ca3af' : '#64748b'}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            domain={[0, 100]}
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
            formatter={(value, name) => {
              if (name === 'csi') return [value, 'CSI Score'];
              return value;
            }}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend wrapperStyle={{ color: isDarkMode ? '#f1f5f9' : '#0f172a' }} />
          <Line
            type="monotone"
            dataKey="csi"
            stroke="#8b5cf6"
            dot={{
              fill: '#8b5cf6',
              r: 4,
            }}
            activeDot={{
              r: 6,
            }}
            strokeWidth={2}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
