import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sun, Moon, Flame, Zap } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useCognitiveCheckin } from '../../contexts/CognitiveCheckinContext';
import { supabase } from '../../lib/supabaseClient';

const TopBar = ({ userLevel = 12, userXP = 7234, maxXP = 10000, streak = 15 }) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [userName, setUserName] = useState('Learner');
  const { mode } = useCognitiveCheckin();
  const xpPercentage = (userXP / maxXP) * 100;

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.full_name) {
          setUserName(user.user_metadata.full_name.split(' ')[0]);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUserName();
  }, []);

  const csiColors = {
    Peak: 'from-green-500 to-emerald-400',
    Stable: 'from-blue-500 to-cyan-400',
    Fatigue: 'from-yellow-500 to-orange-400',
    Recovery: 'from-red-500 to-pink-400',
  };

  const modeBadge = {
    Peak: 'bg-green-100 text-green-700',
    Stable: 'bg-blue-100 text-blue-700',
    Fatigue: 'bg-yellow-100 text-yellow-700',
    Recovery: 'bg-red-100 text-red-700',
  };

  const themeStyles = isDarkMode
    ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950'
    : 'bg-gradient-to-b from-slate-100 via-slate-50 to-white';

  const textColor = isDarkMode ? 'text-slate-100' : 'text-slate-900';
  const secondaryColor = isDarkMode ? 'text-slate-400' : 'text-slate-600';

  return (
    <div className={`${themeStyles} border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} sticky top-0 z-50`}>
      <div className="px-8 py-4">
        <div className="flex items-center justify-between gap-8">
          {/* Left: Greeting Section */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <p className={`text-sm font-semibold ${secondaryColor} tracking-wide`}>NEURAL DASHBOARD</p>
              <div className="flex items-center gap-3 mt-1">
                <h1 className={`text-2xl font-bold ${textColor}`}>
                  👋 Welcome back, <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">{userName}</span>
                </h1>
                {mode && (
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${modeBadge[mode] || 'bg-slate-200 text-slate-700'}`}>
                    {mode}
                  </span>
                )}
              </div>
            </motion.div>
          </div>

          {/* Middle: Level + XP */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className={`flex flex-col items-center ${isDarkMode ? 'bg-slate-800/50' : 'bg-white/50'} backdrop-blur-sm rounded-lg px-6 py-3 border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className={`text-sm font-semibold ${textColor}`}>LVL {userLevel}</span>
            </div>
            <div className="w-48 h-2 mt-2 rounded-full bg-gradient-to-r from-indigo-500/30 to-purple-500/30 overflow-hidden backdrop-blur-sm">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${xpPercentage}%` }}
                transition={{ delay: 0.3, duration: 1 }}
              />
            </div>
            <p className={`text-xs mt-1 ${secondaryColor}`}>{userXP.toLocaleString()} / {maxXP.toLocaleString()} XP</p>
          </motion.div>

          {/* Streak & CSI Mini */}
          <div className="flex items-center gap-4">
            {/* Streak */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
              className={`flex flex-col items-center gap-1 ${isDarkMode ? 'bg-slate-800/50' : 'bg-white/50'} backdrop-blur-sm rounded-lg px-4 py-2 border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}
            >
              <Flame className="w-4 h-4 text-orange-500" />
              <span className={`text-sm font-bold ${textColor}`}>{streak}</span>
              <span className={`text-xs ${secondaryColor}`}>streak</span>
            </motion.div>

            {/* CSI Mini Indicator */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <div
                className={`w-12 h-12 rounded-full bg-gradient-to-br ${csiColors[mode] || csiColors.Stable} flex items-center justify-center`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">🧠</span>
                </div>
              </div>
              {mode === 'Stable' && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-blue-500"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              {mode === 'Fatigue' && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-yellow-500"
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
              {mode === 'Recovery' && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-red-500"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.div>

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className={`rounded-lg p-2 transition-colors ${
                isDarkMode
                  ? 'bg-slate-800 hover:bg-slate-700 text-yellow-400'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
              }`}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
