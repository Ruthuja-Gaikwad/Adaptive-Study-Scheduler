import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';

const PerformanceCard = ({ accuracy = 85, testCount = 5, lastChange = 8, insight = 'Accuracy remains strong across most subjects.' }) => {
  const { isDarkMode } = useDarkMode();

  const bgGradient = isDarkMode
    ? 'bg-gradient-to-br from-slate-900/40 via-slate-850/40 to-slate-950/40'
    : 'bg-gradient-to-br from-white/60 via-slate-50/60 to-slate-100/60';

  const textColor = isDarkMode ? 'text-slate-100' : 'text-slate-900';
  const secondaryText = isDarkMode ? 'text-slate-400' : 'text-slate-600';
  const accentColor = lastChange >= 0 ? 'text-green-400' : 'text-red-400';

  // Mock chart data
  const mockChartData = [72, 75, 78, 82, 85];

  return (
    <motion.div
      className={`${bgGradient} rounded-xl border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} p-5 backdrop-blur-sm`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-500" />
          <h4 className={`text-sm font-bold ${textColor}`}>📈 Performance Trend</h4>
        </div>
        <div className={`text-xs font-semibold ${secondaryText}`}>{testCount} tests</div>
      </div>

      {/* Accuracy Display */}
      <div className="mb-4">
        <div className="flex items-end justify-between mb-2">
          <span className={`text-2xl font-bold ${textColor}`}>{accuracy}%</span>
          <motion.span
            className={`text-sm font-bold flex items-center gap-1 ${accentColor}`}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {lastChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {lastChange >= 0 ? '+' : ''}{lastChange}%
          </motion.span>
        </div>

        {/* Mini Chart */}
        <div className="flex items-end gap-1 h-12">
          {mockChartData.map((value, idx) => (
            <motion.div
              key={idx}
              className="flex-1 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-sm relative group"
              style={{ height: `${(value / 100) * 100}%` }}
              initial={{ height: 0 }}
              animate={{ height: `${(value / 100) * 100}%` }}
              transition={{ delay: idx * 0.05 + 0.3 }}
            >
              <div className={`absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold rounded px-1 py-0.5 ${
                isDarkMode ? 'bg-slate-800 text-slate-100' : 'bg-slate-700 text-white'
              } opacity-0 group-hover:opacity-100 transition-opacity`}>
                {value}%
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* AI Insight */}
      <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-100 border-slate-200'} border`}>
        <p className={`text-xs ${secondaryText}`}>
          <span className="font-semibold">💡 AI Insight:</span> {insight}
        </p>
      </div>
    </motion.div>
  );
};

export default PerformanceCard;
