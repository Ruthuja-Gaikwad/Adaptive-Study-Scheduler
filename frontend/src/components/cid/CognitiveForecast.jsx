import React from 'react';
import { motion } from 'motion/react';
import { Zap, Moon, TrendingDown } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';

const CognitiveForecast = ({ forecastData = null }) => {
  const { isDarkMode } = useDarkMode();

  const defaultForecast = {
    productivityChange: -12,
    recommendedSleep: 7.5,
    riskLevel: 'moderate',
    recommendations: [
      'Focus on revision of high-retention topics first',
      'Avoid new concepts today - consolidate existing knowledge',
      'Take 2-3 breaks per hour',
      'Aim for 7.5+ hours of sleep tonight'
    ]
  };

  const data = forecastData || defaultForecast;
  const bgGradient = isDarkMode
    ? 'bg-gradient-to-br from-slate-900/40 via-slate-850/40 to-slate-950/40'
    : 'bg-gradient-to-br from-white/60 via-slate-50/60 to-slate-100/60';

  const textColor = isDarkMode ? 'text-slate-100' : 'text-slate-900';
  const secondaryText = isDarkMode ? 'text-slate-400' : 'text-slate-600';

  return (
    <motion.div
      className={`${bgGradient} rounded-2xl border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} p-6 backdrop-blur-sm col-span-full`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Zap className="w-6 h-6 text-amber-500" />
        <h3 className={`text-lg font-bold ${textColor}`}>🔮 Today's Cognitive Forecast</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Productivity Forecast */}
        <motion.div
          className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-white/30 border-slate-200'}`}
          whileHover={{ scale: 1.02 }}
        >
          <p className={`text-xs font-semibold ${secondaryText} mb-2`}>Tomorrow's Productivity</p>
          <motion.p
            className={`text-3xl font-bold ${data.productivityChange < 0 ? 'text-red-400' : 'text-green-400'}`}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            {data.productivityChange < 0 ? '📉' : '📈'} {Math.abs(data.productivityChange)}%
          </motion.p>
          <p className={`text-xs ${secondaryText} mt-2`}>
            {data.productivityChange < 0
              ? 'Expected productivity decrease due to fatigue patterns'
              : 'Expected productivity increase'
            }
          </p>
        </motion.div>

        {/* Recommended Sleep */}
        <motion.div
          className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-white/30 border-slate-200'}`}
          whileHover={{ scale: 1.02 }}
          transition={{ delay: 0.1 }}
        >
          <p className={`text-xs font-semibold ${secondaryText} mb-2 flex items-center gap-2`}>
            <Moon className="w-4 h-4" /> Recommended Sleep
          </p>
          <motion.p
            className={`text-3xl font-bold text-purple-400`}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            {data.recommendedSleep}h
          </motion.p>
          <p className={`text-xs ${secondaryText} mt-2`}>
            Critical for cognitive recovery
          </p>
        </motion.div>

        {/* Risk Assessment */}
        <motion.div
          className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-white/30 border-slate-200'}`}
          whileHover={{ scale: 1.02 }}
          transition={{ delay: 0.2 }}
        >
          <p className={`text-xs font-semibold ${secondaryText} mb-2`}>Risk Level</p>
          <motion.p
            className={`text-3xl font-bold ${
              data.riskLevel === 'high' ? 'text-red-400' : data.riskLevel === 'moderate' ? 'text-yellow-400' : 'text-green-400'
            }`}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            {data.riskLevel === 'high' ? '🔴' : data.riskLevel === 'moderate' ? '🟡' : '🟢'}
          </motion.p>
          <p className={`text-xs ${secondaryText} mt-2`}>
            {data.riskLevel.charAt(0).toUpperCase() + data.riskLevel.slice(1)} burnout probability
          </p>
        </motion.div>
      </div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-100 border-slate-200'}`}
      >
        <p className={`text-sm font-bold ${textColor} mb-3`}>💡 AI Recommendations:</p>
        <ul className="space-y-2">
          {data.recommendations.map((rec, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + idx * 0.05 }}
              className={`text-xs flex items-start gap-2 ${secondaryText}`}
            >
              <span className="text-cyan-400 font-bold mt-0.5">✓</span>
              {rec}
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
};

export default CognitiveForecast;
