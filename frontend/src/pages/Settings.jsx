import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  Bell,
  BookOpen,
  ChevronRight,
  HardDrive,
  Lock,
  LogOut,
  Mail,
  Settings as SettingsIcon,
  Shield,
  Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useEffect, useMemo, useState } from 'react';
import { useDarkMode } from '../contexts/DarkModeContext';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const categories = [
  { id: 'general', label: 'General', icon: SettingsIcon },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
];

const listVariants = {
  hidden: { opacity: 0, x: 40 },
  show: {
    opacity: 1,
    x: 0,
    transition: { staggerChildren: 0.1 },
  },
};

const listItemVariants = {
  hidden: { opacity: 0, x: 40 },
  show: { opacity: 1, x: 0 },
};

export function Settings() {
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [stream, setStream] = useState('');
  const [preferences, setPreferences] = useState({
    notificationsEnabled: true,
    studyGoal: '90 minutes',
  });
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [deleteCountdown, setDeleteCountdown] = useState(0);

  const storagePercent = useMemo(() => {
    const estimate = Math.min(100, Math.max(15, Math.floor(preferences.studyGoal.length * 6)));
    return estimate;
  }, [preferences.studyGoal]);

  useEffect(() => {
    let isMounted = true;

    const loadPreferences = async (user) => {
      try {
        setLoading(true);
        setLoadError('');

        if (!isMounted) return;
        setUserId(user.id);
        setEmail(user.email || '');

        // Get token from localStorage
        let token = null;
        const authTokenKey = Object.keys(localStorage).find(k => k.includes('auth-token') && !k.includes('verifier'));
        if (authTokenKey) {
          const tokenStr = localStorage.getItem(authTokenKey);
          if (tokenStr) {
            const parsed = JSON.parse(tokenStr);
            token = parsed?.access_token;
          }
        }

        if (!token) {
          throw new Error('No access token available');
        }

        // Use direct REST API instead of SDK
        const url = `${SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=preferences,stream`;
        const response = await fetch(url, {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          toast.error('Unable to load preferences.');
          setLoadError('Unable to load preferences.');
          return;
        }

        const result = await response.json();
        const data = Array.isArray(result) && result.length > 0 ? result[0] : null;

        if (!isMounted) return;

        if (!data) {
          toast.error('Unable to load preferences.');
          setLoadError('Unable to load preferences.');
          return;
        }

        const prefs = data?.preferences || {};
        setStream(data?.stream || '');
        setPreferences((prev) => ({
          ...prev,
          notificationsEnabled:
            typeof prefs.notificationsEnabled === 'boolean'
              ? prefs.notificationsEnabled
              : prev.notificationsEnabled,
          studyGoal: prefs.studyGoal || prev.studyGoal,
        }));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setLoadError(message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // Check localStorage first for immediate load
    const checkSession = () => {
      const authTokenKey = Object.keys(localStorage).find(k => k.includes('auth-token'));
      if (authTokenKey) {
        const tokenStr = localStorage.getItem(authTokenKey);
        if (tokenStr) {
          try {
            const parsed = JSON.parse(tokenStr);
            if (parsed?.user && isMounted) {
              loadPreferences(parsed.user);
              return true; // Session found
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
      return false; // No session in localStorage
    };

    const hasSession = checkSession();

    // Use auth state change listener as fallback
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if ((event === 'INITIAL_SESSION' || event === 'SIGNED_IN') && session?.user && isMounted) {
          loadPreferences(session.user);
        } else if (event === 'SIGNED_OUT' && isMounted) {
          navigate('/login', { replace: true });
        }
      }
    );

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [navigate, refreshKey]);

  const handleSavePreferences = async () => {
    if (!userId) return;
    setSavingPrefs(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ preferences })
        .eq('id', userId);

      if (error) throw error;
      toast.success('Preferences saved.');
    } catch (err) {
      toast.error('Unable to save preferences.');
    } finally {
      setSavingPrefs(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      toast.error('No email found for this account.');
      return;
    }
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      toast.success('Password reset email sent.');
    } catch (err) {
      toast.error('Unable to send reset email.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  const handleDeleteStart = () => {
    if (deleteCountdown > 0) return;
    setDeleteCountdown(3);
  };

  useEffect(() => {
    if (deleteCountdown <= 0) return;
    const timer = setTimeout(() => setDeleteCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [deleteCountdown]);

  const handleDeleteAccount = async () => {
    if (!userId) return;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) throw error;
      toast.success('Account data deleted.');
      await supabase.auth.signOut();
      navigate('/signup', { replace: true });
    } catch (err) {
      toast.error('Unable to delete account.');
    }
  };

  const ToggleSwitch = ({ checked, onChange }) => (
    <motion.button
      type="button"
      whileTap={{ scale: 0.92 }}
      onClick={() => onChange(!checked)}
      className="relative h-6 w-11 rounded-full transition-colors"
      style={{
        backgroundColor: checked ? '#06D6A0' : isDarkMode ? '#374151' : '#e5e7eb',
      }}
    >
      <motion.span
        layout
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
        animate={{ x: checked ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </motion.button>
  );

  const TabPanel = ({ tab }) => (
    <motion.div
      key={tab}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      {tab === 'general' && (
        <>
          <div
            className="rounded-2xl border px-5 py-4"
            style={{
              borderColor: isDarkMode ? '#1f2937' : '#e5e7eb',
              backgroundColor: isDarkMode ? '#111827' : '#ffffff',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-[#06D6A0]" />
                <div>
                  <p className="text-sm text-slate-400">Study Goal</p>
                  <input
                    value={preferences.studyGoal}
                    onChange={(event) =>
                      setPreferences((prev) => ({ ...prev, studyGoal: event.target.value }))
                    }
                    className="mt-1 w-44 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#06D6A0]"
                    style={{
                      borderColor: isDarkMode ? '#1f2937' : '#e5e7eb',
                      backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
                      color: isDarkMode ? '#f8fafc' : '#0f172a',
                    }}
                  />
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
          </div>

          <div
            className="rounded-2xl border px-5 py-4"
            style={{
              borderColor: isDarkMode ? '#1f2937' : '#e5e7eb',
              backgroundColor: isDarkMode ? '#111827' : '#ffffff',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-[#006D77]" />
                <div>
                  <p className="text-sm text-slate-400">Stream</p>
                  <p className="text-sm font-medium">
                    {stream || 'Not set'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
          </div>

          <div
            className="rounded-2xl border px-5 py-4"
            style={{
              borderColor: isDarkMode ? '#1f2937' : '#e5e7eb',
              backgroundColor: isDarkMode ? '#111827' : '#ffffff',
            }}
          >
            <div className="flex items-center gap-3">
              <HardDrive className="w-5 h-5 text-[#FFB400]" />
              <div className="flex-1">
                <p className="text-sm text-slate-400">Study Data Sync</p>
                <div className="mt-2 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-[#006D77] to-[#06D6A0]"
                    style={{ width: `${storagePercent}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-400">{storagePercent}% synced</p>
              </div>
            </div>
          </div>
        </>
      )}

      {tab === 'notifications' && (
        <div
          className="rounded-2xl border px-5 py-4"
          style={{
            borderColor: isDarkMode ? '#1f2937' : '#e5e7eb',
            backgroundColor: isDarkMode ? '#111827' : '#ffffff',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-[#06D6A0]" />
              <div>
                <p className="text-sm font-medium">Notifications</p>
                <p className="text-xs text-slate-400">Remind me about study streaks</p>
              </div>
            </div>
            <ToggleSwitch
              checked={preferences.notificationsEnabled}
              onChange={(value) =>
                setPreferences((prev) => ({ ...prev, notificationsEnabled: value }))
              }
            />
          </div>
        </div>
      )}

      {tab === 'security' && (
        <div className="space-y-4">
          <div
            className="rounded-2xl border px-5 py-4"
            style={{
              borderColor: isDarkMode ? '#1f2937' : '#e5e7eb',
              backgroundColor: isDarkMode ? '#111827' : '#ffffff',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#06D6A0]" />
                <div>
                  <p className="text-sm font-medium">Password Reset</p>
                  <p className="text-xs text-slate-400">Send reset link to {email || 'your email'}</p>
                </div>
              </div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={handlePasswordReset}
                className="px-4 py-2 rounded-lg bg-[#006D77] text-white text-sm"
              >
                {resetLoading ? 'Sending...' : 'Send Link'}
              </motion.button>
            </div>
          </div>

          <div
            className="rounded-2xl border px-5 py-4"
            style={{
              borderColor: isDarkMode ? '#1f2937' : '#e5e7eb',
              backgroundColor: isDarkMode ? '#111827' : '#ffffff',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-[#FFB400]" />
                <div>
                  <p className="text-sm font-medium">Sign out everywhere</p>
                  <p className="text-xs text-slate-400">End this session cleanly</p>
                </div>
              </div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-100 text-sm"
                animate={loggingOut ? { opacity: 0.7 } : { opacity: 1 }}
              >
                <span className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  {loggingOut ? 'Signing out...' : 'Sign Out'}
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );

  if (loading) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center"
        style={{ backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }}
      >
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            className="h-8 w-8 rounded-full border-2 border-[#06D6A0] border-t-transparent"
          />
          <p className="text-sm">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        className="min-h-screen w-full flex flex-col items-center justify-center gap-4"
        style={{ backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }}
      >
        <p className="text-sm text-rose-400">{loadError}</p>
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={() => setRefreshKey((prev) => prev + 1)}
          className="px-5 py-2 rounded-lg bg-[#006D77] text-white text-sm"
        >
          Try Again
        </motion.button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen transition-colors"
      style={{ backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }}
    >
      <div
        className="border-b sticky top-0 z-10 transition-colors"
        style={{
          borderColor: isDarkMode ? '#1f2937' : '#e5e7eb',
          backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
        }}
      >
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                backgroundColor: isDarkMode ? '#1f2937' : '#f1f5f9',
                color: isDarkMode ? '#cbd5f5' : '#475569',
              }}
              type="button"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: isDarkMode ? '#f8fafc' : '#0f172a' }}>
                System Core
              </h1>
              <p className="text-sm text-slate-400">Settings Hub</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 grid gap-8 md:grid-cols-[260px_1fr]">
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <motion.button
                key={category.id}
                variants={listItemVariants}
                onClick={() => setActiveTab(category.id)}
                className="w-full flex items-center justify-between rounded-2xl border px-4 py-3 text-left"
                style={{
                  borderColor: isDarkMode ? '#1f2937' : '#e5e7eb',
                  backgroundColor:
                    activeTab === category.id
                      ? isDarkMode
                        ? '#111827'
                        : '#ffffff'
                      : isDarkMode
                      ? '#0b1220'
                      : '#f1f5f9',
                  color: isDarkMode ? '#f8fafc' : '#0f172a',
                }}
                type="button"
              >
                <span className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-[#06D6A0]" />
                  {category.label}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </motion.button>
            );
          })}
        </motion.div>

        <div className="space-y-6">
          <AnimatePresence mode="wait">
            <TabPanel tab={activeTab} />
          </AnimatePresence>

          <div className="flex items-center justify-between">
            <motion.button
              type="button"
              onClick={handleSavePreferences}
              whileTap={{ scale: 0.97 }}
              className="px-5 py-2 rounded-lg bg-[#06D6A0] text-[#0f172a] text-sm font-semibold"
            >
              {savingPrefs ? 'Saving...' : 'Save Preferences'}
            </motion.button>
            <motion.button
              type="button"
              onClick={handleLogout}
              whileTap={{ scale: 0.97 }}
              className="px-4 py-2 rounded-lg border border-slate-300 text-sm"
              style={{
                borderColor: isDarkMode ? '#1f2937' : '#e5e7eb',
                color: isDarkMode ? '#f8fafc' : '#0f172a',
              }}
            >
              Quick Sign Out
            </motion.button>
          </div>

          <div
            className="rounded-2xl border px-5 py-4"
            style={{
              borderColor: '#dc2626',
              backgroundColor: isDarkMode ? '#1f0f12' : '#fff1f2',
            }}
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-rose-500" />
                <div>
                  <p className="text-sm font-semibold text-rose-500">Danger Zone</p>
                  <p className="text-xs text-rose-400">Delete account data after a confirmation delay.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  type="button"
                  onClick={handleDeleteStart}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-lg border border-rose-400 text-rose-500 text-sm"
                >
                  {deleteCountdown > 0 ? `Confirming... ${deleteCountdown}` : 'Delete Account'}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={handleDeleteAccount}
                  whileTap={{ scale: 0.95 }}
                  disabled={deleteCountdown > 0}
                  className="px-4 py-2 rounded-lg bg-rose-500 text-white text-sm disabled:opacity-60"
                >
                  Confirm Delete
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
