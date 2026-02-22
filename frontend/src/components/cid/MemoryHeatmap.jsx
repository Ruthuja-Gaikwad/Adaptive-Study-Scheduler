import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Brain, AlertCircle } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';

const MemoryHeatmap = ({ subjects = [] }) => {
  const { isDarkMode } = useDarkMode();
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Default data if none provided
  const defaultSubjects = [
    { name: 'Economics', topics: [
      { name: 'Inflation', retention: 32, nextRevision: 'Tomorrow' },
      { name: 'Supply-Demand', retention: 78, nextRevision: 'In 5 days' },
      { name: 'GDP', retention: 65, nextRevision: 'In 2 days' },
    ]},
    { name: 'Polity', topics: [
      { name: 'Constitution', retention: 88, nextRevision: 'In 7 days' },
      { name: 'Rights', retention: 42, nextRevision: 'Tomorrow' },
      { name: 'Parliament', retention: 75, nextRevision: 'In 3 days' },
    ]},
    { name: 'Math', topics: [
      { name: 'Calculus', retention: 95, nextRevision: 'In 10 days' },
      { name: 'Algebra', retention: 55, nextRevision: 'Tomorrow' },
      { name: 'Geometry', retention: 72, nextRevision: 'In 4 days' },
    ]},
    { name: 'Physics', topics: [
      { name: 'Mechanics', retention: 68, nextRevision: 'In 2 days' },
      { name: 'Waves', retention: 45, nextRevision: 'Today' },
      { name: 'Electromagnetism', retention: 80, nextRevision: 'In 6 days' },
    ]},
  ];

  const dataToUse = subjects && subjects.length > 0 ? subjects : defaultSubjects;

  const getRetentionColor = (retention) => {
    if (retention > 75) return { ring: 'from-blue-500 to-cyan-500', label: '🔵 Strong', text: 'text-blue-400' };
    if (retention > 40) return { ring: 'from-yellow-500 to-orange-500', label: '🟡 Fading', text: 'text-yellow-400' };
    return { ring: 'from-red-500 to-pink-500', label: '🔴 At Risk', text: 'text-red-400' };
  };

  const bgGradient = isDarkMode
    ? 'bg-gradient-to-br from-slate-900/40 via-slate-850/40 to-slate-950/40'
    : 'bg-gradient-to-br from-white/60 via-slate-50/60 to-slate-100/60';

  const textColor = isDarkMode ? 'text-slate-100' : 'text-slate-900';
  const secondaryText = isDarkMode ? 'text-slate-400' : 'text-slate-600';

  return (
    <motion.div
      className={`${bgGradient} rounded-2xl border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} p-6 backdrop-blur-sm h-full`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-6 h-6 text-indigo-500" />
        <h3 className={`text-lg font-bold ${textColor}`}>Memory Heatmap</h3>
      </div>

      {/* Subject Nodes */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {dataToUse.map((subject, idx) => (
          <motion.div key={subject.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
            {/* Subject Node */}
            <div
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedSubject === subject.name
                  ? isDarkMode ? 'bg-slate-700 border-indigo-500' : 'bg-indigo-50 border-indigo-400'
                  : isDarkMode ? 'bg-slate-800/50 border-slate-700 hover:border-slate-600' : 'bg-white/50 border-slate-200 hover:border-slate-300'
              }`}
              onClick={() => setSelectedSubject(selectedSubject === subject.name ? null : subject.name)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-bold ${textColor}`}>{subject.name}</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'
                }`}>
                  {subject.topics.length} topics
                </span>
              </div>

              {/* Topic Sub-Nodes (Collapsible) */}
              {selectedSubject === subject.name && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 mt-3 pt-3 border-t border-slate-700/30"
                >
                  {subject.topics.map((topic, topicIdx) => {
                    const colors = getRetentionColor(topic.retention);
                    return (
                      <motion.div
                        key={topic.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: topicIdx * 0.05 }}
                        onHoverStart={() => setHoveredNode(topic.name)}
                        onHoverEnd={() => setHoveredNode(null)}
                        className="relative group"
                      >
                        <div
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                            isDarkMode ? 'bg-slate-700/50 hover:bg-slate-600/50' : 'bg-slate-100 hover:bg-slate-200'
                          }`}
                        >
                          {/* Topic Name */}
                          <div className="flex items-center gap-2 flex-1">
                            <motion.div
                              className={`w-2 h-2 rounded-full bg-gradient-to-br ${colors.ring}`}
                              animate={hoveredNode === topic.name ? { scale: [1, 1.5, 1] } : {}}
                              transition={{ duration: 0.5, repeat: hoveredNode === topic.name ? Infinity : 0 }}
                            />
                            <span className={`text-xs font-semibold ${secondaryText}`}>{topic.name}</span>
                          </div>

                          {/* Retention % */}
                          <span className={`text-xs font-bold ${colors.text}`}>{topic.retention}%</span>
                        </div>

                        {/* Tooltip */}
                        {hoveredNode === topic.name && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`absolute bottom-full left-0 mb-2 p-2 rounded-lg text-xs z-20 whitespace-nowrap ${
                              isDarkMode ? 'bg-slate-900 border border-slate-700 text-slate-200' : 'bg-slate-800 border border-slate-700 text-white'
                            }`}
                          >
                            <p>Retention: {topic.retention}%</p>
                            <p>Next Revision: {topic.nextRevision}</p>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Action */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full mt-6 py-2 rounded-lg font-semibold text-sm transition-all ${
          isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-100' : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
        }`}
      >
        📝 Start Targeted Revision
      </motion.button>
    </motion.div>
  );
};

export default MemoryHeatmap;
