      // STEP 3: Update memory_tracking for user/topic
      if (newCompleted && task.topic_id) {
        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10);
        const nextRevision3 = new Date(today.getTime() + 3 * 86400000).toISOString().slice(0, 10);
        const nextRevision2 = new Date(today.getTime() + 2 * 86400000).toISOString().slice(0, 10);
        const uuid = crypto.randomUUID ? crypto.randomUUID() : (window.crypto && window.crypto.randomUUID && window.crypto.randomUUID());

        // Check if record exists
        const { data: memRow, error: memError } = await supabase
          .from('memory_tracking')
          .select('*')
          .eq('user_id', sessionUser.id)
          .eq('topic_id', task.topic_id)
          .single();

        if (memRow) {
          await supabase
            .from('memory_tracking')
            .update({
              revision_count: memRow.revision_count + 1,
              last_revision_date: todayStr,
              retention_score: Math.min(memRow.retention_score + 5, 100),
              next_revision_date: nextRevision3,
              decay_constant: Math.max(memRow.decay_constant - 0.01, 0.01)
            })
            .eq('id', memRow.id);
        } else {
          await supabase
            .from('memory_tracking')
            .insert({
              id: uuid,
              user_id: sessionUser.id,
              topic_id: task.topic_id,
              last_revision_date: todayStr,
              revision_count: 1,
              retention_score: 60,
              next_revision_date: nextRevision2,
              decay_constant: 0.1,
              created_at: today.toISOString()
            });
        }
      }
import { useState, useEffect } from 'react';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import { motion } from 'motion/react';
import { Flame, Heart, Bell, BookOpen, Clock, Trophy, Brain, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useDarkMode } from '../contexts/DarkModeContext';
import { supabase } from '../lib/supabaseClient';
import { useSessionBootstrap } from '../contexts/SessionBootstrapContext';

