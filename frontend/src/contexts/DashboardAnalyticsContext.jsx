import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const DashboardAnalyticsContext = createContext({
  csiTrend: [],
  subjectFatigue: {},
  missedTrends: [],
  burnoutRisk: null,
  isLoading: true,
  error: null,
  refreshAnalytics: () => {},
});

export function DashboardAnalyticsProvider({ children, userId }) {
  const [csiTrend, setCsiTrend] = useState([]);
  const [subjectFatigue, setSubjectFatigue] = useState({});
  const [missedTrends, setMissedTrends] = useState([]);
  const [burnoutRisk, setBurnoutRisk] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Fetch last 7 days CSI trend from cognitive_index
      const today = new Date();
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const formattedDate = sevenDaysAgo.toISOString().split('T')[0];

      const { data: csiData, error: csiError } = await supabase
        .from('cognitive_index')
        .select('index_date, csi_score, status_label')
        .eq('user_id', userId)
        .gte('index_date', formattedDate)
        .order('index_date', { ascending: true });

      if (csiError) throw csiError;

      setCsiTrend(csiData || []);

      // 2. Fetch dashboard analytics (pre-calculated by n8n, stored in Supabase)
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('dashboard_analytics')
        .select('*')
        .eq('user_id', userId)
        .single();

      console.log('[ANALYTICS] Raw analytics data:', analyticsData);
      console.log('[ANALYTICS] Analytics error:', analyticsError);

      if (!analyticsError && analyticsData) {
        console.log('[ANALYTICS] subject_fatigue:', analyticsData.subject_fatigue, typeof analyticsData.subject_fatigue);
        console.log('[ANALYTICS] missed_trends:', analyticsData.missed_trends, typeof analyticsData.missed_trends, Array.isArray(analyticsData.missed_trends));
        console.log('[ANALYTICS] burnout_risk:', analyticsData.burnout_risk);
        
        setSubjectFatigue(analyticsData.subject_fatigue || {});
        setMissedTrends(analyticsData.missed_trends || []);
        setBurnoutRisk(analyticsData.burnout_risk || 'LOW');
      }
    } catch (err) {
      console.error('[ANALYTICS] Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [userId]);

  const value = useMemo(
    () => ({
      csiTrend,
      subjectFatigue,
      missedTrends,
      burnoutRisk,
      isLoading,
      error,
      refreshAnalytics: fetchAnalytics,
    }),
    [csiTrend, subjectFatigue, missedTrends, burnoutRisk, isLoading, error]
  );

  return (
    <DashboardAnalyticsContext.Provider value={value}>
      {children}
    </DashboardAnalyticsContext.Provider>
  );
}

export function useDashboardAnalytics() {
  return useContext(DashboardAnalyticsContext);
}
