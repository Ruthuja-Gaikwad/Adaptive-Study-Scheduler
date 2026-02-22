import { motion } from 'motion/react';
import { CheckCircle2, Circle, XCircle, Navigation, Loader2, Zap, Star, Book, BookOpen, Calculator, Atom, FlaskConical, Globe2, Coins, Cpu, Dna, Briefcase, BookText } from 'lucide-react';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useCognitiveCheckin } from '../contexts/CognitiveCheckinContext';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { useSessionBootstrap } from '../contexts/SessionBootstrapContext';
import { QuestBadge } from './QuestBadge';

const SUBJECT_ICON_MAP = {
  Mathematics: Calculator,
  Math: Calculator,
  Physics: Atom,
  Chemistry: FlaskConical,
  Biology: Dna,
  Economics: Coins,
  Accountancy: Calculator,
  'Business Studies': Briefcase,
  'Computer Science': Cpu,
  English: BookText,
  'Social Science': Globe2,
  History: Globe2,
  Geography: Globe2,
  'Political Science': Globe2,
  'Environmental Studies': BookOpen,
};

const SUBJECT_COLOR_MAP = {
  Mathematics: { light: '#0284C7', dark: '#7DD3FC' },
  Math: { light: '#0284C7', dark: '#7DD3FC' },
  Physics: { light: '#7C3AED', dark: '#C4B5FD' },
  Chemistry: { light: '#16A34A', dark: '#86EFAC' },
  Biology: { light: '#DB2777', dark: '#F9A8D4' },
  Economics: { light: '#CA8A04', dark: '#FDE047' },
  Accountancy: { light: '#D97706', dark: '#FCD34D' },
  'Business Studies': { light: '#EA580C', dark: '#FDBA74' },
  'Computer Science': { light: '#2563EB', dark: '#93C5FD' },
  English: { light: '#0F172A', dark: '#E5E7EB' },
  'Social Science': { light: '#0E7490', dark: '#67E8F9' },
  History: { light: '#334155', dark: '#CBD5F5' },
  Geography: { light: '#B45309', dark: '#FCD34D' },
  'Political Science': { light: '#6D28D9', dark: '#C7D2FE' },
  'Environmental Studies': { light: '#15803D', dark: '#86EFAC' },
};

const SUBJECT_COGNITIVE_LOAD = {
  Economics: 9,
  Polity: 7,
  'Political Science': 7,
  Ethics: 6,
  History: 5,
  Geography: 6,
  'Environmental Studies': 5,
  Philosophy: 8,
  'Indian History': 5,
  'World History': 6,
};

const MODE_BADGE_CONFIG = {
  Peak: { icon: '🟢', label: 'Peak Mode', color: { light: '#10b981', dark: '#34d399' } },
  Stable: { icon: '🔵', label: 'Stable', color: { light: '#3b82f6', dark: '#60a5fa' } },
  Fatigue: { icon: '🟡', label: 'Light Mode', color: { light: '#f59e0b', dark: '#fbbf24' } },
  Burnout: { icon: '🔴', label: 'Recovery Mode', color: { light: '#ef4444', dark: '#f87171' } },
};

