import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { supabase } from '../../lib/supabaseClient';
import { useCognitiveCheckin } from '../../contexts/CognitiveCheckinContext';
import { useSessionBootstrap } from '../../contexts/SessionBootstrapContext';
import { useDashboardAnalytics } from '../../contexts/DashboardAnalyticsContext';
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
  const { csiTrend, subjectFatigue, missedTrends, burnoutRisk, isLoading: analyticsLoading } = useDashboardAnalytics();
  const [loading, setLoading] = useState(true);

  // State for dashboard data
  const [dashboardData, setDashboardData] = useState({
    csiScore: 82,
    focusScore: 78,
    retentionAvg: 84,
    burnoutInverse: 70,
    performanceTrend: 90,
    burnoutScore: 30,
    sleepDeficit: -1.5,
    consecutiveDays: 5,
    riskLevel: 'low',
    accuracy: 85,
    testCount: 5,
    lastChange: 8,
    avgDeepWork: 45,
    taskSwitchRate: 12,
    dailyFocusScore: 78,
    userLevel: 12,
    userXP: 7234,
    maxXP: 10000,
    streak: 15,
  });

  // Subscribe to real-time updates
  useEffect(() => {
    let isMounted = true;
    const channels = [];

    const setupSubscriptions = async () => {
      try {
        // Create cognitive_index subscription
        const cognitiveChannel = supabase
          .channel('cognitive_updates')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'cognitive_index',
            },
            (payload) => {
              if (isMounted && payload.new) {
                console.log('Cognitive Index Update:', payload);
                setDashboardData(prev => ({
                  ...prev,
                  csiScore: payload.new.csi_score || prev.csiScore,
                  focusScore: payload.new.focus_score || prev.focusScore,
                  retentionAvg: payload.new.retention_avg || prev.retentionAvg,
                }));
              }
            }
          );

        await cognitiveChannel.subscribe();
        if (isMounted) channels.push(cognitiveChannel);

        // Create burnout_metrics subscription
        const burnoutChannel = supabase
          .channel('burnout_updates')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'burnout_metrics',
            },
            (payload) => {
              if (isMounted && payload.new) {
                console.log('Burnout Metrics Update:', payload);
                setDashboardData(prev => ({
                  ...prev,
                  burnoutScore: payload.new.burnout_score || prev.burnoutScore,
                  sleepDeficit: payload.new.sleep_deficit || prev.sleepDeficit,
                  riskLevel: payload.new.risk_level || prev.riskLevel,
                }));
              }
            }
          );

        await burnoutChannel.subscribe();
        if (isMounted) channels.push(burnoutChannel);

        // Create user_stats subscription
        const statsChannel = supabase
          .channel('stats_updates')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'user_stats',
            },
            (payload) => {
              if (isMounted && payload.new) {
                console.log('User Stats Update:', payload);
                setDashboardData(prev => ({
                  ...prev,
                  userXP: payload.new.xp || prev.userXP,
                  streak: payload.new.streak || prev.streak,
                  accuracy: payload.new.accuracy || prev.accuracy,
                }));
              }
            }
          );

        await statsChannel.subscribe();
        if (isMounted) channels.push(statsChannel);

        // Only set loading to false if component is still mounted
        if (isMounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error setting up subscriptions:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    setupSubscriptions();

    // Cleanup subscriptions safely
    return () => {
      isMounted = false;

      // Unsubscribe all channels that were successfully created
      channels.forEach((channel) => {
        if (channel && typeof channel.unsubscribe === 'function') {
          channel.unsubscribe().catch((err) => {
            console.warn('Error unsubscribing channel:', err);
          });
        }
      });

      // Also remove channels from Supabase
      channels.forEach((channel) => {
        if (channel) {
          try {
            supabase.removeChannel(channel);
          } catch (err) {
            console.warn('Error removing channel:', err);
          }
        }
      });
    };
  }, []);

  const bgGradient = isDarkMode
    ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
    : 'bg-gradient-to-br from-white via-slate-50 to-slate-100';

  const effectiveCsi = typeof csi === 'number' ? csi : dashboardData.csiScore;
  const effectiveBurnout = typeof burnoutScore === 'number' ? burnoutScore : dashboardData.burnoutScore;

  return (
    <div className={`${bgGradient} min-h-screen transition-colors duration-300`}>
      {/* Top Bar */}
      <TopBar
        userLevel={dashboardData.userLevel}
        userXP={dashboardData.userXP}
        maxXP={dashboardData.maxXP}
        streak={dashboardData.streak}
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
              csiScore={effectiveCsi}
              focusScore={dashboardData.focusScore}
              retentionAvg={dashboardData.retentionAvg}
              burnoutInverse={dashboardData.burnoutInverse}
              performanceTrend={dashboardData.performanceTrend}
            />

            {/* 2. Three-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Burnout Radar */}
              <BurnoutRadar
                burnoutScore={effectiveBurnout}
                sleepDeficit={dashboardData.sleepDeficit}
                consecutiveDays={dashboardData.consecutiveDays}
                riskLevel={dashboardData.riskLevel}
              />

              {/* Center: Performance & Focus (Stacked) */}
              <div className="space-y-6">
                <PerformanceCard
                  accuracy={dashboardData.accuracy}
                  testCount={dashboardData.testCount}
                  lastChange={dashboardData.lastChange}
                />
                <FocusCard
                  avgDeepWork={dashboardData.avgDeepWork}
                  taskSwitchRate={dashboardData.taskSwitchRate}
                  dailyFocusScore={dashboardData.dailyFocusScore}
                />
              </div>

              {/* Right: Memory Heatmap */}
              <MemoryHeatmap />
            </div>

            {/* 3. Intervention Panel */}
            <InterventionPanel />

            {/* 4. Live Cognitive Timeline */}
            <CognitiveTimeline />

            {/* 5. Cognitive Forecast */}
            <CognitiveForecast />

            {/* 6. COGNITIVE COMMAND CENTER - Analytics Dashboard */}
            <div className="mt-12 pt-8 border-t" style={{ borderColor: isDarkMode ? '#374151' : '#e2e8f0' }}>
              <h2
                className="text-2xl font-bold mb-8"
                style={{ color: isDarkMode ? '#f1f5f9' : '#0f172a' }}
              >
                🧠 Cognitive Command Center
              </h2>

              {/* Burnout Risk Indicator */}
              <div className="mb-6">
                <BurnoutRiskIndicator riskLevel={burnoutRisk || 'LOW'} />
              </div>

              {/* Analytics Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* CSI Trend Graph */}
                <CSITrendGraph data={csiTrend} />

                {/* Subject Fatigue Heatmap */}
                <SubjectFatigueHeatmap data={subjectFatigue} />

                {/* Missed Task Trends */}
                <MissedTaskTrends data={missedTrends} />
              </div>
            </div>
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
