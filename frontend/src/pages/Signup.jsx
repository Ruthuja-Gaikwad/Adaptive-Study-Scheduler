import { motion } from 'motion/react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Mail, Lock, User, ArrowLeft } from 'lucide-react';

export function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Navigate to onboarding
    navigate('/onboarding');
  };

  const handleGoogleSignup = () => {
    // Navigate to onboarding (in real app, this would use Google OAuth)
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-[#006D77] via-[#005a63] to-[#004a52] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }} />
      </div>

      {/* Back Button */}
      <motion.button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 p-3 bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 dark:hover:bg-gray-700/50 transition-colors z-20"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowLeft className="w-5 h-5" />
      </motion.button>

      {/* Content */}
      <div className="relative z-10 w-full px-6 py-12 flex items-center justify-center min-h-screen">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 backdrop-blur-sm transition-colors">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                className="inline-block text-6xl mb-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ⚔️
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Begin Your Quest
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Create your account and start leveling up
              </p>
            </div>

            {/* Google Signup */}
            <motion.button
              onClick={handleGoogleSignup}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all mb-6"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign up with Google
            </motion.button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Or sign up with email
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#006D77] dark:focus:ring-[#06D6A0] focus:border-transparent transition-all"
                    placeholder="Alex Scholar"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#006D77] dark:focus:ring-[#06D6A0] focus:border-transparent transition-all"
                    placeholder="alex@university.edu"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#006D77] dark:focus:ring-[#06D6A0] focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Must be at least 8 characters long
                </p>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  className="w-4 h-4 mt-1 text-[#006D77] dark:text-[#06D6A0] border-gray-300 dark:border-gray-600 rounded focus:ring-[#006D77] dark:focus:ring-[#06D6A0]"
                  required
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  I agree to the{' '}
                  <button type="button" className="text-[#006D77] dark:text-[#06D6A0] hover:underline">
                    Terms of Service
                  </button>
                  {' '}and{' '}
                  <button type="button" className="text-[#006D77] dark:text-[#06D6A0] hover:underline">
                    Privacy Policy
                  </button>
                </span>
              </div>

              <motion.button
                type="submit"
                className="w-full px-6 py-3 bg-[#006D77] dark:bg-[#06D6A0] text-white dark:text-gray-900 font-semibold rounded-lg shadow-lg hover:bg-[#005a63] dark:hover:bg-[#05c295] transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Start My Quest
              </motion.button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
              <button
                onClick={() => navigate('/login')}
                className="text-[#006D77] dark:text-[#06D6A0] font-semibold hover:underline"
              >
                Resume Game
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