export function GPSView({ onRerouteComplete }) {
  const { isDarkMode } = useDarkMode();
  const { sessionUser, isSessionLoading } = useSessionBootstrap();
  const { mode, rerouteStrategy, taskReduction, effectiveCsi, applyQuestBoost, setDailyQuestStreak, dailyQuestStreak } = useCognitiveCheckin();
  const [timelineNodes, setTimelineNodes] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  
  const refreshTasks = async (userId) => {
    console.log('[REROUTE] Refreshing tasks for user:', userId);
    try {
      setIsLoadingTasks(true);

      const { data, error } = await supabase
        .from('tasks')
        .select('id,title,status,scheduled_at,xp_reward,reroute_reason,subject_name')
        .eq('student_id', userId)
        .order('scheduled_at', { ascending: true });

      if (error) {
        console.error('[REROUTE] Failed to refresh tasks:', error.message);
        return;
      }

      const tasks = Array.isArray(data) ? data : [];
      setTimelineNodes(tasks);
      console.log('[REROUTE] ✅ UI Updated with', tasks?.length, 'live tasks');
    } catch (err) {
      console.error('[REROUTE] Error refreshing tasks:', err);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const getTasksWithCognitiveAdaptation = (tasks) => {
    // If mode is not Fatigue/Burnout, return all tasks in original order
    if (mode !== 'Fatigue' && mode !== 'Burnout') {
      return tasks;
    }

    // For Fatigue/Burnout modes: segregate high cognitive load tasks
    const highLoadTasks = [];
    const adaptedTasks = [];

    tasks.forEach((task) => {
      const cognitiveLoad = SUBJECT_COGNITIVE_LOAD[task.subject_name] || 5;
      if (cognitiveLoad > 7) {
        highLoadTasks.push({
          ...task,
          isHighCognitiveLoad: true,
        });
      } else {
        adaptedTasks.push(task);
      }
    });

    // Return adapted tasks first, then high-load tasks segregated
    return [...adaptedTasks, ...highLoadTasks];
  };

  const handleQuestCompletion = async (taskId, xpReward) => {
    if (!sessionUser?.id) {
      toast.error('User not found. Please log in again.');
      return;
    }

    try {
      // 1. Update task status to completed
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', taskId)
        .eq('student_id', sessionUser.id);

      if (updateError) {
        throw updateError;
      }

      // 2. Add XP to user profile
      if (xpReward && xpReward > 0) {
        const { data: profile, error: fetchError } = await supabase
          .from('profiles')
          .select('total_xp')
          .eq('id', sessionUser.id)
          .single();

        if (!fetchError && profile) {
          const newTotal = (profile.total_xp || 0) + xpReward;
          await supabase
            .from('profiles')
            .update({ total_xp: newTotal })
            .eq('id', sessionUser.id);
        }
      }

      // 3. Increment daily quest streak
      const today = new Date().toISOString().split('T')[0];
      const { data: existingStreak, error: streakError } = await supabase
        .from('quest_streaks')
        .select('streak_count')
        .eq('user_id', sessionUser.id)
        .eq('current_date', today)
        .single();

      if (!streakError && existingStreak) {
        // Already completed a quest today
        await supabase
          .from('quest_streaks')
          .update({ streak_count: existingStreak.streak_count + 1 })
          .eq('user_id', sessionUser.id)
          .eq('current_date', today);
      } else {
        // First quest today
        await supabase
          .from('quest_streaks')
          .insert({
            user_id: sessionUser.id,
            current_date: today,
            streak_count: 1,
          });
      }

      // 4. Apply temporary +5 CSI boost
      applyQuestBoost();
      setDailyQuestStreak(dailyQuestStreak + 1);

      toast.success(`🎉 Quest completed! +${xpReward} XP gained (+5 CSI boost)`);
      
      // Refresh tasks to reflect updated state
      await refreshTasks(sessionUser.id);
    } catch (err) {
      console.error('[QUEST] Error completing quest:', err);
      toast.error('Failed to complete quest. Please try again.');
    }
  };

  useEffect(() => {
    if (isSessionLoading) return;
    if (!sessionUser) {
      setTimelineNodes([]);
      setIsLoadingTasks(false);
      return;
    }

    refreshTasks(sessionUser.id);
  }, [isSessionLoading, sessionUser]);

  useEffect(() => {
    if (isSessionLoading || !sessionUser?.id) return;

    const channel = supabase
      .channel(`tasks-live-${sessionUser.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `student_id=eq.${sessionUser.id}`,
        },
        () => {
          refreshTasks(sessionUser.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isSessionLoading, sessionUser]);


  return (
    <div className="h-full overflow-auto">
      {/* Header */}
      <div 
        className="border-b px-4 py-6 transition-colors md:px-8"
        style={{
          backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
          borderColor: isDarkMode ? '#374151' : '#e2e8f0'
        }}
      >
        <div className="flex items-center gap-3">
          <Navigation 
            className="w-8 h-8"
            style={{ color: isDarkMode ? '#06D6A0' : '#4f46e5' }}
          />
          <div>
            <h2 
              className="text-3xl font-bold"
              style={{ color: isDarkMode ? '#f9fafb' : '#0f172a' }}
            >
              Quest GPS
            </h2>
            <p 
              className="mt-1"
              style={{ color: isDarkMode ? '#9ca3af' : '#475569' }}
            >
              Adaptive quest routing with intelligent reroutes
            </p>
          </div>
        </div>
      </div>

      {/* Timeline Visualization */}
      <div 
        className="px-4 py-8 md:px-8"
        style={{ backgroundColor: isDarkMode ? '#111827' : '#F8FAFC' }}
      >
        <div className="max-w-5xl mx-auto">
          {/* Legend */}
          <div 
            className="rounded-2xl shadow-sm p-6 mb-8 transition-colors"
            style={{
              backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
              borderColor: isDarkMode ? 'rgba(51, 65, 85, 0.6)' : '#e2e8f0',
              borderWidth: '1px',
              borderStyle: 'solid'
            }}
          >
            <h3 
              className="font-semibold mb-4"
              style={{ color: isDarkMode ? '#f9fafb' : '#0f172a' }}
            >
              Legend
            </h3>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 
                  className="w-5 h-5" 
                  style={{ color: isDarkMode ? '#06D6A0' : '#10b981' }}
                />
                <span className="text-sm" style={{ color: isDarkMode ? '#d1d5db' : '#475569' }}>Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-5 h-5 rounded-full border-4 animate-pulse"
                  style={{
                    borderColor: isDarkMode ? '#06D6A0' : '#4f46e5',
                    backgroundColor: isDarkMode ? '#374151' : '#ffffff'
                  }}
                />
                <span className="text-sm" style={{ color: isDarkMode ? '#d1d5db' : '#475569' }}>Active Now</span>
              </div>
              <div className="flex items-center gap-2">
                <Circle 
                  className="w-5 h-5" 
                  style={{ color: isDarkMode ? '#9ca3af' : '#9ca3af' }}
                />
                <span className="text-sm" style={{ color: isDarkMode ? '#d1d5db' : '#475569' }}>Upcoming</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-[#EF476F]" />
                <span className="text-sm" style={{ color: isDarkMode ? '#d1d5db' : '#475569' }}>Missed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 border-t-2 border-dashed border-[#FFB400]" />
                <span className="text-sm" style={{ color: isDarkMode ? '#d1d5db' : '#475569' }}>Auto-Rerouted</span>
              </div>
            </div>
          </div>

          {(() => {
            if (!timelineNodes.length) return null;
            const latestTask = [...timelineNodes]
              .filter((task) => task?.scheduled_at)
              .sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at))[0];
            const rerouteReason = latestTask?.reroute_reason;
            if (!latestTask || latestTask.status !== 'rerouted' || !rerouteReason) return null;

            return (
              <motion.div
                className="border-l-4 border-[#FFB400] rounded-2xl p-6 mb-8 w-full mx-2 sm:mx-0 shadow-sm"
                style={{
                  backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
                  border: isDarkMode ? undefined : '1px solid #e2e8f0',
                  borderLeft: '4px solid #FFB400'
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <p
                  className="text-sm sm:text-base"
                  style={{
                    color: isDarkMode ? '#d1d5db' : '#475569',
                    fontFamily: "'Noto Sans Devanagari', 'Noto Sans', sans-serif",
                  }}
                >
                  {rerouteReason}
                </p>
              </motion.div>
            );
          })()}

          {/* Cognitive Mode Badge */}
          {mode && (
            <motion.div
              className="mb-6 w-full mx-2 sm:mx-0 flex justify-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm border"
                style={{
                  backgroundColor: isDarkMode 
                    ? `${MODE_BADGE_CONFIG[mode]?.color?.dark}20` 
                    : `${MODE_BADGE_CONFIG[mode]?.color?.light}20`,
                  borderColor: isDarkMode 
                    ? MODE_BADGE_CONFIG[mode]?.color?.dark 
                    : MODE_BADGE_CONFIG[mode]?.color?.light,
                  color: isDarkMode 
                    ? MODE_BADGE_CONFIG[mode]?.color?.dark 
                    : MODE_BADGE_CONFIG[mode]?.color?.light,
                }}
              >
                <span className="text-lg">{MODE_BADGE_CONFIG[mode]?.icon}</span>
                <span>{MODE_BADGE_CONFIG[mode]?.label}</span>
                {taskReduction && <span className="text-xs opacity-75">({taskReduction}% reduced)</span>}
              </div>
            </motion.div>
          )}

          {/* Metro-style Timeline */}
          <div 
            className="rounded-2xl px-4 py-8 transition-colors md:px-8 shadow-sm"
            style={{
              backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
              border: isDarkMode ? undefined : '1px solid #e2e8f0'
            }}
          >
            {isLoadingTasks ? (
              <QuestLogSkeleton />
            ) : (
              <div className="relative">
                {getTasksWithCognitiveAdaptation(timelineNodes).map((node, index) => {
                  const adaptedTasks = getTasksWithCognitiveAdaptation(timelineNodes);
                  const nextNode = adaptedTasks[index + 1];
                  const isReroute = node.status === 'rerouted' || node.status === 'rescheduled';
                  const prevNodeMissed = index > 0 && adaptedTasks[index - 1].status === 'missed';
                  const isHighCognitiveLoad = node.isHighCognitiveLoad;

                  return (
                    <div key={node.id} className="relative">
                      <TimelineNodeComponent 
                        node={node} 
                        isReroute={isReroute}
                        prevNodeMissed={prevNodeMissed}
                        isDarkMode={isDarkMode}
                        isHighCognitiveLoad={isHighCognitiveLoad}
                        onQuestComplete={handleQuestCompletion}
                      />
                      
                      {/* Connection Line */}
                      {nextNode && (
                        <div className="relative ml-12 h-12">
                          {isReroute ? (
                            // Dashed amber reroute line
                            <svg 
                              className="absolute left-0 top-0 w-full h-full" 
                              style={{ overflow: 'visible' }}
                            >
                              <path
                                d="M 0 0 Q 20 24, 0 48"
                                stroke="#FFB400"
                                strokeWidth="3"
                                strokeDasharray="8 4"
                                fill="none"
                              />
                            </svg>
                          ) : node.status === 'missed' ? (
                            // Gray line for missed
                            <div className="absolute left-0 top-0 w-1 h-full bg-gray-300/70" />
                          ) : (
                            // Normal line
                            <div 
                              className="absolute left-0 top-0 w-1 h-full"
                              style={{ 
                                backgroundColor: node.status === 'completed' 
                                  ? (isDarkMode ? '#06D6A0' : '#10b981') 
                                  : 'rgba(209, 213, 219, 0.7)'
                              }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {!timelineNodes.length && (
                  <div 
                    className="rounded-2xl border border-dashed px-6 py-10 text-center text-sm"
                    style={{
                      borderColor: isDarkMode ? 'rgba(100, 116, 139, 0.6)' : '#e2e8f0',
                      color: isDarkMode ? '#cbd5e1' : '#475569'
                    }}
                  >
                    No quests scheduled yet. Check back after your next reroute.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineNodeComponent({ 
  node, 
  isReroute,
  prevNodeMissed,
  isDarkMode,
  isHighCognitiveLoad,
  onQuestComplete
}) {
  const [isCompleting, setIsCompleting] = useState(false);
  const scheduledAt = node?.scheduled_at ? new Date(node.scheduled_at) : null;
  const formattedDate = scheduledAt
    ? scheduledAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'TBD';
  const formattedTime = scheduledAt
    ? scheduledAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : 'TBD';
  const xpReward = Number.isFinite(node?.xp_reward) ? node.xp_reward : null;
  const isActive = node.status === 'active';
  const cognitiveLoad = SUBJECT_COGNITIVE_LOAD[node.subject_name] || 5;
  
  // Identify quests by high XP reward (>150) or explicit is_quest flag
  const isQuest = (xpReward && xpReward > 150) || node.is_quest === true;

  const handleCompleteQuest = async () => {
    setIsCompleting(true);
    try {
      await onQuestComplete(node.id, xpReward);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <motion.div
      className="flex items-start gap-4 pb-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4 }}
      transition={{ duration: 0.3 }}
    >
      {/* Node Icon */}
      <div className="relative flex-shrink-0">
        {node.status === 'completed' && (
          <CheckCircle2 
            className="w-10 h-10" 
            style={{ 
              color: isDarkMode ? '#06D6A0' : '#10b981',
              fill: isDarkMode ? '#06D6A0' : '#10b981'
            }}
          />
        )}
        {node.status === 'active' && (
          <motion.div
            className="w-10 h-10 rounded-full border-4 bg-white"
            style={{ borderColor: isDarkMode ? '#006D77' : '#4f46e5' }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        {node.status === 'upcoming' && (
          <Circle 
            className="w-10 h-10" 
            strokeWidth={2}
            style={{ color: isDarkMode ? '#9ca3af' : '#9ca3af' }}
          />
        )}
        {node.status === 'missed' && (
          <XCircle className="w-10 h-10 text-[#EF476F]" />
        )}
        {node.status === 'rescheduled' && (
          <div className="w-10 h-10 rounded-full border-4 border-[#FFB400] bg-white flex items-center justify-center shadow-[0_0_16px_rgba(255,180,0,0.45)] animate-pulse">
            <span className="text-lg">↻</span>
          </div>
        )}
        {node.status === 'rerouted' && (
          <div className="w-10 h-10 rounded-full border-4 border-[#FFB400] bg-white flex items-center justify-center shadow-[0_0_16px_rgba(255,180,0,0.45)] animate-pulse">
            <span className="text-lg">↻</span>
          </div>
        )}
      </div>

      {/* Node Content */}
      <motion.div 
        className={`flex-1 rounded-2xl p-4 relative transition-colors backdrop-blur-xl border shadow-[0_0_18px_rgba(15,23,42,0.12)] ${
          isReroute
            ? 'border-[#FFB400]/60 shadow-[0_0_20px_rgba(255,180,0,0.35)]'
            : isHighCognitiveLoad
            ? 'border-orange-400/40 shadow-[0_0_20px_rgba(251,146,60,0.25)]'
            : 'border-white/30 dark:border-slate-700/60'
        } ${isHighCognitiveLoad ? 'opacity-85' : ''} bg-white/60 dark:bg-slate-900/60`}
        animate={isActive ? { scale: [1, 1.015, 1], boxShadow: ['0 0 0 rgba(6,214,160,0)', '0 0 18px rgba(6,214,160,0.35)', '0 0 0 rgba(6,214,160,0)'] } : undefined}
        transition={isActive ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } : undefined}
      >
        {isReroute && (
          <div 
            className="absolute -top-8 left-0 text-xs px-3 py-1 rounded-full shadow-md"
            style={{
              backgroundColor: '#FFB400',
              color: isDarkMode ? '#1f2937' : '#ffffff'
            }}
          >
            Auto-adjusted to fit your free slot
          </div>
        )}

        {isHighCognitiveLoad && (
          <div 
            className="absolute -top-8 right-0 text-xs px-3 py-1 rounded-full shadow-md"
            style={{
              backgroundColor: '#fb923c',
              color: '#ffffff'
            }}
          >
            High Cognitive Load
          </div>
        )}
        
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 
                className="font-semibold text-lg"
                style={{ color: isDarkMode ? '#f9fafb' : '#0f172a' }}
              >
                {node.title}
              </h4>
              {isQuest && <QuestBadge isDarkMode={isDarkMode} animated={isActive} />}
            </div>
            {xpReward !== null && (
              <div 
                className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold md:hidden"
                style={{
                  backgroundColor: isDarkMode ? 'rgba(255, 180, 0, 0.2)' : 'rgba(255, 180, 0, 0.15)',
                  color: '#FFB400',
                  border: '1px solid rgba(255, 180, 0, 0.35)'
                }}
              >
                <Star className="h-4 w-4" />
                +{xpReward} XP
              </div>
            )}
            <div className="mt-3 flex w-full flex-wrap items-center gap-3 md:mt-2 md:w-auto">
              <span 
                className="text-sm"
                style={{ color: isDarkMode ? '#9ca3af' : '#475569' }}
              >
                {formattedDate}
              </span>
              <span 
                className="text-sm"
                style={{ color: isDarkMode ? '#9ca3af' : '#475569' }}
              >
                •
              </span>
              <span 
                className="text-sm"
                style={{ color: isDarkMode ? '#9ca3af' : '#475569' }}
              >
                {formattedTime}
              </span>
              {node.subject_name && (
                <>
                  <span 
                    className="text-sm"
                    style={{ color: isDarkMode ? '#9ca3af' : '#475569' }}
                  >
                    •
                  </span>
                  {(() => {
                    const Icon = SUBJECT_ICON_MAP[node.subject_name] || BookOpen;
                    const color = SUBJECT_COLOR_MAP[node.subject_name] || { light: '#6b7280', dark: '#9ca3af' };
                    const iconColor = isDarkMode ? color.dark : color.light;
                    return (
                      <div 
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-200 hover:shadow-md relative group"
                        style={{ 
                          backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
                          border: `1.5px solid ${iconColor}20`
                        }}
                      >
                        <Icon 
                          className="w-3.5 h-3.5 flex-shrink-0" 
                          style={{ color: iconColor }}
                        />
                        <span 
                          className="text-xs font-medium"
                          style={{ color: iconColor }}
                        >
                          {node.subject_name}
                        </span>
                        {cognitiveLoad > 7 && (
                          <span 
                            className="ml-1 text-xs font-bold"
                            style={{ color: '#fb923c' }}
                          >
                            ⚠️
                          </span>
                        )}
                        <div 
                          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10"
                        >
                          Cognitive Load: {cognitiveLoad}/10
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {xpReward !== null && (
              <div 
                className="hidden items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold md:inline-flex"
                style={{
                  backgroundColor: isDarkMode ? 'rgba(255, 180, 0, 0.2)' : 'rgba(255, 180, 0, 0.15)',
                  color: '#FFB400',
                  border: '1px solid rgba(255, 180, 0, 0.35)'
                }}
              >
                <Star className="h-4 w-4" />
                +{xpReward} XP
              </div>
            )}
            
            {isQuest && node.status !== 'completed' && isActive && (
              <motion.button
                onClick={handleCompleteQuest}
                disabled={isCompleting}
                className="px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2"
                style={{
                  backgroundColor: isDarkMode ? '#10b981' : '#4f46e5',
                  color: '#ffffff',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isCompleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">Completing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Complete</span>
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function QuestLogSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-full bg-slate-200/70 dark:bg-slate-700/70 animate-pulse" />
          <div className="flex-1 rounded-2xl border border-white/30 bg-white/60 dark:border-slate-700/60 dark:bg-slate-900/60 p-4 backdrop-blur-xl shadow-lg">
            <div className="h-4 w-2/3 rounded-full bg-slate-200/80 dark:bg-slate-700/80 animate-pulse" />
            <div className="mt-3 h-3 w-1/3 rounded-full bg-slate-200/80 dark:bg-slate-700/80 animate-pulse" />
            <div className="mt-4 h-3 w-1/2 rounded-full bg-slate-200/80 dark:bg-slate-700/80 animate-pulse" />
          </div>
        </div>
      ))}
      <div className="text-center text-sm text-slate-500 dark:text-slate-300">Loading Quest Log...</div>
    </div>
  );
}

function getSubjectColor(subject, isDarkMode) {
  const colors = {
    Math: { bg: isDarkMode ? '#1e3a8a' : '#dbeafe', color: isDarkMode ? '#7dd3fc' : '#1e40af' },
    Physics: { bg: isDarkMode ? '#4c1d95' : '#e9d5ff', color: isDarkMode ? '#d8b4fe' : '#6b21a8' },
    Chemistry: { bg: isDarkMode ? '#15803d' : '#dcfce7', color: isDarkMode ? '#86efac' : '#15803d' },
    Biology: { bg: isDarkMode ? '#831843' : '#fbcfe8', color: isDarkMode ? '#f472b6' : '#9d174d' },
  };
  const style = colors[subject] || { bg: isDarkMode ? '#4b5563' : '#f3f4f6', color: isDarkMode ? '#d1d5db' : '#374151' };
  return style;
}
