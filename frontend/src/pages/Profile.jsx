import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabaseClient';
import { useDarkMode } from '../contexts/DarkModeContext';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const CBSE_SYLLABUS = {
  6: [
    'Mathematics',
    'Science',
    'Social Science',
    'English',
    'Hindi',
    'Sanskrit',
    'Computer Science',
    'General Knowledge',
  ],
  7: [
    'Mathematics',
    'Science',
    'Social Science',
    'English',
    'Hindi',
    'Sanskrit',
    'Computer Science',
    'General Knowledge',
  ],
  8: [
    'Mathematics',
    'Science',
    'Social Science',
    'English',
    'Hindi',
    'Sanskrit',
    'Computer Science',
    'General Knowledge',
  ],
  9: [
    'Mathematics',
    'Science',
    'Social Science',
    'English',
    'Hindi',
    'Information Technology',
    'Artificial Intelligence',
    'French/German',
  ],
  10: [
    'Mathematics (Standard/Basic)',
    'Science',
    'Social Science',
    'English',
    'Hindi',
    'Information Technology',
    'Artificial Intelligence',
    'Sanskrit',
  ],
  11: [
    'Physics',
    'Chemistry',
    'Mathematics',
    'Biology',
    'Computer Science',
    'English Core',
    'Economics',
    'Physical Education',
    'Psychology',
    'Informatics Practices',
  ],
  12: [
    'Physics',
    'Chemistry',
    'Mathematics',
    'Biology',
    'Computer Science',
    'English Core',
    'Economics',
    'Physical Education',
    'Psychology',
    'Informatics Practices',
  ],
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, x: 24 },
  show: { opacity: 1, x: 0 },
};

