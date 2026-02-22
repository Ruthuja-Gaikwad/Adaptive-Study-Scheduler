import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Activity, Zap, Shield } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';

const BurnoutRadar = ({ burnoutScore = 30, sleepDeficit = -1.5, consecutiveDays = 5, riskLevel = 'low' }) => {
  const { isDarkMode } = useDarkMode();
  const [sparkAnimation, setSparkAnimation] = useState(false);

  useEffect(() => {
    if (riskLevel === 'high') {
      setSparkAnimation(true);
    }
  }, [riskLevel]);

  const getRiskColor = (level) => {
    switch (level) {
      case 'high':
        return { ring: 'ring-red-500', bg: 'from-red-500/20 to-pink-500/20', badge: 'bg-red-500/20 text-red-300', border: 'border-red-500/30' };
      case 'moderate':
        return { ring: 'ring-yellow-500', bg: 'from-yellow-500/20 to-orange-500/20', badge: 'bg-yellow-500/20 text-yellow-300', border: 'border-yellow-500/30' };
      default:
        return { ring: 'ring-green-500', bg: 'from-green-500/20 to-emerald-500/20', badge: 'bg-green-500/20 text-green-300', border: 'border-green-500/30' };
    }
  };

  const riskColors = getRiskColor(riskLevel);
  const bgGradient = isDarkMode
    ? `bg-gradient-to-br from-slate-900/40 via-slate-850/40 to-slate-950/40 ${riskColors.bg}`
    : `bg-gradient-to-br from-white/60 via-slate-50/60 to-slate-100/60 ${riskColors.bg}`;

  const textColor = isDarkMode ? 'text-slate-100' : 'text-slate-900';
  const secondaryText = isDarkMode ? 'text-slate-400' : 'text-slate-600';

  return (
    <motion.div
      className={`${bgGradient} rounded-2xl border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} ${riskColors.border} p-6 backdrop-blur-sm h-full`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className={`w-6 h-6 ${riskLevel === 'high' ? 'text-red-500' : riskLevel === 'moderate' ? 'text-yellow-500' : 'text-green-500'}`} />
          <h3 className={`text-lg font-bold ${textColor}`}>🛡 Burnout Radar</h3>
        </div>
        <motion.div
          className={`px-3 py-1 rounded-full text-xs font-bold ${riskColors.badge} border ${isDarkMode ? 'border-slate-700' : 'border-slate-300'}`}
          animate={riskLevel === 'high' ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 1, repeat: riskLevel === 'high' ? Infinity : 0 }}
        >
          {riskLevel.toUpperCase()}
        </motion.div>
      </div>

      {/* Burnout Score Gauge */}
      <div className="mb-6">
        <div className="flex items-end justify-between mb-2">
          <span className={`text-sm font-semibold ${secondaryText}`}>Burnout Level</span>
          <span className={`text-2xl font-bold ${riskLevel === 'high' ? 'text-red-400' : riskLevel === 'moderate' ? 'text-yellow-400' : 'text-green-400'}`}>
            {burnoutScore}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-300/50'} overflow-hidden`}>
          <motion.div
            className={`h-full ${
              riskLevel === 'high' ? 'bg-gradient-to-r from-red-500 to-pink-500' :
              riskLevel === 'moderate' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
              'bg-gradient-to-r from-green-500 to-emerald-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${burnoutScore}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Sleep Deficit */}
        <motion.div
          className={`${isDarkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-white/30 border-slate-200'} border rounded-lg p-3`}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-purple-500" />
            <span className={`text-xs font-semibold ${secondaryText}`}>Sleep Deficit</span>
          </div>
          <p className={`text-lg font-bold ${sleepDeficit < -1 ? 'text-red-400' : sleepDeficit < 0 ? 'text-yellow-400' : 'text-green-400'}`}>
            {sleepDeficit > 0 ? '+' : ''}{sleepDeficit.toFixed(1)}h
          </p>
        </motion.div>

        {/* Consecutive Study Days */}
        <motion.div
          className={`${isDarkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-white/30 border-slate-200'} border rounded-lg p-3`}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-blue-500" />
            <span className={`text-xs font-semibold ${secondaryText}`}>Study Days</span>
          </div>
          <p className={`text-lg font-bold ${consecutiveDays > 6 ? 'text-red-400' : consecutiveDays > 4 ? 'text-yellow-400' : 'text-green-400'}`}>
            {consecutiveDays} days
          </p>
        </motion.div>
      </div>

      {/* Recovery Recommendation */}
      {riskLevel === 'high' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${isDarkMode ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-300/30'} border rounded-lg p-3 mb-4`}
        >
          <div className="flex gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className={`text-sm font-semibold ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>Recovery Recommended</p>
              <p className={`text-xs ${isDarkMode ? 'text-red-400/70' : 'text-red-700/70'} mt-1`}>
                Consider lighter study load today. Get adequate sleep and take breaks.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Action Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full py-2 rounded-lg font-semibold text-sm transition-all ${
          riskLevel === 'high'
            ? isDarkMode ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300' : 'bg-red-100 hover:bg-red-200 text-red-700'
            : isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-100' : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
        }`}
      >
        {riskLevel === 'high' ? '🔴 Activate Recovery Mode' : '🛡 Maintain Stability'}
      </motion.button>
    </motion.div>
  );
};

export default BurnoutRadar;
