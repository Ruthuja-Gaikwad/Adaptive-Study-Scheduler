import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { supabase } from '../../lib/supabaseClient';
import { useCognitiveCheckin } from '../../contexts/CognitiveCheckinContext';
import { useSessionBootstrap } from '../../contexts/SessionBootstrapContext';
import TopBar from './TopBar';
import CSICore from './CSICore';
import BurnoutRadar from './BurnoutRadar';
import MemoryHeatmap from './MemoryHeatmap';
import PerformanceCard from './PerformanceCard';
import FocusCard from './FocusCard';
import InterventionPanel from './InterventionPanel';
import CognitiveTimeline from './CognitiveTimeline';
import CognitiveForecast from './CognitiveForecast';
import { CSITrendGraph } from './CSITrendGraph';
import { SubjectFatigueHeatmap } from './SubjectFatigueHeatmap';
import { MissedTaskTrends } from './MissedTaskTrends';
import { BurnoutRiskIndicator } from './BurnoutRiskIndicator';

const CognitiveIntelligenceDashboard = () => {
  const { isDarkMode } = useDarkMode();
  const { csi, burnoutScore } = useCognitiveCheckin();
  const { sessionUser } = useSessionBootstrap();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      if (!sessionUser?.id) return;
      const { data, error } = await supabase
        .from('dashboard_master')
        .select('*')
        .eq('user_id', sessionUser.id)
        .single();
      setDashboard(data);
      setLoading(false);
    }
    loadDashboard();

    // Real-time updates
    const channel = supabase
      .channel('dashboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cognitive_index',
          filter: `user_id=eq.${sessionUser?.id}`
        },
        () => loadDashboard()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionUser]);

  const bgGradient = isDarkMode
    ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
    : 'bg-gradient-to-br from-white via-slate-50 to-slate-100';

  // CSI color logic
  const getCsiColor = (score) => {
    if (score >= 75) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  // Status label logic
  const getStatusLabel = (csi) => {
    if (csi > 75) return "Stable & Optimal";
    if (csi > 50) return "Moderate";
    return "Burnout Risk";
  };

  // Performance trend logic
  const trend = dashboard ? parseFloat(dashboard.performance_trend) : 0;
  const trendIcon = trend > 0 ? "▲" : "▼";
  const trendColor = trend > 0 ? "text-green-500" : "text-red-500";

  // Null-safe effectiveBurnout definition
  const effectiveBurnout = dashboard?.burnout_score ?? 0;

  // Subject heatmap rendering
  const subjectHeatmap = dashboard?.subject_fatigue
    ? Object.entries(dashboard.subject_fatigue).map(([subject, score]) => (
        <div key={subject} className="flex justify-between">
          <span>{subject}</span>
          <span>{score}</span>
        </div>
      ))
    : null;

  return (

    <div className={`${bgGradient} min-h-screen transition-colors duration-300`}>
      {/* Top Bar */}
      <TopBar
        userLevel={dashboard?.userLevel ?? 0}
        userXP={dashboard?.userXP ?? 0}
        maxXP={dashboard?.maxXP ?? 0}
        streak={dashboard?.streak ?? 0}
      />

      {/* Main Content */}
      <div className="px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className={`w-12 h-12 rounded-full border-4 border-transparent ${
                isDarkMode ? 'border-t-indigo-500 border-r-indigo-500' : 'border-t-indigo-600 border-r-indigo-600'
              }`}
            />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* 1. CSI Core - Center Hero Section */}
            <CSICore
              csiScore={dashboard?.csi_score ?? 0}
              focusScore={dashboard?.focus_score ?? 0}
              retentionAvg={dashboard?.retention_avg ?? 0}
              burnoutInverse={dashboard?.burnout_inverse ?? 0}
              statusLabel={dashboard?.status_label ?? ''}
            />

            {/* 2. Three-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Burnout Radar */}
              <BurnoutRadar
                burnoutScore={dashboard?.burnout_score ?? 0}
                sleepDeficit={dashboard?.sleep_deficit ?? 0}
                consecutiveDays={dashboard?.study_days ?? 0}
                riskLevel={dashboard?.burnout_risk ?? 'low'}
              />

              {/* Center: Performance Card and Focus Card */}
              <div className="flex flex-col gap-4">
                <PerformanceCard
                  trend={dashboard?.performance_trend ?? 0}
                  trendIcon={dashboard?.performance_trend > 0 ? '▲' : '▼'}
                  trendColor={dashboard?.performance_trend > 0 ? 'text-green-500' : 'text-red-500'}
                  accuracy={dashboard?.accuracy ?? 0}
                  tests={dashboard?.tests ?? 0}
                  aiInsight={dashboard?.ai_insight ?? ''}
                />
                <FocusCard
                  focusScore={dashboard?.focus_score ?? 0}
                  deepWorkDuration={dashboard?.deep_work_duration ?? 0}
                  taskSwitchRate={dashboard?.task_switch_rate ?? 0}
                  qualityBadge={dashboard?.quality_badge ?? ''}
                />
              </div>

              {/* Right: Memory Heatmap */}
              <div className="p-4 rounded-lg shadow bg-white dark:bg-slate-800">
                <div className="font-semibold mb-2">Memory Heatmap</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {dashboard?.subject_fatigue && Object.entries(dashboard.subject_fatigue).map(([subject, count]) => (
                    <div key={subject} className="bg-slate-100 dark:bg-slate-700 rounded-lg p-3 flex flex-col items-center">
                      <span className="font-semibold text-sm mb-1">{subject}</span>
                      <span className="text-xl font-bold text-indigo-500">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Intervention Panel */}
            <InterventionPanel />

            {/* 4. Live Cognitive Timeline */}
            <CognitiveTimeline />

            {/* 5. Cognitive Forecast */}
            <CognitiveForecast />
          </motion.div>
        )}
      </div>

      {/* Subtle background pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className={`absolute w-96 h-96 rounded-full blur-3xl opacity-5 ${
            isDarkMode ? 'bg-indigo-500' : 'bg-indigo-300'
          }`}
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          style={{ top: '10%', left: '10%' }}
        />
        <motion.div
          className={`absolute w-96 h-96 rounded-full blur-3xl opacity-5 ${
            isDarkMode ? 'bg-purple-500' : 'bg-purple-300'
          }`}
          animate={{
            x: [0, -50, 0],
            y: [0, 100, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          style={{ bottom: '10%', right: '10%' }}
        />
      </div>
    </div>
  );
};

export default CognitiveIntelligenceDashboard;
