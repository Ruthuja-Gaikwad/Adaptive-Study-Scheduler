import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Activity, BookOpen, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';

const CognitiveTimeline = ({ activities = [] }) => {
  const { isDarkMode } = useDarkMode();
  const [scrollPosition, setScrollPosition] = useState(0);

  const defaultActivities = [
    { time: '10:30 AM', label: 'Deep Work', subject: '(Polity)', icon: BookOpen, type: 'study' },
    { time: '12:15 PM', label: 'Burnout Risk', subject: 'Increased', icon: AlertCircle, type: 'warning' },
    { time: '2:00 PM', label: 'Revision', subject: 'Suggested', icon: Zap, type: 'suggestion' },
    { time: '3:45 PM', label: 'Quiz', subject: 'Completed (82%)', icon: CheckCircle2, type: 'achievement' },
    { time: '5:15 PM', label: 'Focus Break', subject: 'Recommended', icon: Activity, type: 'break' },
  ];

  const activitiesToShow = activities && activities.length > 0 ? activities : defaultActivities;

  const getActivityColor = (type) => {
    switch (type) {
      case 'study':
        return { ring: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/20', text: 'text-blue-400' };
      case 'warning':
        return { ring: 'from-red-500 to-pink-500', bg: 'bg-red-500/20', text: 'text-red-400' };
      case 'suggestion':
        return { ring: 'from-yellow-500 to-orange-500', bg: 'bg-yellow-500/20', text: 'text-yellow-400' };
      case 'achievement':
        return { ring: 'from-green-500 to-emerald-500', bg: 'bg-green-500/20', text: 'text-green-400' };
      case 'break':
        return { ring: 'from-purple-500 to-pink-500', bg: 'bg-purple-500/20', text: 'text-purple-400' };
      default:
        return { ring: 'from-slate-500 to-slate-400', bg: 'bg-slate-500/20', text: 'text-slate-400' };
    }
  };

  const bgGradient = isDarkMode
    ? 'bg-gradient-to-r from-slate-900 via-slate-850 to-slate-950'
    : 'bg-gradient-to-r from-slate-100 via-slate-50 to-white';

  const textColor = isDarkMode ? 'text-slate-100' : 'text-slate-900';
  const secondaryText = isDarkMode ? 'text-slate-400' : 'text-slate-600';

  return (
    <motion.div
      className={`${bgGradient} rounded-2xl border ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} p-6 backdrop-blur-sm`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Activity className="w-6 h-6 text-cyan-500" />
        <h3 className={`text-lg font-bold ${textColor}`}>📡 Live Cognitive Timeline</h3>
      </div>

      {/* Timeline */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-3 min-w-max">
          {activitiesToShow.map((activity, idx) => {
            const colors = getActivityColor(activity.type);
            const Icon = activity.icon || Activity;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="group"
              >
                <div
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all cursor-pointer hover:scale-110 ${
                    isDarkMode
                      ? `bg-slate-800/40 border-slate-700 hover:${colors.bg}`
                      : `bg-white/40 border-slate-200 hover:${colors.bg}`
                  }`}
                  style={{
                    background: isDarkMode
                      ? `rgba(15, 23, 42, 0.4)`
                      : `rgba(255, 255, 255, 0.4)`,
                  }}
                >
                  {/* Icon Circle */}
                  <div className={'relative'}>
                    <motion.div
                      className={`w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center`}
                      whileHover={{ scale: 1.1 }}
                    >
                      <Icon className={`w-5 h-5 ${colors.text}`} />
                    </motion.div>
                    <motion.div
                      className={`absolute inset-0 rounded-full bg-gradient-to-br ${colors.ring}`}
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
                      style={{ opacity: 0.2 }}
                    />
                  </div>

                  {/* Time */}
                  <p className={`text-xs font-bold ${colors.text} text-center w-16`}>{activity.time}</p>

                  {/* Label */}
                  <p className={`text-xs font-semibold ${textColor} text-center`}>{activity.label}</p>

                  {/* Subject */}
                  <p className={`text-[10px] ${secondaryText} text-center w-16`}>{activity.subject}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Info Text */}
      <p className={`text-xs ${secondaryText} mt-4 text-center`}>Scroll to see more activities → Updates live in real-time</p>
    </motion.div>
  );
};

export default CognitiveTimeline;
