import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Home, Compass } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#006D77] via-[#005a63] to-[#004a52] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden flex items-center justify-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6">
        <motion.div
          className="mb-8"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div className="text-8xl mb-4 inline-block">
            🗺️
          </div>
          <h1 className="text-9xl font-bold text-white mb-4 drop-shadow-lg">404</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-4xl font-bold text-white mb-3">
            You've Wandered Off the Path
          </h2>
          <p className="text-xl text-white/90 max-w-md mx-auto">
            Looks like this page is not in your learning schedule. Let's get you back on track!
          </p>
        </motion.div>

        {/* Message Card */}
        <motion.div
          className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700 rounded-xl p-8 mb-8 max-w-md mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-4 justify-center">
            <Compass className="w-6 h-6 text-[#FFB400]" />
            <h3 className="text-lg font-semibold text-white">
              Navigation Error
            </h3>
          </div>
          <p className="text-white/80 text-sm mb-4">
            The page you're looking for doesn't exist or has been moved to a different location in your learning path.
          </p>
          <div className="text-[#06D6A0] font-mono text-xs">
            Page: {window.location.pathname}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <motion.button
            onClick={() => navigate('/')}
            className="px-8 py-4 bg-white text-[#006D77] font-semibold rounded-lg shadow-lg hover:bg-gray-100 dark:bg-gray-200 dark:hover:bg-gray-300 transition-all flex items-center justify-center gap-2"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Home className="w-5 h-5" />
            Return Home
          </motion.button>
          
          <motion.button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-4 bg-[#FFB400] text-gray-900 font-semibold rounded-lg shadow-lg hover:bg-[#FFC533] transition-all flex items-center justify-center gap-2"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Compass className="w-5 h-5" />
            Go to Dashboard
          </motion.button>

          <motion.button
            onClick={() => navigate(-1)}
            className="px-8 py-4 bg-white/20 dark:bg-gray-700/50 text-white font-semibold rounded-lg border border-white/30 dark:border-gray-600 hover:bg-white/30 dark:hover:bg-gray-700 transition-all backdrop-blur-sm flex items-center justify-center gap-2"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </motion.button>
        </motion.div>

        {/* Easter Egg */}
        <motion.p
          className="text-white/60 text-sm mt-12"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          💡 Tip: Make sure you're logged in to access the dashboard
        </motion.p>
      </div>
    </div>
  );
}
