import { motion } from 'motion/react';
import { CheckCircle2, Circle, XCircle, Navigation, Loader2, Zap, Star } from 'lucide-react';
import { useDarkMode } from '../contexts/DarkModeContext';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { useSessionBootstrap } from '../contexts/SessionBootstrapContext';
import { N8N_WEBHOOK_URL } from '../config/webhooks';

export function GPSView({ onRerouteComplete }) {
  const { isDarkMode } = useDarkMode();
  const { sessionUser, isSessionLoading } = useSessionBootstrap();
  const [isRerouting, setIsRerouting] = useState(false);
  const [timelineNodes, setTimelineNodes] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  
  const refreshTasks = async (userId) => {
    console.log('[REROUTE] Refreshing tasks for user:', userId);
    try {
      setIsLoadingTasks(true);

      const { data, error } = await supabase
        .from('tasks')
        .select('id,title,subject,status,scheduled_at,xp_reward,reroute_reason')
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
  
  const handleActivateRerouting = async () => {
    setIsRerouting(true);
    try {
      let userId = sessionUser?.id || null;

      if (!userId) {
        const { data } = await supabase.auth.getSession();
        userId = data?.session?.user?.id;
      }

      if (!userId) {
        toast.error('Unable to get user ID. Please log in again.');
        setIsRerouting(false);
        return;
      }

      console.log('[REROUTE] Initiating manual reroute for user:', userId);

      const webhookUrl = N8N_WEBHOOK_URL;
      if (!webhookUrl || webhookUrl.includes('[PASTE_YOUR_ONE_WEBHOOK_URL]')) {
        toast.error('Webhook URL not configured');
        console.error('[REROUTE] N8N_WEBHOOK_URL not set');
        setIsRerouting(false);
        return;
      }

      // Send reroute request to n8n
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: userId,
          action: 'reroute',
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook error: ${response.status}`);
      }

      console.log('[REROUTE] ✅ Reroute triggered successfully');
      toast.success('Rerouting activated! Your schedule is being optimized...');

      // Refresh tasks to show updated schedule
      await refreshTasks(userId);

      // Call callback if provided
      if (onRerouteComplete) {
        onRerouteComplete();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[REROUTE] ❌ Error:', message);
      toast.error(`Rerouting failed: ${message}`);
    } finally {
      setIsRerouting(false);
    }
  };

  return (
    <div className="h-full overflow-auto">
      {/* Header */}
      <div 
        className="border-b px-4 py-6 transition-colors md:px-8"
        style={{
          backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
          borderColor: isDarkMode ? '#374151' : '#e5e7eb'
        }}
      >
        <div className="flex items-center gap-3">
          <Navigation 
            className="w-8 h-8"
            style={{ color: isDarkMode ? '#06D6A0' : '#006D77' }}
          />
          <div>
            <h2 
              className="text-3xl font-bold"
              style={{ color: isDarkMode ? '#f9fafb' : '#111827' }}
            >
              Quest GPS
            </h2>
            <p 
              className="mt-1"
              style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
            >
              Adaptive quest routing with intelligent reroutes
            </p>
          </div>
        </div>
      </div>

      {/* Timeline Visualization */}
      <div 
        className="px-4 py-8 md:px-8"
        style={{ backgroundColor: isDarkMode ? '#111827' : '#ffffff' }}
      >
        <div className="max-w-5xl mx-auto">
          {/* Legend */}
          <div className="rounded-2xl shadow-xl p-6 mb-8 transition-colors bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/60">
            <h3 
              className="font-semibold mb-4"
              style={{ color: isDarkMode ? '#f9fafb' : '#111827' }}
            >
              Legend
            </h3>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#06D6A0]" />
                <span className="text-sm" style={{ color: isDarkMode ? '#d1d5db' : '#6b7280' }}>Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-5 h-5 rounded-full border-4 animate-pulse"
                  style={{
                    borderColor: isDarkMode ? '#06D6A0' : '#006D77',
                    backgroundColor: isDarkMode ? '#374151' : '#ffffff'
                  }}
                />
                <span className="text-sm" style={{ color: isDarkMode ? '#d1d5db' : '#6b7280' }}>Active Now</span>
              </div>
              <div className="flex items-center gap-2">
                <Circle 
                  className="w-5 h-5" 
                  style={{ color: isDarkMode ? '#9ca3af' : '#9ca3af' }}
                />
                <span className="text-sm" style={{ color: isDarkMode ? '#d1d5db' : '#6b7280' }}>Upcoming</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-[#EF476F]" />
                <span className="text-sm" style={{ color: isDarkMode ? '#d1d5db' : '#6b7280' }}>Missed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 border-t-2 border-dashed border-[#FFB400]" />
                <span className="text-sm" style={{ color: isDarkMode ? '#d1d5db' : '#6b7280' }}>Auto-Rerouted</span>
              </div>
            </div>
          </div>

          {/* Activate Rerouting Button */}
          <motion.div
            className="mb-8 w-full mx-2 sm:mx-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <button
              onClick={handleActivateRerouting}
              disabled={isRerouting}
              className="w-full px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed hover:shadow-lg"
              style={{
                backgroundColor: isRerouting 
                  ? isDarkMode ? '#6b7280' : '#9ca3af'
                  : isDarkMode ? '#06D6A0' : '#006D77',
              }}
            >
              {isRerouting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Consulting the Oracle...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  <span>Activate Rerouting</span>
                </>
              )}
            </button>
          </motion.div>

          {(() => {
            if (!timelineNodes.length) return null;
            const latestTask = [...timelineNodes]
              .filter((task) => task?.scheduled_at)
              .sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at))[0];
            const rerouteReason = latestTask?.reroute_reason;
            if (!latestTask || latestTask.status !== 'rerouted' || !rerouteReason) return null;

            return (
              <motion.div
                className="border-l-4 border-[#FFB400] rounded-2xl p-6 mb-8 w-full mx-2 sm:mx-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <p
                  className="text-sm sm:text-base"
                  style={{
                    color: isDarkMode ? '#d1d5db' : '#6b7280',
                    fontFamily: "'Noto Sans Devanagari', 'Noto Sans', sans-serif",
                  }}
                >
                  {rerouteReason}
                </p>
              </motion.div>
            );
          })()}

          {/* Metro-style Timeline */}
          <div className="rounded-2xl px-4 py-8 transition-colors md:px-8 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-2xl">
            {isLoadingTasks ? (
              <QuestLogSkeleton />
            ) : (
              <div className="relative">
                {timelineNodes.map((node, index) => {
                  const nextNode = timelineNodes[index + 1];
                  const isReroute = node.status === 'rerouted' || node.status === 'rescheduled';
                  const prevNodeMissed = index > 0 && timelineNodes[index - 1].status === 'missed';

                  return (
                    <div key={node.id} className="relative">
                      <TimelineNodeComponent 
                        node={node} 
                        isReroute={isReroute}
                        prevNodeMissed={prevNodeMissed}
                        isDarkMode={isDarkMode}
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
                            <div className={`absolute left-0 top-0 w-1 h-full ${
                              node.status === 'completed' ? 'bg-[#06D6A0]' : 'bg-gray-300/70'
                            }`} />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {!timelineNodes.length && (
                  <div className="rounded-2xl border border-dashed border-slate-300/70 px-6 py-10 text-center text-sm text-slate-500 dark:border-slate-600/60 dark:text-slate-300">
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
  isDarkMode
}) {
  const scheduledAt = node?.scheduled_at ? new Date(node.scheduled_at) : null;
  const formattedDate = scheduledAt
    ? scheduledAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'TBD';
  const formattedTime = scheduledAt
    ? scheduledAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : 'TBD';
  const xpReward = Number.isFinite(node?.xp_reward) ? node.xp_reward : null;
  const isActive = node.status === 'active';

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
          <CheckCircle2 className="w-10 h-10 text-[#06D6A0] fill-[#06D6A0]" />
        )}
        {node.status === 'active' && (
          <motion.div
            className="w-10 h-10 rounded-full border-4 border-[#006D77] bg-white"
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
            : 'border-white/30 dark:border-slate-700/60'
        } bg-white/60 dark:bg-slate-900/60`}
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
        
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <h4 
              className="font-semibold text-lg"
              style={{ color: isDarkMode ? '#f9fafb' : '#111827' }}
            >
              {node.title}
            </h4>
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
                style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
              >
                {formattedDate}
              </span>
              <span 
                className="text-sm"
                style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
              >
                •
              </span>
              <span 
                className="text-sm"
                style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
              >
                {formattedTime}
              </span>
              {node.subject && (
                <>
                  <span 
                    className="text-sm"
                    style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
                  >
                    •
                  </span>
                  {(() => {
                    const style = getSubjectColor(node.subject, isDarkMode);
                    return (
                      <span 
                        className="text-xs px-2 py-1 rounded-full"
                        style={{ backgroundColor: style.bg, color: style.color }}
                      >
                        {node.subject}
                      </span>
                    );
                  })()}
                </>
              )}
            </div>
          </div>
          
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
