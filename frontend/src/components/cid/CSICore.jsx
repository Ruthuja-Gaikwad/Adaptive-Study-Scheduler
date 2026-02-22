import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';

const CSICore = ({ csiScore = 82, focusScore = 78, retentionAvg = 84, burnoutInverse = 70, performanceTrend = 90 }) => {
  const { isDarkMode } = useDarkMode();
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (score) => {
    if (score >= 80) return { ring: 'ring-blue-500', text: 'text-blue-400', bg: 'from-blue-600 to-cyan-500' };
    if (score >= 60) return { ring: 'ring-yellow-500', text: 'text-yellow-400', bg: 'from-yellow-600 to-orange-500' };
    return { ring: 'ring-red-500', text: 'text-red-400', bg: 'from-red-600 to-pink-500' };
  };

  const statusColor = getStatusColor(csiScore);

  const metrics = [
    { label: 'Focus Score', value: focusScore, trend: 'up', change: 5 },
    { label: 'Retention Avg', value: retentionAvg, trend: 'stable', change: 0 },
    { label: 'Burnout Inverse', value: burnoutInverse, trend: 'down', change: -3 },
    { label: 'Performance Trend', value: performanceTrend, trend: 'up', change: 8 },
  ];

  const bgGradient = isDarkMode
    ? 'bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950'
    : 'bg-gradient-to-br from-white via-slate-50 to-slate-100';

  const cardBg = isDarkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-white/60 border-slate-200';
  const textColor = isDarkMode ? 'text-slate-100' : 'text-slate-900';
  const secondaryText = isDarkMode ? 'text-slate-400' : 'text-slate-600';

  return (
    <motion.div
      className={`${bgGradient} rounded-2xl border ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} p-8 backdrop-blur-sm`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex flex-col items-center">
        {/* Main CSI Gauge */}
        <motion.div
          className="relative w-64 h-64 mb-6"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {/* SVG Rings */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
            {/* Background Ring */}
            <circle cx="100" cy="100" r="80" fill="none" stroke={isDarkMode ? '#475569' : '#e2e8f0'} strokeWidth="3" opacity="0.3" />

            {/* Main Progress Ring */}
            <defs>
              <linearGradient id="csiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={csiScore >= 80 ? '#3b82f6' : csiScore >= 60 ? '#eab308' : '#ef4444'} />
                <stop offset="100%" stopColor={csiScore >= 80 ? '#06b6d4' : csiScore >= 60 ? '#f97316' : '#ec4899'} />
              </linearGradient>
            </defs>

            <motion.circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="url(#csiGradient)"
              strokeWidth="4"
              strokeDasharray="502.65"
              initial={{ strokeDashoffset: 502.65 }}
              animate={{ strokeDashoffset: 502.65 - (csiScore / 100) * 502.65 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              strokeLinecap="round"
              style={{ transformOrigin: '100px 100px', transform: 'rotate(-90deg)' }}
            />

            {/* Decorative Inner Ring */}
            <circle
              cx="100"
              cy="100"
              r="65"
              fill="none"
              stroke={isDarkMode ? '#334155' : '#cbd5f0'}
              strokeWidth="1"
              opacity="0.2"
            />
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className={`text-6xl font-bold ${statusColor.text}`}>{csiScore}</p>
              <p className={`text-center text-sm font-semibold tracking-widest mt-2 ${secondaryText}`}>CSI</p>
            </motion.div>
          </div>

          {/* Glow Effect */}
          <motion.div
            className={`absolute inset-0 rounded-full ring-4 ${statusColor.ring}`}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>

        {/* Status Label */}
        <motion.div
          className={`text-center mb-6`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className={`text-2xl font-bold ${textColor}`}>
            {csiScore >= 80 ? '✓ Stable & Optimal' : csiScore >= 60 ? '⚠ Monitor Closely' : '🔴 Burnout Risk'}
          </h2>
          <p className={`${secondaryText} text-sm mt-2`}>
            {csiScore >= 80 ? 'Your cognitive load is well-balanced. Perfect time to tackle challenging topics.' : 
             csiScore >= 60 ? 'You\'re managing well, but watch for signs of fatigue.' : 
             'You need recovery time. Consider a break or lighter study load.'}
          </p>
        </motion.div>

        {/* Expand Button */}
        <motion.button
          onClick={() => setExpanded(!expanded)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
            isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-slate-100 border-slate-300 hover:bg-slate-200'
          } ${textColor} text-sm font-semibold`}
        >
          {expanded ? 'Hide' : 'Show'} Breakdown
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </motion.button>

        {/* Expanded Metrics Table */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full mt-6"
            >
              <div className={`rounded-xl border ${cardBg} overflow-hidden`}>
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-100/50'}`}>
                      <th className={`px-4 py-3 text-left text-sm font-semibold ${secondaryText}`}>Metric</th>
                      <th className={`px-4 py-3 text-left text-sm font-semibold ${secondaryText}`}>Value</th>
                      <th className={`px-4 py-3 text-left text-sm font-semibold ${secondaryText}`}>Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map((metric, idx) => (
                      <motion.tr
                        key={metric.label}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`border-b ${isDarkMode ? 'border-slate-700 hover:bg-slate-800/30' : 'border-slate-100 hover:bg-slate-50'} transition-colors`}
                      >
                        <td className={`px-4 py-3 text-sm font-medium ${textColor}`}>{metric.label}</td>
                        <td className={`px-4 py-3 text-sm font-bold ${statusColor.text}`}>{metric.value}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {metric.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                            {metric.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                            <span className={`text-sm font-semibold ${metric.trend === 'up' ? 'text-green-500' : metric.trend === 'down' ? 'text-red-500' : secondaryText}`}>
                              {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'} {Math.abs(metric.change)}
                            </span>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default CSICore;
