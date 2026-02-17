import { useState } from 'react';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import { motion } from 'motion/react';
import { Flame, Heart, Bell, BookOpen, Clock, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { useDarkMode } from '../contexts/DarkModeContext';

export function Dashboard() {
  const { isDarkMode } = useDarkMode();
  const [tasks, setTasks] = useState([
    { id: '1', name: 'Read Pages 40-50', duration: '45 mins', subject: 'Math', xp: 50, completed: false },
    { id: '2', name: 'Complete Problem Set 3', duration: '1 hour', subject: 'Physics', xp: 75, completed: false },
    { id: '3', name: 'Watch Lecture 5', duration: '30 mins', subject: 'Chemistry', xp: 40, completed: false },
    { id: '4', name: 'Review Flashcards', duration: '20 mins', subject: 'Biology', xp: 30, completed: true },
  ]);

  const [sideQuests] = useState([
    { id: '1', name: 'The Weekend Warrior', description: 'Complete 5 hrs of study on Sat/Sun', current: 3, total: 5 },
    { id: '2', name: 'Flashcard Frenzy', description: 'Review 50 cards', current: 10, total: 50 },
  ]);

  const handleTaskToggle = (taskId) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const newCompleted = !task.completed;
        if (newCompleted) {
          // Confetti effect on completion
          toast.success(`+${task.xp} XP earned! 🎉`, {
            duration: 2000,
          });
        }
        return { ...task, completed: newCompleted };
      }
      return task;
    }));
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
            <button 
              className="relative p-2 rounded-lg transition-colors"
              style={{
                backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
              }}
            >
              <Bell 
                className="w-5 h-5"
                style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
              />
              <div className="absolute top-1 right-1 w-2 h-2 bg-[#EF476F] rounded-full" />
            </button>
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
              <motion.button
                className="px-8 py-4 font-semibold rounded-lg shadow-lg"
                style={{
                  backgroundColor: isDarkMode ? '#fbbf24' : '#FFB400',
                  color: isDarkMode ? '#1f2937' : '#111827'
                }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Start Session
              </motion.button>
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
                {tasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onToggle={() => handleTaskToggle(task.id)}
                    isDarkMode={isDarkMode}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Gamification Widgets */}
          <div className="space-y-6">
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
                <span className="text-3xl font-bold">Level 12</span>
                <span className="text-sm opacity-90">750 / 1000 XP</span>
              </div>
              <Progress value={75} className="h-3 bg-white/20" />
              <p className="text-sm mt-2 opacity-90">250 XP until Level 13</p>
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
        <span className="px-3 py-1 rounded-full text-xs font-medium" style={getSubjectColorStyle(task.subject, isDarkMode)}>
          {task.subject}
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
