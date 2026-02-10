import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { Sparkles } from 'lucide-react';

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white via-[#F0FDFA] to-[#E0F2FE] dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors">
      <div className="mx-auto w-full max-w-none px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-6rem)]">
          {/* Left Side - Text Content */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <motion.div
                className="inline-flex items-center gap-2 bg-[#006D77] dark:bg-[#06D6A0] text-white dark:text-gray-900 px-4 py-2 rounded-full text-sm font-medium mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Sparkles className="w-4 h-4" />
                AI-Powered Study Companion
              </motion.div>
              
              <h1 className="text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6">
                Stop Planning.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#006D77] to-[#06D6A0] dark:from-[#06D6A0] dark:to-[#FFB400]">
                  Start Studying.
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Transform your study routine with adaptive scheduling, gamified progress tracking, and intelligent rerouting. Level up your learning journey today.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                onClick={() => navigate('/signup')}
                className="px-8 py-4 bg-[#006D77] dark:bg-[#06D6A0] text-white dark:text-gray-900 font-semibold rounded-lg text-lg shadow-lg hover:shadow-xl transition-all"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Start My Quest
              </motion.button>
              
              <motion.button
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-white dark:bg-gray-800 text-[#006D77] dark:text-[#06D6A0] font-semibold rounded-lg text-lg border-2 border-[#006D77] dark:border-[#06D6A0] hover:bg-[#006D77] hover:text-white dark:hover:bg-[#06D6A0] dark:hover:text-gray-900 transition-all"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Resume Game
              </motion.button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div>
                <div className="text-3xl font-bold text-[#006D77] dark:text-[#06D6A0]">10K+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Students</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#006D77] dark:text-[#06D6A0]">95%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#006D77] dark:text-[#06D6A0]">24/7</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">AI Support</div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Animation */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative w-full h-[600px] flex items-center justify-center">
              {/* Animated Calendar Shatter Effect */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 1 }}
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}
              >
                {/* Static Calendar */}
                <div className="grid grid-cols-7 gap-2 w-80 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl transition-colors">
                  <div className="col-span-7 text-center font-bold text-gray-900 dark:text-white mb-4">
                    February 2026
                  </div>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="text-center text-sm text-gray-500 dark:text-gray-400 font-semibold">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: 28 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-sm text-gray-600 dark:text-gray-300"
                      animate={{
                        opacity: [1, 0.5, 1],
                        scale: [1, 0.9, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.05,
                      }}
                    >
                      {i + 1}
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Dynamic Path */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse', delay: 2 }}
              >
                <div className="w-80 bg-gradient-to-br from-[#006D77] to-[#06D6A0] p-6 rounded-2xl shadow-2xl">
                  <div className="text-white font-bold mb-6 text-center text-xl">
                    Your Adaptive Path
                  </div>
                  <div className="space-y-4">
                    {[
                      { time: '9:00 AM', task: 'Math Chapter 4', color: 'bg-blue-400' },
                      { time: '11:30 AM', task: 'Physics Lab', color: 'bg-purple-400' },
                      { time: '2:00 PM', task: 'Chemistry Quiz', color: 'bg-green-400' },
                      { time: '4:30 PM', task: 'Biology Review', color: 'bg-pink-400' },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-lg p-3"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 2 + i * 0.2 }}
                      >
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <div className="flex-1">
                          <div className="text-white/80 text-xs">{item.time}</div>
                          <div className="text-white font-medium text-sm">{item.task}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
