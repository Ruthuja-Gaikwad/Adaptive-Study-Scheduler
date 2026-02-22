import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Lock, Zap, Gift, BookOpen, Trophy, Target, Loader2, AlertCircle } from 'lucide-react';
import { Progress } from './ui/progress';
import { useDarkMode } from '../contexts/DarkModeContext';
import { supabase } from '../lib/supabaseClient';
import { useSessionBootstrap } from '../contexts/SessionBootstrapContext';

export function Quests() {
  const { isDarkMode } = useDarkMode();
  const { sessionUser, isSessionLoading } = useSessionBootstrap();
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSessionLoading || !sessionUser?.id) {
      console.log('[QUESTS] Waiting for session:', { isSessionLoading, sessionUserId: sessionUser?.id });
      return;
    }

    const fetchQuests = async () => {
      try {
        setLoading(true);
        console.log('[QUESTS] Fetching quests for user:', sessionUser.id);
        
        // First, fetch ALL tasks to see what statuses exist
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('student_id', sessionUser.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[QUESTS] Database error:', error.message, error.details);
          console.error('[QUESTS] Full error object:', error);
          setLoading(false);
          return;
        }

        console.log('[QUESTS] ✅ Fetched', data?.length, 'quests');
        if (data && data.length > 0) {
          console.log('[QUESTS] Sample quest:', data[0]);
          console.log('[QUESTS] Sample keys:', Object.keys(data[0]));
          console.log('[QUESTS] Unique statuses:', [...new Set(data.map(q => q.status))]);
        } else {
          console.log('[QUESTS] ⚠️ No data returned. Check if student_id exists in tasks table.');
          console.log('[QUESTS] User ID being queried:', sessionUser.id);
          
          // Try fetching ALL tasks without filter to verify table has data
          const { data: allTasks } = await supabase
            .from('tasks')
            .select('id,student_id,title')
            .limit(5);
          
          console.log('[QUESTS] Sample of ALL tasks (no filter):', allTasks);
        }

        // Map Supabase fields to UI structure
        const mappedQuests = (data || []).map((q) => ({
          id: q.id,
          type: q.status === 'rerouted' ? 'side' : 'main',
          title: q.title,
          description: q.reroute_reason || `Improve your understanding of ${q.subject_name || 'this topic'}`,
          category: q.subject_name || 'General',
          progress: q.status === 'completed' ? 100 : (q.status === 'rerouted' ? 20 : 50),
          total: 100,
          reward: { xp: q.xp_reward || 0, badge: q.xp_reward > 300 ? 'Champion' : null },
          status: q.status,
          difficulty: (q.xp_reward || 0) > 300 ? 'Hard' : (q.xp_reward || 0) > 150 ? 'Medium' : 'Easy',
          daysLeft: 7,
          icon: getIconForSubject(q.subject_name),
        }));

        console.log('[QUESTS] Mapped quests:', mappedQuests);
        setQuests(mappedQuests);
        setLoading(false);
      } catch (err) {
        console.error('[QUESTS] Error in fetchQuests:', err);
        setLoading(false);
      }
    };

    fetchQuests();

    // Set up real-time subscription for quest updates
    const channel = supabase
      .channel(`tasks-user-${sessionUser.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `student_id=eq.${sessionUser.id}`,
        },
        (payload) => {
          console.log('[QUESTS] Real-time update received:', payload.eventType);
          fetchQuests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isSessionLoading, sessionUser]);

  // Filter quests
  const mainQuests = quests.filter(q => q.type === 'main');
  const sideQuests = quests.filter(q => q.type === 'side');
  const completedQuests = quests.filter(q => q.status === 'completed').length;

  return (
    <div className="h-full overflow-auto">
      {/* Header */}
      <div 
        className="border-b px-8 py-6 transition-colors"
        style={{
          backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
          borderColor: isDarkMode ? '#374151' : '#e2e8f0'
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-[#FFB400]" />
            <div>
              <h2 
                className="text-3xl font-bold"
                style={{ color: isDarkMode ? '#f9fafb' : '#0f172a' }}
              >
                Quest Board
              </h2>
              <p 
                className="text-sm mt-1"
              style={{ color: isDarkMode ? '#9ca3af' : '#475569' }}
              >
                {completedQuests} completed • {quests.filter(q => q.status === 'active').length} active
              </p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex gap-8">
            <div className="text-right">
              <div className="text-2xl font-bold text-[#FFB400]">{mainQuests.length}</div>
              <div 
                className="text-sm"
                style={{ color: isDarkMode ? '#9ca3af' : '#475569' }}
              >
                Main Quests
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[#06D6A0]">{sideQuests.length}</div>
              <div 
                className="text-sm"
                style={{ color: isDarkMode ? '#9ca3af' : '#475569' }}
              >
                Side Quests
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div 
        className="p-8"
        style={{
          backgroundColor: isDarkMode ? '#111827' : '#F8FAFC'
        }}
      >
        <div className="max-w-6xl mx-auto space-y-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-[#006D77]" />
              <p style={{ color: isDarkMode ? '#9ca3af' : '#475569' }}>
                Loading your quests...
              </p>
            </div>
          ) : quests.length === 0 ? (
            <div className="text-center py-16">
              <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: isDarkMode ? '#9ca3af' : '#475569' }} />
              <p style={{ color: isDarkMode ? '#9ca3af' : '#475569' }}>
                No quests found. Check back after your next AI reroute!
              </p>
            </div>
          ) : (
            <>
              {/* Main Quests Section */}
              {mainQuests.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <BookOpen className="w-6 h-6 text-[#FFB400]" />
                    <h3 
                      className="text-2xl font-bold"
                      style={{ color: isDarkMode ? '#f9fafb' : '#0f172a' }}
                    >
                      Active Quests
                    </h3>
                    <span className="ml-2 px-3 py-1 bg-[#FFB400]/20 text-[#FFB400] rounded-full text-sm font-semibold">
                      {mainQuests.filter(q => q.status === 'active').length} Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {mainQuests.map((quest, index) => (
                      <QuestCard 
                        key={quest.id} 
                        quest={quest} 
                        index={index}
                        isMain={true}
                        isDarkMode={isDarkMode}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Rerouted/Side Quests Section (Redemption Quests) */}
              {sideQuests.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <Zap className="w-6 h-6 text-[#FF9F43]" />
                    <h3 
                      className="text-2xl font-bold"
                      style={{ color: isDarkMode ? '#f9fafb' : '#0f172a' }}
                    >
                      Redemption Quests
                    </h3>
                    <span className="ml-2 px-3 py-1 bg-[#FF9F43]/20 text-[#FF9F43] rounded-full text-sm font-semibold">
                      {sideQuests.filter(q => q.status === 'rerouted').length} Rerouted
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sideQuests.map((quest, index) => (
                      <QuestCard 
                        key={quest.id} 
                        quest={quest} 
                        index={index}
                        isMain={false}
                        isDarkMode={isDarkMode}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function QuestCard({ quest, index, isMain, isDarkMode }) {
  const progressPercent = (quest.progress / quest.total) * 100;
  const isLocked = quest.status === 'locked';
  const isCompleted = quest.status === 'completed';
  const isRerouted = quest.status === 'rerouted';

  let cardBgColor = '#ffffff';
  if (isRerouted) {
    // Orange/amber glow for redemption quests
    cardBgColor = isDarkMode ? '#7c2d12' : '#fff7ed';
  } else if (isLocked) {
    cardBgColor = isDarkMode ? '#374151' : '#f3f4f6';
  } else if (isCompleted) {
    cardBgColor = 'linear-gradient(to right bottom, #06D6A0, #00a896)';
  } else {
    cardBgColor = isDarkMode ? '#1f2937' : '#ffffff';
  }

  return (
    <motion.div
      className="relative rounded-xl overflow-hidden shadow-md transition-all"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={!isLocked ? { y: -4, shadowColor: 'rgba(0, 0, 0, 0.15)' } : {}}
    >
      <div 
        className="p-6 transition-colors"
        style={{
          background: cardBgColor
        }}
      >
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex gap-3 flex-1">
            <div className="text-3xl flex-shrink-0">
              {quest.icon}
            </div>
            <div className="flex-1">
              <h4 
                className="font-bold text-lg"
                style={{
                  color: isCompleted ? '#ffffff' : (isDarkMode ? '#f9fafb' : '#0f172a')
                }}
              >
                {quest.title}
              </h4>
            </div>
          </div>
          
          {/* Status Icon */}
          <div className="ml-2">
            {isCompleted && (
              <CheckCircle2 className="w-6 h-6 text-white fill-white" />
            )}
            {isRerouted && (
              <div 
                className="w-6 h-6 rounded-full border-2 flex items-center justify-center animate-pulse"
                style={{
                  borderColor: isDarkMode ? '#FF9F43' : '#FF9F43',
                  backgroundColor: isDarkMode ? 'rgba(255, 159, 67, 0.1)' : 'rgba(255, 159, 67, 0.1)'
                }}
              >
                <span className="text-xs">↻</span>
              </div>
            )}
            {isLocked && (
              <Lock 
                className="w-6 h-6" 
                style={{ color: isDarkMode ? '#9ca3af' : '#9ca3af' }}
              />
            )}
            {quest.status === 'active' && (
              <motion.div
                className="w-6 h-6 rounded-full border-2 border-[#006D77] dark:border-[#06D6A0]"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            )}
          </div>
        </div>

        {/* Description */}
        <p 
          className="text-sm mb-4"
          style={{
            color: isCompleted 
              ? 'rgba(255, 255, 255, 0.9)' 
              : isLocked
              ? '#9ca3af'
              : (isDarkMode ? '#9ca3af' : '#475569')
          }}
        >
          {quest.description}
        </p>

        {/* Metadata */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span 
            className="text-xs px-2 py-1 rounded-full font-medium"
            style={getCategoryColor(quest.category, isDarkMode)}
          >
            {quest.category}
          </span>
          <span 
            className="text-xs px-2 py-1 rounded-full"
            style={{
              backgroundColor: isCompleted 
                ? 'rgba(255, 255, 255, 0.2)' 
                : (isDarkMode ? '#4b5563' : '#e2e8f0'),
              color: isCompleted 
                ? '#ffffff'
                : (isDarkMode ? '#d1d5db' : '#374151')
            }}
          >
            {quest.difficulty}
          </span>
          {!isLocked && !isCompleted && (
            <span 
              className="text-xs px-2 py-1 rounded-full"
              style={{
                backgroundColor: quest.daysLeft <= 2 
                  ? (isDarkMode ? '#7f1d1d' : '#fee2e2')
                  : (isDarkMode ? '#78350f' : '#fef3c7'),
                color: quest.daysLeft <= 2 
                  ? (isDarkMode ? '#fca5a5' : '#dc2626')
                  : (isDarkMode ? '#fcd34d' : '#b45309')
              }}
            >
              {quest.daysLeft}d left
            </span>
          )}
        </div>

        {/* Progress Bar */}
        {!isLocked && (
          <div className="mb-4 space-y-2">
            <div className="flex justify-between items-center">
              <span 
                className="text-xs font-semibold"
                style={{
                  color: isCompleted 
                    ? '#ffffff' 
                    : (isDarkMode ? '#d1d5db' : '#374151')
                }}
              >
                Progress
              </span>
              <span 
                className="text-xs font-bold"
                style={{
                  color: isCompleted 
                    ? '#ffffff' 
                    : (isDarkMode ? '#9ca3af' : '#6b7280')
                }}
              >
                {quest.progress} / {quest.total}
              </span>
            </div>
            <Progress 
              value={progressPercent} 
              className={isCompleted ? 'h-3 bg-white/20' : 'h-3'}
            />
          </div>
        )}

        {/* Locked State */}
        {isLocked && (
          <div 
            className="text-center py-4"
            style={{ color: isDarkMode ? '#9ca3af' : '#9ca3af' }}
          >
            <Lock 
              className="w-8 h-8 mx-auto mb-2" 
              style={{ color: isDarkMode ? '#9ca3af' : '#9ca3af' }}
            />
            <p className="text-sm">Complete other quests to unlock</p>
          </div>
        )}

        {/* Rewards */}
        {!isLocked && (
          <div 
            className="flex items-center gap-2 pt-4"
            style={{
              borderTop: `1px solid ${
                isCompleted 
                  ? 'rgba(255, 255, 255, 0.2)' 
                  : (isDarkMode ? '#4b5563' : '#e5e7eb')
              }`
            }}
          >
            <Gift 
              className="w-4 h-4"
              style={{
                color: isCompleted ? '#ffffff' : '#FFB400'
              }}
            />
            <span 
              className="text-sm font-semibold"
              style={{
                color: isCompleted 
                  ? '#ffffff' 
                  : (isDarkMode ? '#f9fafb' : '#111827')
              }}
            >
              +{quest.reward.xp} XP
            </span>
            {quest.reward.badge && (
              <>
                <span style={{
                  color: isCompleted ? 'rgba(255, 255, 255, 0.4)' : (isDarkMode ? '#4b5563' : '#d1d5db')
                }}>
                  •
                </span>
                <span 
                  className="text-sm"
                  style={{
                    color: isCompleted 
                      ? '#ffffff' 
                      : (isDarkMode ? '#9ca3af' : '#6b7280')
                  }}
                >
                  {quest.reward.badge}
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function getCategoryColor(category, isDarkMode) {
  const colors = {
    Math: { bg: isDarkMode ? '#1e3a8a' : '#dbeafe', color: isDarkMode ? '#7dd3fc' : '#1e40af' },
    Physics: { bg: isDarkMode ? '#4c1d95' : '#e9d5ff', color: isDarkMode ? '#d8b4fe' : '#6b21a8' },
    Chemistry: { bg: isDarkMode ? '#15803d' : '#dcfce7', color: isDarkMode ? '#86efac' : '#15803d' },
    Biology: { bg: isDarkMode ? '#831843' : '#fbcfe8', color: isDarkMode ? '#f472b6' : '#9d174d' },
    General: { bg: isDarkMode ? '#4b5563' : '#f3f4f6', color: isDarkMode ? '#d1d5db' : '#374151' },
  };
  const style = colors[category] || { bg: isDarkMode ? '#4b5563' : '#f3f4f6', color: isDarkMode ? '#d1d5db' : '#374151' };
  return style;
}

function getIconForSubject(subject) {
  const icons = {
    'Mathematics': '📐',
    'Math': '📐',
    'Physics': '🔬',
    'Chemistry': '⚗️',
    'Biology': '🧬',
    'Computer Science': '💻',
    'English': '📚',
    'History': '📖',
    'Geography': '🌍',
    'Economics': '💹',
    'Accountancy': '📊',
    'Business Studies': '💼',
    'Political Science': '🏛️',
    'Environmental Studies': '🌱',
    'General': '🛡️'
  };
  return icons[subject] || '📜';
}
