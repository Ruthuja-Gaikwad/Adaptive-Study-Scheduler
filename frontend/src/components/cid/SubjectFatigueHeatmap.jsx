import { useEffect, useMemo, useState } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { supabase } from '../../lib/supabaseClient';

export function SubjectFatigueHeatmap({ data, userId }) {
  const { isDarkMode } = useDarkMode();
  const [isLoading, setIsLoading] = useState(false);
  const [fatigueData, setFatigueData] = useState(data || {});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setFatigueData(data || {});
      return;
    }

    let isMounted = true;

    const fetchSubjectFatigue = async () => {
      setIsLoading(true);
      setError(null);

      const { data: fatigueRows, error: fatigueError } = await supabase
        .from('subject_fatigue')
        .select('subject_name, fatigue_score')
        .eq('user_id', userId)
        .order('fatigue_score', { ascending: false });

      if (!isMounted) return;

      if (fatigueError) {
        setError(fatigueError.message || 'Failed to load subject fatigue.');
        setIsLoading(false);
        return;
      }

      const mapped = (fatigueRows || []).reduce((acc, row) => {
        if (row?.subject_name) {
          acc[row.subject_name] = Number(row.fatigue_score || 0);
        }
        return acc;
      }, {});

      setFatigueData(mapped);
      setIsLoading(false);
    };

    fetchSubjectFatigue();

    return () => {
      isMounted = false;
    };
  }, [userId, data]);

  const getFatigueColor = (value) => {
    // 0 = green (low fatigue), 1 = red (high fatigue)
    if (value <= 0.2) return { bg: '#dcfce7', border: '#10b981', text: '#166534' };
    if (value <= 0.4) return { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' };
    if (value <= 0.6) return { bg: '#fed7aa', border: '#fb923c', text: '#9a3412' };
    if (value <= 0.8) return { bg: '#fecaca', border: '#f87171', text: '#991b1b' };
    return { bg: '#fca5a5', border: '#ef4444', text: '#7f1d1d' };
  };

  const sortedData = useMemo(() => {
    if (!fatigueData || typeof fatigueData !== 'object' || Array.isArray(fatigueData) || Object.keys(fatigueData).length === 0) {
      return [];
    }

    return Object.entries(fatigueData)
      .map(([subject, fatigue]) => {
        const raw = Number(fatigue);
        const normalized = raw > 1 ? raw / 100 : raw;
        return {
          subject,
          fatigue: Math.max(0, Math.min(1, normalized)),
        };
      })
      .sort((a, b) => b.fatigue - a.fatigue);
  }, [fatigueData]);

  if (isLoading) {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{
          backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
          border: isDarkMode ? undefined : '1px solid #e2e8f0',
        }}
      >
        <p style={{ color: isDarkMode ? '#9ca3af' : '#475569' }}>
          Loading subject fatigue...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{
          backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
          border: isDarkMode ? undefined : '1px solid #e2e8f0',
        }}
      >
        <p style={{ color: isDarkMode ? '#fca5a5' : '#b91c1c' }}>
          {error}
        </p>
      </div>
    );
  }

  if (!sortedData || sortedData.length === 0) {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{
          backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
          border: isDarkMode ? undefined : '1px solid #e2e8f0',
        }}
      >
        <p style={{ color: isDarkMode ? '#9ca3af' : '#475569' }}>
          No subject fatigue data available yet.
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
        🔥 Subject Fatigue Analysis
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sortedData.map(({ subject, fatigue }) => {
          const colors = getFatigueColor(fatigue);
          return (
            <div
              key={subject}
              className="p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md"
              style={{
                backgroundColor: colors.bg,
                borderColor: colors.border,
                color: colors.text,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">{subject}</span>
                <span className="text-xs font-bold opacity-75">
                  {(fatigue * 100).toFixed(0)}%
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-300 rounded-full h-2">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${fatigue * 100}%`,
                    backgroundColor: colors.border,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