export function Dashboard() {
  const { isDarkMode } = useDarkMode();
  const { sessionUser, isSessionLoading } = useSessionBootstrap();
  const [tasks, setTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [totalXP, setTotalXP] = useState(0);

  const [sideQuests] = useState([
    { id: '1', name: 'The Weekend Warrior', description: 'Complete 5 hrs of study on Sat/Sun', current: 3, total: 5 },
    { id: '2', name: 'Flashcard Frenzy', description: 'Review 50 cards', current: 10, total: 50 },
  ]);

  const [subjectFatigue, setSubjectFatigue] = useState([]);
  const [isLoadingFatigue, setIsLoadingFatigue] = useState(true);

  useEffect(() => {
    if (isSessionLoading || !sessionUser?.id) {
      setTotalXP(0);
      return;
    }

    let isMounted = true;

    const fetchTotalXP = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('total_xp')
        .eq('id', sessionUser.id)
        .single();

      if (!isMounted) return;

      if (error) {
        console.error('[DASHBOARD] Error fetching total XP:', error);
        return;
      }

      setTotalXP(data?.total_xp ?? 0);
    };

    fetchTotalXP();

    return () => {
      isMounted = false;
    };
  }, [isSessionLoading, sessionUser?.id]);

  const levelInfo = getLevel(totalXP);
  const levelProgress = levelInfo.nextXP > 0
    ? Math.round((levelInfo.currentXP / levelInfo.nextXP) * 100)
    : 0;

  useEffect(() => {
    if (isSessionLoading || !sessionUser?.id) {
      setTasks([]);
      setIsLoadingTasks(false);
      return;
    }

    let isMounted = true;

    const fetchTodayTasks = async () => {
      try {
        setIsLoadingTasks(true);
        const today = new Date().toISOString().slice(0, 10);

        const { data, error } = await supabase
          .from('tasks')
          .select('id,title,status,subject_name,xp_reward,scheduled_time,estimated_minutes,cognitive_load_score,complexity')
          .eq('student_id', sessionUser.id)
          .eq('due_date', today)
          .order('scheduled_time', { ascending: true });

        if (error) {
          console.error('[DASHBOARD] Error fetching today tasks:', error);
          return;
        }

        const mapped = (data || []).map((task) => ({
          id: task.id,
          name: task.title || 'Untitled task',
          duration: Number.isFinite(task.estimated_minutes)
            ? `${task.estimated_minutes} mins`
            : task.scheduled_time || '—',
          subject_name: task.subject_name,
          xp: task.xp_reward ?? 0,
          completed: task.status === 'completed',
          cognitive_load_score: task.cognitive_load_score,
          complexity: task.complexity,
        }));

        if (isMounted) {
          setTasks(mapped);
        }
      } catch (err) {
        console.error('[DASHBOARD] Error in fetchTodayTasks:', err);
      } finally {
        if (isMounted) {
          setIsLoadingTasks(false);
        }
      }
    };

    fetchTodayTasks();

    return () => {
      isMounted = false;
    };
  }, [isSessionLoading, sessionUser?.id]);

  // Fetch subject fatigue data from Supabase
  useEffect(() => {
    if (isSessionLoading || !sessionUser?.id) {
      return;
    }

    const fetchSubjectFatigue = async () => {
      try {
        setIsLoadingFatigue(true);
        console.log('[DASHBOARD] Fetching subject fatigue for user:', sessionUser.id);

        const { data, error } = await supabase
          .from('subject_fatigue')
          .select('*')
          .eq('user_id', sessionUser.id)
          .order('fatigue_score', { ascending: false });

        if (error) {
          console.error('[DASHBOARD] Error fetching subject fatigue:', error);
          setIsLoadingFatigue(false);
          return;
        }

        console.log('[DASHBOARD] ✅ Fetched', data?.length, 'subject fatigue records');
        setSubjectFatigue(data || []);
        setIsLoadingFatigue(false);
      } catch (err) {
        console.error('[DASHBOARD] Error in fetchSubjectFatigue:', err);
        setIsLoadingFatigue(false);
      }
    };

    fetchSubjectFatigue();

    // Set up real-time subscription
    const channel = supabase
      .channel(`subject-fatigue-${sessionUser.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subject_fatigue',
          filter: `user_id=eq.${sessionUser.id}`,
        },
        (payload) => {
          console.log('[DASHBOARD] Real-time fatigue update received:', payload.eventType);
          fetchSubjectFatigue();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionUser?.id, isSessionLoading]);

  const handleTaskToggle = async (taskId, score = null, max_score = null) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;

    const newCompleted = !task.completed;

    setTasks((prev) => prev.map((item) => (
      item.id === taskId ? { ...item, completed: newCompleted } : item
    )));

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          status: newCompleted ? 'completed' : 'pending',
          completed_at: newCompleted ? new Date().toISOString() : null,
        })
        .eq('id', taskId)
        .eq('student_id', sessionUser?.id);

      if (error) {
        throw error;
      }

      // STEP 2: Insert performance_logs if score and max_score are provided
      if (newCompleted && typeof score === 'number' && typeof max_score === 'number') {
        const uuid = crypto.randomUUID ? crypto.randomUUID() : (window.crypto && window.crypto.randomUUID && window.crypto.randomUUID());
        const accuracy = Math.round((score / max_score) * 100);
        const now = new Date().toISOString();
        await supabase
          .from('performance_logs')
          .insert({
            id: uuid,
            user_id: sessionUser.id,
            topic_id: task.topic_id,
            test_type: 'task_completion',
            score,
            max_score,
            accuracy,
            created_at: now
          });
      }

      if (newCompleted) {
        toast.success(`+${task.xp} XP earned! 🎉`, {
          duration: 2000,
        });
      }
    } catch (err) {
      console.error('[DASHBOARD] Failed to update task status:', err);
      setTasks((prev) => prev.map((item) => (
        item.id === taskId ? { ...item, completed: task.completed } : item
      )));
      toast.error('Could not update task. Please try again.');
    }
  };

  return (
    <div 
      className="h-full"
      style={{
        backgroundColor: isDarkMode ? '#111827' : '#ffffff'
      }}
    >
      {/* Top Header */}
      <div 
        className="border-b px-8 py-5 transition-colors"
        style={{
          backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
          borderColor: isDarkMode ? '#374151' : '#e5e7eb',
          color: isDarkMode ? '#f9fafb' : '#111827'
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 
              className="text-2xl font-semibold"
              style={{ color: isDarkMode ? '#f9fafb' : '#111827' }}
            >
              Good Morning, Alex! Ready to conquer Calculus?
            </h2>
          </div>
          
          {/* Player Status */}
          <div className="flex items-center gap-4">
            {/* Streak */}
            <div 
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                backgroundColor: isDarkMode ? '#78350f' : '#FFF8E1'
              }}
            >
              <Flame className="w-5 h-5 text-orange-500" />
              <span 
                className="font-bold text-sm"
                style={{ color: isDarkMode ? '#fca311' : '#e67e22' }}
              >
                12 Day Streak
              </span>
            </div>

            {/* HP Bar */}
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              <div className="flex flex-col gap-1">
                <div 
                  className="w-24 h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: isDarkMode ? '#4b5563' : '#e5e7eb' }}
                >
                  <div className="h-full bg-red-500 rounded-full" style={{ width: '90%' }} />
                </div>
                <span 
                  className="text-xs"
                  style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
                >
                  HP 90/100
                </span>
              </div>
            </div>

            {/* Notifications */}
            {/* Notifications button removed as requested */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        {/* Hero Card */}
        <motion.div
          className="relative rounded-xl overflow-hidden mb-8 shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #006D77 0%, #475569 100%)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative z-10 p-8 flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-3xl font-bold text-white mb-2">
                Current Mission: Physics Chapter 4
              </h3>
              <p className="text-white/90 text-lg mb-6">
                Due in 3 hours. Reward: 150 XP + 'Newton's Apple' Badge
              </p>
              {/* Start Session button removed as requested */}
            </div>
            <div className="hidden lg:block">
              <BookOpen className="w-48 h-48 text-white/20" />
            </div>
          </div>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Today's Waypoints */}
          <div className="lg:col-span-2">
            <div 
              className="rounded-xl shadow-md p-6 transition-colors"
              style={{
                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff'
              }}
            >
              <h3 
                className="text-xl font-semibold mb-4 flex items-center gap-2"
                style={{ color: isDarkMode ? '#f9fafb' : '#111827' }}
              >
                <Clock className="w-5 h-5 text-[#006D77]" />
                Today's Waypoints
              </h3>
              <div className="space-y-3">
                {isLoadingTasks ? (
                  <div className="text-center py-6" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                    Loading today&apos;s tasks...
                  </div>
                ) : tasks.length > 0 ? (
                  tasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onToggle={() => handleTaskToggle(task.id)}
                      isDarkMode={isDarkMode}
                    />
                  ))
                ) : (
                  <div className="text-center py-6" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                    No tasks scheduled for today.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Gamification Widgets */}
          <div className="space-y-6">
            {/* Subject Fatigue Monitor */}
            <div 
              className="rounded-xl shadow-md p-6 transition-colors"
              style={{
                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff'
              }}
            >
              <h3 
                className="text-xl font-semibold mb-4 flex items-center gap-2"
                style={{ color: isDarkMode ? '#f9fafb' : '#111827' }}
              >
                <Brain className="w-5 h-5 text-purple-500" />
                Subject Fatigue Monitor
              </h3>
              {isLoadingFatigue ? (
                <div className="text-center py-4" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                  Loading fatigue data...
                </div>
              ) : subjectFatigue.length > 0 ? (
                <div className="space-y-3">
                  {subjectFatigue.slice(0, 5).map((subject) => (
                    <SubjectFatigueRow key={subject.id} subject={subject} isDarkMode={isDarkMode} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-4" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                  No fatigue data yet. Complete some tasks to see your subject fatigue levels!
                </div>
              )}
            </div>

            {/* Side Quests */}
            <div 
              className="rounded-xl shadow-md p-6 transition-colors"
              style={{
                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff'
              }}
            >
              <h3 
                className="text-xl font-semibold mb-4 flex items-center gap-2"
                style={{ color: isDarkMode ? '#f9fafb' : '#111827' }}
              >
                <Trophy className="w-5 h-5 text-[#FFB400]" />
                Active Side Quests
              </h3>
              <div className="space-y-4">
                {sideQuests.map((quest) => (
                  <SideQuestCard key={quest.id} quest={quest} isDarkMode={isDarkMode} />
                ))}
              </div>
            </div>

            {/* XP Progress */}
            <div className="rounded-xl shadow-md p-6 text-white" style={{
              background: 'linear-gradient(to right, #006D77, #00a896)'
            }}>
              <h3 className="text-lg font-semibold mb-2">Level Progress</h3>
              <div className="flex items-end justify-between mb-2">
                <span className="text-3xl font-bold">Level {levelInfo.level}</span>
                <span className="text-sm opacity-90">{levelInfo.currentXP} / {levelInfo.nextXP} XP</span>
              </div>
              <Progress value={levelProgress} className="h-3 bg-white/20" />
              <p className="text-sm mt-2 opacity-90">{Math.max(levelInfo.nextXP - levelInfo.currentXP, 0)} XP until Level {levelInfo.level + 1}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskRow({ task, onToggle, isDarkMode }) {
  const cardStyle = getCardStyle(task.cognitive_load_score ?? task.complexity);

  return (
    <motion.div
      className={`flex items-center gap-4 p-4 rounded-lg border hover:shadow-md transition-all ${cardStyle}`}
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <Checkbox
        checked={task.completed}
        onCheckedChange={onToggle}
        className="w-5 h-5"
      />
      
      <div className="flex-1">
        <div 
          className="font-medium"
          style={{
            textDecoration: task.completed ? 'line-through' : 'none',
            color: task.completed ? '#9ca3af' : (isDarkMode ? '#f3f4f6' : '#111827')
          }}
        >
          {task.name}
        </div>
        <div 
          className="text-sm flex items-center gap-1 mt-1"
          style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
        >
          <Clock className="w-3 h-3" />
          Estimated: {task.duration}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="px-3 py-1 rounded-full text-xs font-medium" style={getSubjectColorStyle(task?.subject_name || 'Uncategorized', isDarkMode)}>
          {task?.subject_name || 'Uncategorized'}
        </span>
        <span 
          className="px-3 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: isDarkMode ? '#5B3F00' : '#FFF8E1',
            color: isDarkMode ? '#FCD34D' : '#FFB400'
          }}
        >
          +{task.xp} XP
        </span>
      </div>
    </motion.div>
  );
}

function SideQuestCard({ quest, isDarkMode }) {
  const progress = (quest.current / quest.total) * 100;

  return (
    <div 
      className="rounded-lg p-4"
      style={{
        borderColor: isDarkMode ? '#4b5563' : '#e5e7eb',
        borderWidth: '1px',
        backgroundColor: isDarkMode ? '#374151' : 'transparent'
      }}
    >
      <h4 
        className="font-semibold text-sm mb-1"
        style={{ color: isDarkMode ? '#f3f4f6' : '#111827' }}
      >
        {quest.name}
      </h4>
      <p 
        className="text-xs mb-3"
        style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
      >
        {quest.description}
      </p>
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-xs" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
          <span>{quest.current} / {quest.total}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}

function getSubjectColorStyle(subject, isDarkMode) {
  const colors = isDarkMode ? {
    Math: { backgroundColor: '#1e3a8a', color: '#7dd3fc' },
    Physics: { backgroundColor: '#4c1d95', color: '#d8b4fe' },
    Chemistry: { backgroundColor: '#15803d', color: '#86efac' },
    Biology: { backgroundColor: '#831843', color: '#f472b6' },
  } : {
    Math: { backgroundColor: '#dbeafe', color: '#1e40af' },
    Physics: { backgroundColor: '#e9d5ff', color: '#6b21a8' },
    Chemistry: { backgroundColor: '#dcfce7', color: '#15803d' },
    Biology: { backgroundColor: '#fbcfe8', color: '#9d174d' },
  };
  return colors[subject] || { backgroundColor: isDarkMode ? '#4b5563' : '#f3f4f6', color: isDarkMode ? '#d1d5db' : '#374151' };
}

function getCardStyle(score) {
  const value = Number(score);
  if (value >= 1.5) return 'border-red-500 bg-red-900/10';
  if (value >= 1.2) return 'border-blue-500 bg-blue-900/10';
  return 'border-green-500 bg-green-900/10';
}

function getLevel(totalXP) {
  let remainingXP = Math.max(0, Math.floor(totalXP));
  let level = 1;
  let xpForNext = 1000;

  while (remainingXP >= xpForNext) {
    remainingXP -= xpForNext;
    level += 1;
    xpForNext = Math.floor(xpForNext * 1.2);
  }

  return { level, currentXP: remainingXP, nextXP: xpForNext };
}

function SubjectFatigueRow({ subject, isDarkMode }) {
  const getFatigueLevel = (score) => {
    if (score >= 80) return { label: 'Critical', color: '#ef4444', bgColor: isDarkMode ? '#7f1d1d' : '#fee2e2' };
    if (score >= 60) return { label: 'High', color: '#f97316', bgColor: isDarkMode ? '#7c2d12' : '#ffedd5' };
    if (score >= 40) return { label: 'Moderate', color: '#eab308', bgColor: isDarkMode ? '#713f12' : '#fef9c3' };
    if (score >= 20) return { label: 'Low', color: '#22c55e', bgColor: isDarkMode ? '#14532d' : '#dcfce7' };
    return { label: 'Minimal', color: '#3b82f6', bgColor: isDarkMode ? '#1e3a8a' : '#dbeafe' };
  };

  const fatigueInfo = getFatigueLevel(subject.fatigue_score);
  const lastStudied = subject.last_studied 
    ? new Date(subject.last_studied).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'Never';

  return (
    <div 
      className="rounded-lg p-3 border"
      style={{
        borderColor: isDarkMode ? '#4b5563' : '#e5e7eb',
        backgroundColor: isDarkMode ? '#374151' : '#f9fafb'
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span 
            className="font-semibold text-sm"
            style={{ color: isDarkMode ? '#f3f4f6' : '#111827' }}
          >
            {subject.subject_name}
          </span>
          {subject.fatigue_score >= 60 && (
            <AlertTriangle className="w-4 h-4 text-orange-500" />
          )}
        </div>
        <span 
          className="px-2 py-1 rounded text-xs font-medium"
          style={{
            backgroundColor: fatigueInfo.bgColor,
            color: fatigueInfo.color
          }}
        >
          {fatigueInfo.label}
        </span>
      </div>
      
      <Progress 
        value={subject.fatigue_score} 
        className="h-2 mb-2"
        style={{
          backgroundColor: isDarkMode ? '#1f2937' : '#e5e7eb'
        }}
      />
      
      <div className="flex justify-between items-center text-xs" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
        <span>Score: {subject.fatigue_score}/100</span>
        <span>Last studied: {lastStudied}</span>
      </div>
    </div>
  );
}
