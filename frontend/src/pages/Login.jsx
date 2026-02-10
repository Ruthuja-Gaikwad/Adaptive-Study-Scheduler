import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Mail, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const resolveSession = async () => {
      try {
        const { data } = await Promise.race([
          supabase.auth.getSession(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Session check timed out')), 6000)
          ),
        ]);

        if (!isMounted) return;
        const sessionUser = data?.session?.user;

        if (!sessionUser) {
          setCheckingSession(false);
          return;
        }

        const { data: profileData, error } = await Promise.race([
          supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', sessionUser.id)
            .single(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Profile check timed out')), 6000)
          ),
        ]);

        if (!isMounted) return;

        if (error || !profileData?.onboarding_completed) {
          navigate('/onboarding', { replace: true });
          return;
        }

        navigate('/dashboard', { replace: true });
      } catch (err) {
        if (isMounted) {
          setCheckingSession(false);
          setError('Session check failed. Please try logging in again.');
        }
      }
    };

    resolveSession();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await Promise.race([
        supabase.auth.signInWithPassword({ email, password }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Login timed out')), 10000)
        ),
      ]);

      if (signInError) throw signInError;

      const user = data?.user;

      if (!user) {
        navigate('/dashboard');
        return;
      }

      const { data: profileData, error } = await Promise.race([
        supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Profile check timed out')), 6000)
        ),
      ]);

      if (error || !profileData?.onboarding_completed) {
        navigate('/onboarding');
        return;
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/login`,
        },
      });

      if (oauthError) throw oauthError;
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-[#006D77] via-[#005a63] to-[#004a52] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />
      </div>

      <motion.button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 p-3 bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 dark:hover:bg-gray-700/50 transition-colors z-20"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="button"
      >
        <ArrowLeft className="w-5 h-5" />
      </motion.button>

      <div className="relative z-10 w-full px-6 py-12 flex items-center justify-center min-h-screen">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 backdrop-blur-sm transition-colors border border-white/10">
            {checkingSession && (
              <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-300">
                Checking your progress...
              </div>
            )}
            <div className="text-center mb-8">
              <motion.div
                className="inline-block text-6xl mb-4"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                🎮
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome Back!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Continue your learning adventure
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <motion.button
              onClick={handleGoogleLogin}
              type="button"
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
              Continue with Google
            </motion.button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    onChange={(event) => setEmail(event.target.value)}
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
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#006D77] dark:focus:ring-[#06D6A0] focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-[#006D77] dark:bg-[#06D6A0] text-white dark:text-gray-900 font-semibold rounded-lg shadow-lg hover:bg-[#005a63] dark:hover:bg-[#05c295] transition-all flex items-center justify-center disabled:opacity-70"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                {loading ? 'Logging in...' : 'Resume Game'}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-gray-600 dark:text-gray-400">Don't have an account? </span>
              <button
                onClick={() => navigate('/signup')}
                className="text-[#006D77] dark:text-[#06D6A0] font-semibold hover:underline"
                type="button"
              >
                Start Your Quest
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