export function Profile() {
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [profile, setProfile] = useState({
    full_name: '',
    grade_level: 10,
    stream: '',
    interests: [],
    xp: 0,
  });

  const level = useMemo(() => Math.floor((profile.xp || 0) / 1000) + 1, [profile.xp]);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async (user) => {
      console.log('[PROFILE] Loading profile for user:', user.id);
      try {
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
        const url = `${SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=full_name,grade_level,interests,xp,stream`;
        const response = await fetch(url, {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to load profile: ${response.status}`);
        }

        const data = await response.json();
        const profileData = Array.isArray(data) && data.length > 0 ? data[0] : null;

        if (!profileData) {
          throw new Error('Profile not found');
        }

        if (!isMounted) return;
        console.log('[PROFILE] ✅ Profile loaded:', profileData);
        setProfile({
          full_name: profileData?.full_name || '',
          grade_level: profileData?.grade_level || 10,
          stream: profileData?.stream || '',
          interests: profileData?.interests || [],
          xp: profileData?.xp || 0,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load profile.';
        console.error('[PROFILE] ❌ Error:', message);
        toast.error(message);
      } finally {
        if (isMounted) {
          console.log('[PROFILE] Setting loading to false');
          setLoading(false);
        }
      }
    };

    // Check localStorage first for immediate load
    const checkSession = () => {
      console.log('[PROFILE] Checking localStorage for session...');
      const authTokenKey = Object.keys(localStorage).find(k => k.includes('auth-token') && !k.includes('verifier'));
      if (authTokenKey) {
        const tokenStr = localStorage.getItem(authTokenKey);
        if (tokenStr) {
          try {
            const parsed = JSON.parse(tokenStr);
            console.log('[PROFILE] Parsed auth-token:', parsed);
            if (parsed?.user && isMounted) {
              console.log('[PROFILE] ✓ User found in localStorage, loading profile...');
              loadProfile(parsed.user);
              return true; // Session found
            } else {
              console.log('[PROFILE] No user in parsed token, checking for session structure...');
              // Try accessing session.user
              if (parsed?.session?.user && isMounted) {
                console.log('[PROFILE] ✓ User found in session, loading profile...');
                loadProfile(parsed.session.user);
                return true;
              }
            }
          } catch (e) {
            console.warn('[PROFILE] Failed to parse token:', e.message);
          }
        }
      }
      console.log('[PROFILE] No session in localStorage, will wait for auth event');
      return false; // No session in localStorage
    };

    checkSession();

    // Use auth state change listener as fallback
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[PROFILE] Auth event:', event, session?.user ? '✓ user' : '✗ no user');
        if ((event === 'INITIAL_SESSION' || event === 'SIGNED_IN') && session?.user && isMounted) {
          loadProfile(session.user);
        } else if (event === 'SIGNED_OUT' && isMounted) {
          navigate('/login', { replace: true });
        }
      }
    );

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    const allowedSubjects = new Set(CBSE_SYLLABUS[profile.grade_level] || []);
    setProfile((prev) => ({
      ...prev,
      interests: prev.interests.filter((subject) => allowedSubjects.has(subject)),
    }));
  }, [profile.grade_level]);

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('saving');
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) {
        navigate('/login', { replace: true });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          grade_level: Number(profile.grade_level),
          stream: profile.stream || null,
          interests: profile.interests,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile Updated! 🏆');
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 1600);
    } catch (err) {
      toast.error('Save failed. Please try again.');
      setSaveStatus('idle');
    } finally {
      setSaving(false);
    }
  };

  const toggleSubject = (subject) => {
    setProfile((prev) => {
      const exists = prev.interests.includes(subject);
      return {
        ...prev,
        interests: exists
          ? prev.interests.filter((item) => item !== subject)
          : [...prev.interests, subject],
      };
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };


  if (loading) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center"
        style={{ backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC' }}
      >
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin" />
          <span className="text-sm">Loading player stats...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC' }}
    >
      <div
        className="border-b sticky top-0 z-10"
        style={{
          borderColor: isDarkMode ? '#1E293B' : '#E2E8F0',
          backgroundColor: isDarkMode ? '#0F172A' : '#ffffff',
        }}
      >
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center gap-4">
          <motion.button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              backgroundColor: isDarkMode ? '#1E293B' : '#f1f5f9',
              color: isDarkMode ? '#CBD5F5' : '#475569',
            }}
            type="button"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <h1
            className="text-3xl font-bold"
            style={{ color: isDarkMode ? '#F8FAFC' : '#0F172A' }}
          >
            Player Stats
          </h1>
        </div>
      </div>

      <motion.div
        className="max-w-4xl mx-auto px-6 py-10 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.section
          variants={sectionVariants}
          className="rounded-3xl border p-8 shadow-sm"
          style={{
            borderColor: isDarkMode ? '#1E293B' : '#E2E8F0',
            backgroundColor: isDarkMode ? '#111827' : '#ffffff',
          }}
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#006D77] to-[#06D6A0] flex items-center justify-center text-white text-3xl font-bold">
                {profile.full_name ? profile.full_name[0].toUpperCase() : 'S'}
              </div>
              <div
                className="absolute -bottom-2 -right-2 rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  backgroundColor: isDarkMode ? '#0F172A' : '#ffffff',
                  border: `1px solid ${isDarkMode ? '#1E293B' : '#E2E8F0'}`,
                  color: isDarkMode ? '#F8FAFC' : '#0F172A',
                }}
              >
                Lv {level}
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-400">Player Name</p>
              <h2
                className="text-2xl font-semibold"
                style={{ color: isDarkMode ? '#F8FAFC' : '#0F172A' }}
              >
                {profile.full_name || 'New Scholar'}
              </h2>
            </div>
          </div>
        </motion.section>

        <motion.section
          variants={sectionVariants}
          className="rounded-3xl border p-6 shadow-sm"
          style={{
            borderColor: isDarkMode ? '#1E293B' : '#E2E8F0',
            backgroundColor: isDarkMode ? '#111827' : '#ffffff',
          }}
        >
          <h3
            className="text-xl font-semibold mb-4"
            style={{ color: isDarkMode ? '#F8FAFC' : '#0F172A' }}
          >
            Personal Info
          </h3>
          <label className="text-sm text-slate-400">Full Name</label>
          <input
            value={profile.full_name}
            onChange={(event) =>
              setProfile((prev) => ({ ...prev, full_name: event.target.value }))
            }
            className="mt-2 w-full rounded-xl border px-4 py-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-[#06D6A0] focus:shadow-[0_0_0_3px_rgba(6,214,160,0.3)]"
            style={{
              borderColor: isDarkMode ? '#1E293B' : '#e2e8f0',
              backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
              color: isDarkMode ? '#F8FAFC' : '#0F172A',
            }}
            placeholder="Enter your full name"
          />
        </motion.section>

        <motion.section
          variants={sectionVariants}
          className="rounded-3xl border p-6 shadow-sm"
          style={{
            borderColor: isDarkMode ? '#1E293B' : '#E2E8F0',
            backgroundColor: isDarkMode ? '#111827' : '#ffffff',
          }}
        >
          <h3
            className="text-xl font-semibold mb-4"
            style={{ color: isDarkMode ? '#F8FAFC' : '#0F172A' }}
          >
            Academic Settings
          </h3>
          <p className="text-sm text-slate-400 mb-3">Select your grade</p>
          <div className="flex flex-wrap gap-2 mb-6">
            {[6, 7, 8, 9, 10, 11, 12].map((grade) => (
              <motion.button
                key={grade}
                onClick={() =>
                  setProfile((prev) => ({
                    ...prev,
                    grade_level: Number(grade),
                    stream: Number(grade) >= 11 ? prev.stream : '',
                  }))
                }
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-full border text-sm font-semibold transition ${
                  profile.grade_level === grade
                    ? 'border-[#06D6A0] bg-[#06D6A0]/10 text-[#06D6A0]'
                    : 'border-transparent text-slate-400 bg-transparent'
                }`}
                type="button"
              >
                Class {grade}
              </motion.button>
            ))}
          </div>

          {profile.grade_level >= 11 && (
            <div className="mb-6">
              <p className="text-sm text-slate-400 mb-3">Stream</p>
              <div className="flex flex-wrap gap-2">
                {['Science', 'Commerce', 'Arts'].map((stream) => (
                  <motion.button
                    key={stream}
                    onClick={() => setProfile((prev) => ({ ...prev, stream }))}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-full border text-xs font-semibold transition ${
                      profile.stream === stream
                        ? 'border-[#06D6A0] bg-[#06D6A0]/10 text-[#06D6A0]'
                        : 'border-transparent text-slate-400 bg-transparent'
                    }`}
                    type="button"
                  >
                    {stream}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          <p className="text-sm text-slate-400 mb-3">Subjects</p>
          <AnimatePresence mode="popLayout">
            <motion.div
              key={profile.grade_level}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex flex-wrap gap-2"
            >
              {(CBSE_SYLLABUS[profile.grade_level] || []).map((subject) => {
                const selected = profile.interests.includes(subject);
                return (
                  <motion.button
                    key={subject}
                    onClick={() => toggleSubject(subject)}
                    whileTap={{ scale: 0.95 }}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                      selected
                        ? 'border-[#06D6A0] bg-[#06D6A0]/15 text-[#06D6A0]'
                        : 'border-transparent bg-[#0F172A]/10 text-slate-400'
                    }`}
                    type="button"
                  >
                    {subject}
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </motion.section>

        <motion.section
          variants={sectionVariants}
          className="rounded-3xl border p-6 shadow-sm"
          style={{
            borderColor: isDarkMode ? '#1E293B' : '#E2E8F0',
            backgroundColor: isDarkMode ? '#111827' : '#ffffff',
          }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3
                className="text-xl font-semibold"
                style={{ color: isDarkMode ? '#F8FAFC' : '#0F172A' }}
              >
                Account Actions
              </h3>
              <p className="text-sm text-slate-400">Safely log out of your account.</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-100 text-sm font-semibold"
              onClick={handleLogout}
              type="button"
            >
              Logout
            </motion.button>
          </div>
        </motion.section>

        <motion.div variants={sectionVariants} className="flex justify-end">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            className="px-6 py-3 rounded-xl bg-[#06D6A0] text-[#0F172A] font-semibold flex items-center gap-2"
            disabled={saving}
            type="button"
            animate={
              saving
                ? { scale: [1, 1.04, 1] }
                : saveStatus === 'success'
                ? { scale: 1.02 }
                : { scale: 1 }
            }
            transition={{ duration: 0.8, repeat: saving ? Infinity : 0 }}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : saveStatus === 'success' ? (
              <>
                <Check className="w-4 h-4" />
                Saved
              </>
            ) : (
              'Save Changes'
            )}
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
