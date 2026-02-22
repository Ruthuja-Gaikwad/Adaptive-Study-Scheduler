import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Clock, CheckCircle, X } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';

const InterventionPanel = ({ interventions = [] }) => {
  const { isDarkMode } = useDarkMode();
  const [dismissedInterventions, setDismissedInterventions] = useState(new Set());

  // Default interventions if none provided
  const defaultInterventions = [
    {
      id: 1,
      type: 'memory-risk',
      subject: 'Modern History',
      message: 'Memory Risk Detected',
      description: 'Your retention for Modern History topics is dropping. Let\'s do a quick recall session.',
      severity: 'high'
    },
    {
      id: 2,
      type: 'focus-alert',
      subject: 'Mathematics',
      message: 'Attention Drop',
      description: 'We noticed your focus score dropped 15% in the last hour. Time for a break?',
      severity: 'medium'
    }
  ];

  const interventionsToShow = interventions && interventions.length > 0 ? interventions : defaultInterventions;
  const visibleInterventions = interventionsToShow.filter(i => !dismissedInterventions.has(i.id));

  const dismissIntervention = (id) => {
    const newDismissed = new Set(dismissedInterventions);
    newDismissed.add(id);
    setDismissedInterventions(newDismissed);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return { bg: 'from-red-500/20 to-pink-500/20', border: 'border-red-400/50', icon: '🔴' };
      case 'medium':
        return { bg: 'from-yellow-500/20 to-orange-500/20', border: 'border-yellow-400/50', icon: '🟡' };
      default:
        return { bg: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-400/50', icon: '🔵' };
    }
  };

  const bgGradient = isDarkMode
    ? 'bg-gradient-to-br from-slate-900/40 via-slate-850/40 to-slate-950/40'
    : 'bg-gradient-to-br from-white/60 via-slate-50/60 to-slate-100/60';

  const textColor = isDarkMode ? 'text-slate-100' : 'text-slate-900';
  const secondaryText = isDarkMode ? 'text-slate-400' : 'text-slate-600';

  if (visibleInterventions.length === 0) {
    return null;
  }

  return (
    <motion.div
      className={`${bgGradient} rounded-2xl border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} p-6 backdrop-blur-sm`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="w-6 h-6 text-orange-500" />
        <h3 className={`text-lg font-bold ${textColor}`}>🔔 Intervention Alerts</h3>
      </div>

      {/* Interventions */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {visibleInterventions.map((intervention, idx) => {
            const colors = getSeverityColor(intervention.severity);
            return (
              <motion.div
                key={intervention.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.05 }}
                className={`bg-gradient-to-r ${colors.bg} border ${colors.border} rounded-lg p-4 overflow-hidden relative`}
              >
                {/* Animated background pulse */}
                {intervention.severity === 'high' && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ pointerEvents: 'none' }}
                  />
                )}

                <div className="relative flex items-start justify-between gap-3">
                  {/* Content */}
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${textColor} flex items-center gap-2`}>
                      <span>{colors.icon}</span>
                      {intervention.message}: <span className={`${intervention.severity === 'high' ? 'text-red-400' : 'text-yellow-400'}`}>{intervention.subject}</span>
                    </p>
                    <p className={`text-xs ${secondaryText} mt-1`}>{intervention.description}</p>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`text-xs font-semibold px-3 py-1 rounded-lg transition-colors ${
                          intervention.severity === 'high'
                            ? isDarkMode ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300' : 'bg-red-100 hover:bg-red-200 text-red-700'
                            : isDarkMode ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300' : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
                        }`}
                      >
                        ⚡ {intervention.type === 'memory-risk' ? 'Start 5-min Recall' : 'Take Break'}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`text-xs font-semibold px-3 py-1 rounded-lg transition-colors ${
                          isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                        }`}
                      >
                        📅 Schedule
                      </motion.button>
                    </div>
                  </div>

                  {/* Close Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => dismissIntervention(intervention.id)}
                    className={`flex-shrink-0 p-1 rounded-full transition-colors ${
                      isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-200'
                    }`}
                  >
                    <X className="w-4 h-4 text-slate-500" />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default InterventionPanel;
