import React from 'react';
import { motion } from 'motion/react';
import { BarChart3, Focus } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';

const FocusCard = ({ avgDeepWork = 45, taskSwitchRate = 12, dailyFocusScore = 78 }) => {
  const { isDarkMode } = useDarkMode();

  const bgGradient = isDarkMode
    ? 'bg-gradient-to-br from-slate-900/40 via-slate-850/40 to-slate-950/40'
    : 'bg-gradient-to-br from-white/60 via-slate-50/60 to-slate-100/60';

  const textColor = isDarkMode ? 'text-slate-100' : 'text-slate-900';
  const secondaryText = isDarkMode ? 'text-slate-400' : 'text-slate-600';

  const focusQuality = taskSwitchRate < 10 ? 'Excellent' : taskSwitchRate < 20 ? 'Good' : 'Needs Work';
  const focusColor = taskSwitchRate < 10 ? 'text-green-400' : taskSwitchRate < 20 ? 'text-yellow-400' : 'text-red-400';

  return (
    <motion.div
      className={`${bgGradient} rounded-xl border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} p-5 backdrop-blur-sm`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Focus className="w-5 h-5 text-cyan-500" />
        <h4 className={`text-sm font-bold ${textColor}`}>🎯 Focus Stability</h4>
      </div>

      {/* Metrics Grid */}
      <div className="space-y-3">
        {/* Deep Work Duration */}
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold ${secondaryText}`}>Avg Deep Work</span>
          <motion.span
            className={`text-lg font-bold ${textColor}`}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            {avgDeepWork} min
          </motion.span>
        </div>

        {/* Task Switch Rate */}
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold ${secondaryText}`}>Task Switches</span>
          <motion.span
            className={`text-lg font-bold ${textColor}`}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            {taskSwitchRate}/hr
          </motion.span>
        </div>

        {/* Daily Focus Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-semibold ${secondaryText}`}>Focus Score</span>
            <span className={`text-lg font-bold ${textColor}`}>{dailyFocusScore}</span>
          </div>
          <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-300/50'} overflow-hidden`}>
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${dailyFocusScore}%` }}
              transition={{ delay: 0.4, duration: 0.8 }}
            />
          </div>
        </div>

        {/* Quality Badge */}
        <motion.div
          className={`mt-3 p-2 rounded-lg text-center ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-100'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className={`text-xs font-bold ${focusColor}`}>Focus Quality: {focusQuality}</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default FocusCard;
