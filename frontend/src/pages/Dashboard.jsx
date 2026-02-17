import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import {
  Book,
  BookOpen,
  Calculator,
  Atom,
  FlaskConical,
  Globe2,
  Coins,
  Cpu,
  Dna,
  Briefcase,
  BookText,
  Clock,
  Flame,
  Heart,
  Trash,
  Trophy,
  Sparkles,
  Star,
} from 'lucide-react';
import { Checkbox } from '../components/ui/checkbox';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';
import { useDarkMode } from '../contexts/DarkModeContext';
import { supabase } from '../lib/supabaseClient';
import { N8N_WEBHOOK_URL } from '../config/webhooks';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const SUBJECT_ICON_MAP = {
  Mathematics: Calculator,
  Math: Calculator,
  Physics: Atom,
  Chemistry: FlaskConical,
  Biology: Dna,
  Economics: Coins,
  Accountancy: Calculator,
  'Business Studies': Briefcase,
  'Computer Science': Cpu,
  English: BookText,
  'Social Science': Globe2,
  History: Globe2,
  Geography: Globe2,
  'Political Science': Globe2,
  'Environmental Studies': BookOpen,
};

const SUBJECT_COLOR_MAP = {
  Mathematics: { light: ['#E0F2FE', '#0284C7'], dark: ['#0B4A6F', '#7DD3FC'] },
  Math: { light: ['#E0F2FE', '#0284C7'], dark: ['#0B4A6F', '#7DD3FC'] },
  Physics: { light: ['#EDE9FE', '#7C3AED'], dark: ['#2E1065', '#C4B5FD'] },
  Chemistry: { light: ['#DCFCE7', '#16A34A'], dark: ['#14532D', '#86EFAC'] },
  Biology: { light: ['#FCE7F3', '#DB2777'], dark: ['#4A044E', '#F9A8D4'] },
  Economics: { light: ['#FEF9C3', '#CA8A04'], dark: ['#713F12', '#FDE047'] },
  Accountancy: { light: ['#FEF3C7', '#D97706'], dark: ['#78350F', '#FCD34D'] },
  'Business Studies': { light: ['#FFEDD5', '#EA580C'], dark: ['#7C2D12', '#FDBA74'] },
  'Computer Science': { light: ['#DBEAFE', '#2563EB'], dark: ['#1E3A8A', '#93C5FD'] },
  English: { light: ['#F1F5F9', '#0F172A'], dark: ['#1F2937', '#E5E7EB'] },
  'Social Science': { light: ['#ECFEFF', '#0E7490'], dark: ['#164E63', '#67E8F9'] },
  History: { light: ['#F1F5F9', '#334155'], dark: ['#1E293B', '#CBD5F5'] },
  Geography: { light: ['#FEF3C7', '#B45309'], dark: ['#78350F', '#FCD34D'] },
  'Political Science': { light: ['#EDE9FE', '#6D28D9'], dark: ['#312E81', '#C7D2FE'] },
  'Environmental Studies': { light: ['#DCFCE7', '#15803D'], dark: ['#14532D', '#86EFAC'] },
};

const CORE_SUBJECTS = new Set(['Physics', 'Economics', 'Mathematics', 'Math', 'Computer Science']);

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TIME_SLOTS = ['Morning', 'Afternoon', 'Evening'];
const SLOT_RANGES = [
  { label: 'Morning', start: 6, end: 11 },
  { label: 'Afternoon', start: 12, end: 17 },
  { label: 'Evening', start: 18, end: 22 },
];

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const createEmptyProfile = () => ({
  full_name: '',
  grade_level: null,
  interests: [],
  availability: [],
  difficulty_setting: null,
  preferences: {},
  xp: 0,
});

export default function Dashboard() {
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const shouldDebug = import.meta.env.DEV;
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(() => createEmptyProfile());
  const [tasks, setTasks] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeMission, setActiveMission] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const loadSeqRef = useRef(0);
  const sessionRef = useRef(null);
  const hasFetchedRef = useRef(false);

  const totalXp = useMemo(() => {
    if (!profile) return 0;
    if (Number.isFinite(profile?.xp)) return profile?.xp ?? 0;
    if (Number.isFinite(profile?.current_xp)) return profile?.current_xp ?? 0;
    return 0;
  }, [profile]);

  const displayName = profile?.full_name?.trim() || 'Scholar';
  const numericGrade = Number(profile?.grade_level);
  const isJunior = Number.isFinite(numericGrade) && numericGrade >= 1 && numericGrade <= 5;
  const displayGrade = Number.isFinite(numericGrade) ? numericGrade : profile?.grade_level ?? '--';
  const greetingLine = `Welcome back, ${displayName}! Ready for your Class ${displayGrade} Quests?`;

  const level = Math.floor(totalXp / 1000) + 1;
  const xpIntoLevel = totalXp % 1000;
  const xpToNextLevel = 1000 - xpIntoLevel;
  const progressValue = Math.min(100, (xpIntoLevel / 1000) * 100);

  const withTimeout = (promise, timeoutMs, label) =>
    Promise.race([
      promise,
      new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`${label} request timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      }),
    ]);

  const sleep = (ms) =>
    new Promise((resolve) => {
      setTimeout(resolve, ms);
    });

  const buildRestUrl = (table, params) => {
    if (!SUPABASE_URL) return '';
    const search = new URLSearchParams(params);
    return `${SUPABASE_URL}/rest/v1/${table}?${search.toString()}`;
  };

  const restFetchJson = async (url, accessToken, timeoutMs, label) => {
    if (!url) throw new Error('REST URL missing');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        headers: {
          apikey: SUPABASE_ANON_KEY || '',
          Authorization: `Bearer ${accessToken}`,
        },
        signal: controller.signal,
      });
      if (!response.ok) {
        const body = await response.text();
        throw new Error(`${label} REST error ${response.status}: ${body}`);
      }
      return await response.json();
    } catch (err) {
      if (err?.name === 'AbortError') {
        throw new Error(`${label} REST request timed out after ${timeoutMs}ms`);
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const debugProfilesPing = async (accessToken) => {
    if (!shouldDebug) return;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.warn('Supabase env missing for diagnostics');
      return;
    }

    try {
      const response = await withTimeout(
        fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id&limit=1`, {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${accessToken}`,
          },
        }),
        5000,
        'Profiles ping'
      );

      console.log('Profiles ping status:', response.status);
      const bodyText = await response.text();
      console.log('Profiles ping body:', bodyText.slice(0, 300));
    } catch (err) {
      console.error('Profiles ping failed:', err);
    }
  };

  const getSessionUser = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw new Error(error.message);
    return data?.session?.user || null;
  };

  const triggerConfetti = () => {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '0';
    container.style.top = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '9999';

    const colors = ['#006D77', '#83C5BE', '#FFB400', '#F97316', '#22C55E'];
    const pieces = 24;

    for (let i = 0; i < pieces; i += 1) {
      const piece = document.createElement('div');
      const size = Math.random() * 6 + 6;
      const startX = Math.random() * window.innerWidth;
      const startY = window.innerHeight * 0.2 + Math.random() * 120;
      piece.style.position = 'absolute';
      piece.style.width = `${size}px`;
      piece.style.height = `${size * 0.6}px`;
      piece.style.backgroundColor = colors[i % colors.length];
      piece.style.left = `${startX}px`;
      piece.style.top = `${startY}px`;
      piece.style.borderRadius = '2px';
      container.appendChild(piece);

      piece.animate(
        [
          { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
          {
            transform: `translateY(${200 + Math.random() * 200}px) rotate(${Math.random() * 360}deg)`,
            opacity: 0,
          },
        ],
        {
          duration: 900 + Math.random() * 600,
          easing: 'cubic-bezier(0.2, 0, 0.2, 1)',
        }
      );
    }

    document.body.appendChild(container);
    setTimeout(() => container.remove(), 1600);
  };

  const fetchDashboardData = async (userId) => {
    const loadSeq = loadSeqRef.current + 1;
    loadSeqRef.current = loadSeq;
    
    console.log('[FETCH]', loadSeq, 'Starting REST API fetch for user:', userId);

    try {
      if (loadSeq === loadSeqRef.current) {
        setLoading(true);
        setLoadError('');
      }

      // Get token from localStorage with direct SDK fallback
      console.log('[FETCH]', loadSeq, 'Getting session token...');
      let token = null;
      
      // Try localStorage keys that Supabase might use
      const possibleKeys = [
        'sb-session',
        ...Object.keys(localStorage).filter(k => k.includes('auth') || k.includes('token'))
      ];
      
      console.log('[FETCH]', loadSeq, 'Checking localStorage keys:', possibleKeys);
      
      for (const key of possibleKeys) {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            const parsed = JSON.parse(value);
            token = parsed?.access_token || parsed?.session?.access_token;
            if (token) {
              console.log('[FETCH]', loadSeq, '✓ Token found in', key);
              break;
            }
          } catch (e) {
            // Not JSON, try next key
          }
        }
      }

      // Fallback: try SDK call with timeout
      if (!token) {
        console.log('[FETCH]', loadSeq, 'No token in localStorage, trying SDK with short timeout...');
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('SDK timeout')), 2000)
        );
        
        try {
          const { data } = await Promise.race([sessionPromise, timeoutPromise]);
          token = data?.session?.access_token;
          if (token) {
            console.log('[FETCH]', loadSeq, '✓ Token from SDK');
          }
        } catch (err) {
          console.warn('[FETCH]', loadSeq, 'SDK call failed:', err.message);
        }
      }

      if (!token) {
        throw new Error('No access token available - user may need to login again');
      }

      // Fetch profile via REST API with timeout
      console.log('[FETCH]', loadSeq, 'Fetching profile...');
      const profileUrl = `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=*`;
      const profileController = new AbortController();
      const profileTimeoutId = setTimeout(() => profileController.abort(), 8000);
      
      try {
        const profileResponse = await fetch(profileUrl, {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${token}`,
          },
          signal: profileController.signal,
        });

        if (!profileResponse.ok) {
          const errorText = await profileResponse.text();
          throw new Error(`Profile error ${profileResponse.status}: ${errorText}`);
        }

        const profileData = await profileResponse.json();
        console.log('[FETCH]', loadSeq, 'Profile received:', profileData?.length, 'records');

        // Fetch tasks via REST API with timeout
        console.log('[FETCH]', loadSeq, 'Fetching tasks...');
        const tasksUrl = `${SUPABASE_URL}/rest/v1/tasks?student_id=eq.${userId}&select=*&order=created_at.desc`;
        const tasksController = new AbortController();
        const tasksTimeoutId = setTimeout(() => tasksController.abort(), 8000);
        
        try {
          const tasksResponse = await fetch(tasksUrl, {
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${token}`,
            },
            signal: tasksController.signal,
          });

          if (!tasksResponse.ok) {
            const errorText = await tasksResponse.text();
            throw new Error(`Tasks error ${tasksResponse.status}: ${errorText}`);
          }

          const tasksData = await tasksResponse.json();
          console.log('[FETCH]', loadSeq, 'Tasks received:', tasksData?.length, 'items');

          // Only update state if this is still the latest request
          if (loadSeq === loadSeqRef.current) {
            if (Array.isArray(profileData) && profileData.length > 0) {
              setProfile(profileData[0]);
              console.log('[FETCH] ✅', loadSeq, 'Profile loaded');
            } else {
              setProfile(createEmptyProfile());
            }

            if (Array.isArray(tasksData)) {
              setTasks(tasksData);
              console.log('[FETCH] ✅', loadSeq, 'Tasks loaded');
            } else {
              setTasks([]);
            }

            console.log('[FETCH] ✅', loadSeq, 'All data loaded - setting loading to false');
            setLoading(false);
          }
        } finally {
          clearTimeout(tasksTimeoutId);
        }
      } finally {
        clearTimeout(profileTimeoutId);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[FETCH] ❌', loadSeq, 'Error:', message);
      
      if (loadSeq === loadSeqRef.current) {
        setLoadError(message);
        setProfile(createEmptyProfile());
        setTasks([]);
        setLoading(false);
      }
    }
  };

  const refreshTasks = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('student_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to refresh tasks:', err);
      toast.error('Could not refresh tasks.');
    }
  };

  useEffect(() => {
    let isMounted = true;

    const handleMount = async () => {
      console.log('[MOUNT] Checking session...');
      
      // Check localStorage first (fastest path)
      const authTokenKey = Object.keys(localStorage).find(k => k.includes('auth-token'));
      let session = null;
      
      if (authTokenKey) {
        const tokenStr = localStorage.getItem(authTokenKey);
        if (tokenStr) {
          try {
            const parsed = JSON.parse(tokenStr);
            session = parsed;
            console.log('[MOUNT] ✓ Session found in localStorage');
          } catch (e) {
            console.warn('[MOUNT] localStorage corrupted');
          }
        }
      }

      if (session?.user && isMounted) {
        console.log('🚀 Session recovered from localStorage. Fetching...');
        fetchDashboardData(session.user.id);
        return; // SUCCESS
      }

      console.log('[MOUNT] No localStorage session. Waiting for auth events...');
    };

    handleMount();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[AUTH_CHANGE]', event);
        
        // Handle INITIAL_SESSION (happens on page load when session exists)
        if (event === 'INITIAL_SESSION' && session?.user && isMounted) {
          console.log('✅ INITIAL_SESSION detected. Fetching data...');
          fetchDashboardData(session.user.id);
        } 
        // Handle new sign-ins
        else if (event === 'SIGNED_IN' && session && isMounted) {
          console.log('✅ SIGNED_IN event received. Fetching data...');
          fetchDashboardData(session.user.id);
        } 
        // Handle sign-outs
        else if (event === 'SIGNED_OUT' && isMounted) {
          console.log('🚪 SIGNED_OUT event received - redirecting to login');
          hasFetchedRef.current = false;
          setLoading(false);
          navigate('/login', { replace: true });
        }
      }
    );

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const handleTaskToggle = async (taskId, xpValue, currentStatus) => {
    const user = await getSessionUser();
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    const newStatus = !currentStatus;

    const { error } = await supabase
      .from('tasks')
      .update({ is_completed: newStatus })
      .eq('id', taskId);

    if (error) {
      toast.error('Could not update task. Try again.');
      return;
    }

    setTasks((prev) =>
      prev.map((item) =>
        item.id === taskId ? { ...item, is_completed: newStatus } : item
      )
    );

    if (!newStatus || !profile) return;

    triggerConfetti();

    const newTotalXp = totalXp + xpValue;
    const xpColumn = Object.prototype.hasOwnProperty.call(profile, 'xp')
      ? 'xp'
      : 'current_xp';

    await supabase
      .from('profiles')
      .update({ [xpColumn]: newTotalXp })
      .eq('id', profile?.id);

    setProfile((prev) => (prev ? { ...prev, [xpColumn]: newTotalXp } : prev));
    toast.success(`Quest Complete! +${xpValue} XP`);
  };

  const handleTaskDelete = async (taskId) => {
    const user = await getSessionUser();
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    const { error } = await supabase.from('tasks').delete().eq('id', taskId);

    if (error) {
      toast.error('Could not delete task.');
      return;
    }

    setTasks((prev) => prev.filter((item) => item.id !== taskId));
  };

  const parseAvailability = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch (err) {
        return [];
      }
    }
    return [];
  };

  const getCurrentSlotIndex = () => {
    const hour = new Date().getHours();
    const slotIndex = SLOT_RANGES.findIndex(
      (slot) => hour >= slot.start && hour <= slot.end
    );
    return slotIndex === -1 ? 0 : slotIndex;
  };

  const availabilityMatrix = parseAvailability(profile?.availability);

  const primarySubject = profile?.interests?.[0] || 'Core Subjects';
  const xpSource = Number.isFinite(profile?.xp)
    ? profile?.xp
    : Number.isFinite(profile?.current_xp)
    ? profile?.current_xp
    : 0;
  const currentLevel = Math.floor(xpSource / 1000) + 1;
  const xpProgress = Math.min(100, (xpSource % 1000) / 10);
  const difficultyLabel = profile?.difficulty_setting || 'Standard';

  const todayIndex = new Date().getDay();
  const todaySlots = Array.isArray(availabilityMatrix)
    ? availabilityMatrix[todayIndex] || []
    : [];
  const hasTodaySlot = Array.isArray(todaySlots) && todaySlots.some(Boolean);
  const currentSlotIndex = getCurrentSlotIndex();
  const isCurrentSlotAvailable = Boolean(todaySlots?.[currentSlotIndex]);

  const isTaskToday = (createdAt) => {
    if (!createdAt) return false;
    const taskDate = new Date(createdAt);
    const now = new Date();
    return (
      taskDate.getFullYear() === now.getFullYear() &&
      taskDate.getMonth() === now.getMonth() &&
      taskDate.getDate() === now.getDate()
    );
  };

  const todayTasks = tasks.filter((task) => isTaskToday(task.created_at));
  const taskPreset = difficultyLabel.toLowerCase() === 'hardcore'
    ? { durationMins: 90 }
    : { durationMins: 30 };
  const missionXp = difficultyLabel.toLowerCase() === 'hardcore' ? 100 : 50;

  const calculateXpReward = (subject) => {
    const baseXp = 50;
    const isHardcore = difficultyLabel.toLowerCase() === 'hardcore';
    const multiplier = isHardcore ? 1.5 : 1;
    const isCore = CORE_SUBJECTS.has(subject);
    const isInterest = (profile?.interests || []).includes(subject);
    const bonus = isCore && isInterest ? 20 : 0;
    return Math.round(baseXp * multiplier + bonus);
  };

  const draftTasks = (profile?.interests || []).map((subject) => ({
    subject,
    name: `Deep Work: ${subject}`,
    durationMins: taskPreset.durationMins,
    xp_reward: calculateXpReward(subject),
  }));

  const handleAddDraft = async (draft) => {
    const user = await getSessionUser();
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        student_id: user.id,
        title: draft.name,
        subject_name: draft.subject,
        estimated_time_mins: draft.durationMins,
        xp_reward: draft.xp_reward,
        is_completed: false,
      })
      .select(
        'id, student_id, title, subject_name, is_completed, estimated_time_mins, xp_reward, due_date, created_at'
      )
      .single();

    if (error) {
      toast.error('Could not add task. Try again.');
      return;
    }

    setTasks((prev) => [data, ...prev]);
  };

  const handleInitializeDailyMissions = async () => {
    if (draftTasks.length === 0) return;
    const selectedDrafts = draftTasks.slice(0, 3);
    for (const draft of selectedDrafts) {
      await handleAddDraft(draft);
    }
  };

  const handleGenerateMissions = async () => {
    if (draftTasks.length === 0) return;
    const count = Math.min(3, Math.max(1, draftTasks.length));
    const selectedDrafts = draftTasks.slice(0, count);
    for (const draft of selectedDrafts) {
      await handleAddDraft(draft);
    }
  };

  const generateMissions = async () => {
    const user = await getSessionUser();
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    const subjects = (profile?.interests || []).slice(0, 3);
    const missions = subjects.map((subject) => ({
      student_id: user.id,
      title: `Deep Work: ${subject}`,
      subject_name: subject,
      estimated_time_mins: 25,
      xp_reward: missionXp,
      is_completed: false,
    }));

    if (missions.length === 0) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert(missions)
      .select(
        'id, student_id, title, subject_name, is_completed, estimated_time_mins, xp_reward, due_date, created_at'
      );

    if (error) {
      toast.error('Could not generate missions. Try again.');
      return;
    }

    setTasks((prev) => [...(data || []), ...prev]);
  };

  const handleGenerate = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    const user = await getSessionUser();
    if (!user) {
      setIsGenerating(false);
      navigate('/login', { replace: true });
      return;
    }

    const N8N_URL = N8N_WEBHOOK_URL;

    if (!N8N_URL || N8N_URL.includes('[PASTE_YOUR_ONE_WEBHOOK_URL]')) {
      toast.error('Webhook URL not configured');
      setIsGenerating(false);
      return;
    }

    try {
      const response = await fetch(N8N_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: user.id,
          action: 'generate',
        }),
      });
      if (!response.ok) {
        console.warn('n8n returned a non-OK response.');
        setIsGenerating(false);
        return;
      }

      await response.json().catch(() => null);
      await refreshTasks(user.id);
      setIsGenerating(false);
      return;
    } catch (err) {
      console.error('n8n connection failed:', err);
    }
    setIsGenerating(false);
  };
  const currentSlotLabel = TIME_SLOTS[currentSlotIndex] || 'Today';

  const parseStudyGoalHours = (value) => {
    if (!value) return 4;
    const match = String(value).match(/(\d+(?:\.\d+)?)/);
    if (!match) return 4;
    const numeric = Number(match[1]);
    if (!Number.isFinite(numeric)) return 4;
    if (String(value).toLowerCase().includes('min')) return numeric / 60;
    return numeric;
  };

  const dailyGoalHours = parseStudyGoalHours(profile?.preferences?.studyGoal);
  const completedMinutes = todayTasks
    .filter((task) => task.is_completed)
    .reduce((sum, task) => sum + (task.estimated_time_mins || 0), 0);
  const completedHours = Math.round((completedMinutes / 60) * 10) / 10;
  const dailyProgress = Math.min(100, (completedHours / dailyGoalHours) * 100);

  const selectActiveMission = () => todayTasks.find((task) => !task.is_completed) || null;

  useEffect(() => {
    if (!activeMission) {
      setActiveMission(selectActiveMission());
    }
  }, [todayTasks, activeMission]);

  useEffect(() => {
    if (!isTimerRunning || timerSeconds <= 0) return undefined;
    const timerId = setInterval(() => {
      setTimerSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [isTimerRunning, timerSeconds]);

  useEffect(() => {
    if (!isTimerRunning || timerSeconds > 0 || !activeMission) return;
    setIsTimerRunning(false);
    handleTaskToggle(
      activeMission.id,
      activeMission.xp_reward ?? calculateXpReward(activeMission.subject_name),
      activeMission.is_completed
    );
  }, [timerSeconds, isTimerRunning, activeMission]);

  const startTimer = (task) => {
    if (!task) return;
    setActiveMission(task);
    const durationSeconds = 25 * 60;
    setTimerSeconds(durationSeconds);
    setIsTimerRunning(true);
  };

  const formattedTime = () => {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gray-900 px-8 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-24 rounded-3xl bg-gray-800" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="h-28 rounded-2xl bg-gray-800" />
            ))}
          </div>
          <div className="h-20 rounded-2xl bg-gray-800" />
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={`stat-${index}`} className="h-20 rounded-2xl bg-gray-800" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4 bg-gray-900 text-slate-100">
        <p className="text-red-400">{loadError}</p>
        <button
          type="button"
          onClick={() => setRefreshKey((prev) => prev + 1)}
          className="px-6 py-2 rounded-xl bg-[#006D77] text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen"
      style={{ backgroundColor: isDarkMode ? '#111827' : '#ffffff' }}
      variants={pageVariants}
      initial="hidden"
      animate="show"
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <motion.div className="w-full max-w-screen-xl mx-auto px-4 py-6 md:px-8" variants={itemVariants}>
        <div className="space-y-6">
          <header
            className={`flex flex-col gap-4 p-6 rounded-3xl shadow-sm md:flex-row md:items-center md:justify-between ${
              isJunior
                ? 'border-0'
                : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700'
            }`}
            style={
              isJunior
                ? {
                    background: isDarkMode
                      ? 'linear-gradient(135deg, #FDE68A, #FCA5A5, #A5F3FC)'
                      : 'linear-gradient(135deg, #FFF3B0, #FF9BD2, #A0E7E5)',
                  }
                : undefined
            }
          >
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: isJunior ? '#111827' : isDarkMode ? '#f9fafb' : '#111827' }}
              >
                {greetingLine}
              </h1>
              <div className="flex flex-wrap gap-2 mt-2">
                <span
                  className="text-xs font-bold px-2 py-1 rounded-full uppercase inline-flex items-center gap-1"
                  style={
                    isJunior
                      ? { backgroundColor: '#FFEA70', color: '#7A4E00' }
                      : { backgroundColor: '#FFEDD5', color: '#9A3412' }
                  }
                >
                  {isJunior && <Star className="w-3 h-3" />}
                  Class {displayGrade}
                </span>
                <span
                  className="text-xs font-bold px-2 py-1 rounded-full uppercase inline-flex items-center gap-1"
                  style={
                    isJunior
                      ? { backgroundColor: '#A7F3D0', color: '#065F46' }
                      : { backgroundColor: '#FEE2E2', color: '#B91C1C' }
                  }
                >
                  {isJunior && <Sparkles className="w-3 h-3" />}
                  {difficultyLabel} Quest Mode
                </span>
              </div>
            </div>

            <div className="text-right">
              <p
                className="text-sm font-bold uppercase tracking-widest"
                style={{ color: isJunior ? '#1f2937' : '#6b7280' }}
              >
                Level {currentLevel}
              </p>
              <div
                className="w-32 h-3 rounded-full mt-1 overflow-hidden"
                style={{ backgroundColor: isJunior ? '#FDE68A' : '#e5e7eb' }}
              >
                <div
                  className="h-full transition-all duration-1000"
                  style={{ backgroundColor: isJunior ? '#FB7185' : '#006D77', width: `${xpProgress}%` }}
                />
              </div>
            </div>
          </header>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(profile?.interests || []).map((subject) => {
              const Icon = SUBJECT_ICON_MAP[subject] || Book;
              const [iconBg, iconColor] = (SUBJECT_COLOR_MAP[subject] || {
                light: ['#EDF6F9', '#006D77'],
                dark: ['#1F2937', '#A7F3D0'],
              })[isDarkMode ? 'dark' : 'light'];
              const cardBg = isDarkMode ? `${iconBg}33` : iconBg;
              return (
                <motion.div
                  key={subject}
                  whileHover={{ scale: 1.05 }}
                  className="p-4 rounded-2xl border-2 transition-all cursor-pointer group relative"
                  style={{
                    backgroundColor: cardBg,
                    borderColor: iconColor,
                  }}
                >
                  {isJunior && (
                    <span
                      className="absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full"
                      style={{ backgroundColor: '#FFE66D', color: '#7A4E00' }}
                    >
                      <Star className="h-3.5 w-3.5" />
                    </span>
                  )}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: iconBg }}
                  >
                    <Icon size={20} style={{ color: iconColor }} />
                  </div>
                  <p className="font-bold text-sm" style={{ color: iconColor }}>
                    {subject}
                  </p>
                  <p
                    className="text-[10px] uppercase mt-1 opacity-0 group-hover:opacity-100 transition"
                    style={{ color: isDarkMode ? '#E5E7EB' : '#475569' }}
                  >
                    0% Complete
                  </p>
                </motion.div>
              );
            })}
            {(!profile?.interests || profile?.interests?.length === 0) && (
              <div className="col-span-2 md:col-span-4 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-6 text-sm text-gray-400">
                Select subjects in onboarding to build your Quest Hub.
              </div>
            )}
          </div>

          <div className="rounded-2xl border px-5 py-4 bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Next Quest Window
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isCurrentSlotAvailable
                    ? `Current Status: ${currentSlotLabel} Quest Window is OPEN.`
                    : `Current Status: ${currentSlotLabel} Quest Window is CLOSED.`}
                </p>
              </div>
              <div className="text-xs font-semibold text-[#006D77]">Adaptive</div>
            </div>
          </div>

          <div className="rounded-2xl border px-5 py-4 bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Quest Generator
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isCurrentSlotAvailable
                    ? `Current slot: ${TIME_SLOTS[currentSlotIndex]} - Ready to focus.`
                    : `Current slot: ${TIME_SLOTS[currentSlotIndex]} - Rest or prep.`}
                </p>
              </div>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-4 py-2 rounded-lg bg-[#006D77] text-white text-xs font-semibold"
              >
                {isGenerating ? 'Consulting the Oracle...' : "Generate Today's Quests"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border px-5 py-4 bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Weekly Quest Rhythm
              </p>
              <span className="text-xs text-gray-400">Availability</span>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {DAYS.map((day, dayIndex) => (
                <div key={day} className="flex flex-col items-center gap-2">
                  <span
                    className={`text-[10px] font-semibold ${
                      dayIndex === todayIndex ? 'text-[#006D77]' : 'text-gray-400'
                    }`}
                  >
                    {day}
                  </span>
                  <div className="grid gap-1">
                    {TIME_SLOTS.map((slot, slotIndex) => {
                      const isAvailable =
                        Array.isArray(profile?.availability) &&
                        profile?.availability?.[dayIndex]?.[slotIndex];
                      const isToday = dayIndex === todayIndex;
                      return (
                        <div
                          key={`${day}-${slot}`}
                          className="h-2 w-2 rounded"
                          style={{
                            backgroundColor: isAvailable
                              ? isToday
                                ? '#006D77'
                                : '#83C5BE'
                              : '#E5E7EB',
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div className="w-full max-w-screen-xl mx-auto px-4 py-6 md:px-8" variants={itemVariants}>
        <div className="grid gap-4 md:grid-cols-3">
          <div
            className="rounded-2xl px-5 py-4 shadow-sm"
            style={{
              backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
              border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
            }}
          >
            <div className="flex items-center gap-3">
              <Flame className="w-5 h-5 text-orange-500" />
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400">Streak</div>
                <div
                  className="text-lg font-semibold"
                  style={{ color: isDarkMode ? '#f9fafb' : '#111827' }}
                >
                  {profile?.streak || 0} Days
                </div>
              </div>
            </div>
          </div>
          <div
            className="rounded-2xl px-5 py-4 shadow-sm"
            style={{
              backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
              border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
            }}
          >
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400">HP</div>
                <div
                  className="text-lg font-semibold"
                  style={{ color: isDarkMode ? '#f9fafb' : '#111827' }}
                >
                  90 / 100
                </div>
              </div>
            </div>
          </div>
          <div
            className="rounded-2xl px-5 py-4 shadow-sm"
            style={{
              backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
              border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
            }}
          >
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-[#FFB400]" />
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400">Total XP</div>
                <div
                  className="text-lg font-semibold"
                  style={{ color: isDarkMode ? '#f9fafb' : '#111827' }}
                >
                  {totalXp}
                </div>
              </div>
            </div>
          </div>
          <div
            className="rounded-2xl px-5 py-4 shadow-sm"
            style={{
              backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
              border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
            }}
          >
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12">
                <svg viewBox="0 0 36 36" className="h-12 w-12">
                  <path
                    d="M18 2.5a15.5 15.5 0 1 1 0 31 15.5 15.5 0 1 1 0-31"
                    fill="none"
                    stroke={isDarkMode ? '#1f2937' : '#e5e7eb'}
                    strokeWidth="4"
                  />
                  <path
                    d="M18 2.5a15.5 15.5 0 1 1 0 31 15.5 15.5 0 1 1 0-31"
                    fill="none"
                    stroke="#006D77"
                    strokeWidth="4"
                    strokeDasharray={`${dailyProgress}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-[#006D77]">
                  {Math.round(dailyProgress)}%
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400">Daily Goal</div>
                <div
                  className="text-sm font-semibold"
                  style={{ color: isDarkMode ? '#f9fafb' : '#111827' }}
                >
                  {completedHours}/{dailyGoalHours} hrs
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div className="px-8" variants={itemVariants}>
        <motion.div
          className="rounded-2xl p-8 shadow-lg text-white"
          style={{ background: 'linear-gradient(135deg, #006D77, #004d54)' }}
          animate={
            isTimerRunning
              ? { boxShadow: ['0 0 0 rgba(0,0,0,0)', '0 0 25px rgba(131,197,190,0.7)', '0 0 0 rgba(0,0,0,0)'] }
              : { boxShadow: '0 0 0 rgba(0,0,0,0)' }
          }
          transition={{ duration: 1.6, repeat: isTimerRunning ? Infinity : 0 }}
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-3xl font-bold">
                Quest Controller: {activeMission?.title || primarySubject}
              </h3>
              <p className="text-white/90 mt-2">
                {activeMission
                  ? `Subject: ${activeMission.subject_name || 'General'}`
                  : 'Generate quests to queue your deep work.'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {isTimerRunning && (
                <div className="text-sm font-semibold">{formattedTime()}</div>
              )}
              <button
                type="button"
                onClick={() => startTimer(activeMission)}
                className="rounded-lg bg-[#FFB400] px-6 py-3 text-sm font-semibold text-[#1f2937] shadow hover:bg-[#ffc533]"
              >
                Start Timer
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div className="px-8 py-6" variants={itemVariants}>
        <div
          className="rounded-2xl p-6 shadow-sm mb-6"
          style={{
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
            border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-xl font-semibold"
              style={{ color: isDarkMode ? '#f9fafb' : '#111827' }}
            >
              Daily Quests
            </h3>
            <span className="text-xs text-slate-400">Based on your interests</span>
          </div>

          {todayTasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-6 text-center text-slate-400">
              <div className="text-3xl mb-2">🚀</div>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Ready to Level Up?
              </p>
              <p className="text-xs mt-1">
                Initialize quests tailored to your subjects.
              </p>
              <button
                type="button"
                onClick={handleInitializeDailyMissions}
                className="mt-4 px-4 py-2 rounded-lg bg-[#006D77] text-white text-sm font-semibold"
              >
                Initialize Daily Quests
              </button>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {todayTasks.map((task) => {
                const complexityMeta = getComplexityMeta(
                  0.8,
                  isDarkMode
                );
                const categoryBadge = getTaskCategoryBadge(
                  null,
                  0.8,
                  isDarkMode
                );
                return (
                  <motion.div
                    key={task.id}
                    whileHover={{ scale: 1.02 }}
                    className="rounded-xl border px-4 py-3 flex items-center gap-4"
                    style={{
                      borderColor: complexityMeta.borderColor,
                      backgroundColor: isDarkMode ? '#111827' : '#f8fafc',
                    }}
                  >
                    <Checkbox
                      checked={task.is_completed}
                      onCheckedChange={() =>
                        handleTaskToggle(
                          task.id,
                          task.xp_reward ?? calculateXpReward(task.subject_name),
                          task.is_completed
                        )
                      }
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="px-2 py-1 rounded-full text-[10px] font-semibold"
                          style={getSubjectColorStyle(task.subject_name || 'General', isDarkMode)}
                        >
                          {task.subject_name || 'General'}
                        </span>
                        <span
                          className="px-2 py-1 rounded-full text-[10px] font-semibold"
                          style={{
                            backgroundColor: categoryBadge.badgeBg,
                            color: categoryBadge.badgeText,
                          }}
                        >
                          {categoryBadge.label}
                        </span>
                      </div>
                      <p className="text-sm font-semibold mt-2">
                        {task.title}
                      </p>
                      <p className="text-xs text-slate-400">
                        Duration: {task.estimated_time_mins || taskPreset.durationMins} mins
                      </p>
                    </div>
                    <div className="text-xs font-semibold text-[#FFB400]">
                      +{task.xp_reward ?? calculateXpReward(task.subject_name)} XP
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        <div
          className="rounded-2xl p-6 shadow-sm"
          style={{
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
            border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
          }}
        >
          <div className="flex items-center justify-between">
            <h3
              className="text-xl font-semibold flex items-center gap-2"
              style={{ color: isDarkMode ? '#f9fafb' : '#111827' }}
            >
              <Clock className="w-5 h-5 text-[#006D77]" />
              Today's Quest Log
            </h3>
            <div className="text-sm text-slate-400">Level {level}</div>
          </div>

          <div className="mt-4">
            <div className="flex items-end justify-between text-sm text-slate-400">
              <span>Level Progress</span>
              <span>{xpToNextLevel} XP to next level</span>
            </div>
            <Progress value={progressValue} className="h-3 bg-white/20 mt-2" />
          </div>

          <div className="mt-6 space-y-3">
            <AnimatePresence mode="popLayout">
              {tasks.map((task) => {
                const complexityMeta = getComplexityMeta(
                  0.8,
                  isDarkMode
                );
                const categoryBadge = getTaskCategoryBadge(
                  null,
                  0.8,
                  isDarkMode
                );
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    whileHover={{ y: -4, scale: 1.01 }}
                    className="group flex items-center gap-4 rounded-xl border px-4 py-3"
                    style={{
                      borderColor: complexityMeta.borderColor,
                      backgroundColor: isDarkMode ? '#111827' : '#f8fafc',
                    }}
                  >
                    <Checkbox
                      checked={task.is_completed}
                      onCheckedChange={() =>
                        handleTaskToggle(
                          task.id,
                          task.xp_reward ?? calculateXpReward(task.subject_name),
                          task.is_completed
                        )
                      }
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <div
                        className="font-medium"
                        style={{
                          textDecoration: task.is_completed ? 'line-through' : 'none',
                          color: task.is_completed
                            ? '#9ca3af'
                            : isDarkMode
                            ? '#f3f4f6'
                            : '#111827',
                        }}
                      >
                        {task.title}
                      </div>
                      <div
                        className="text-sm flex items-center gap-1 mt-1"
                        style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
                      >
                        <Clock className="w-3 h-3" />
                        Estimated: {task.estimated_time_mins || taskPreset.durationMins} mins
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={getSubjectColorStyle(task.subject_name || 'General', isDarkMode)}
                      >
                        {task.subject_name || 'General'}
                      </span>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: categoryBadge.badgeBg,
                          color: categoryBadge.badgeText,
                        }}
                      >
                        {categoryBadge.label}
                      </span>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: isDarkMode ? '#5B3F00' : '#FFF8E1',
                          color: isDarkMode ? '#FCD34D' : '#FFB400',
                        }}
                      >
                        +{task.xp_reward ?? calculateXpReward(task.subject_name)} XP
                      </span>
                      <button
                        type="button"
                        onClick={() => handleTaskDelete(task.id)}
                        className="opacity-0 group-hover:opacity-100 transition text-slate-400 hover:text-rose-400"
                        aria-label="Delete task"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {tasks.length === 0 && (
              <div className="text-sm text-slate-400">No tasks yet.</div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function getSubjectColorStyle(subject, isDarkMode) {
  const colors = isDarkMode
    ? {
        Math: { backgroundColor: '#1e3a8a', color: '#7dd3fc' },
        Physics: { backgroundColor: '#4c1d95', color: '#d8b4fe' },
        Chemistry: { backgroundColor: '#15803d', color: '#86efac' },
        Biology: { backgroundColor: '#831843', color: '#f472b6' },
      }
    : {
        Math: { backgroundColor: '#dbeafe', color: '#1e40af' },
        Physics: { backgroundColor: '#e9d5ff', color: '#6b21a8' },
        Chemistry: { backgroundColor: '#dcfce7', color: '#15803d' },
        Biology: { backgroundColor: '#fbcfe8', color: '#9d174d' },
      };

  return (
    colors[subject] || {
      backgroundColor: isDarkMode ? '#4b5563' : '#f3f4f6',
      color: isDarkMode ? '#d1d5db' : '#374151',
    }
  );
}

function getComplexityMeta(complexity, isDarkMode) {
  const value = Number(complexity);
  if (value >= 1.5) {
    return {
      label: 'High Intensity',
      borderColor: isDarkMode ? '#ef4444' : '#dc2626',
      badgeBg: isDarkMode ? '#7f1d1d' : '#fee2e2',
      badgeText: isDarkMode ? '#fca5a5' : '#b91c1c',
    };
  }
  if (value >= 1.1) {
    return {
      label: 'Focused Reading',
      borderColor: isDarkMode ? '#38bdf8' : '#2563eb',
      badgeBg: isDarkMode ? '#0c4a6e' : '#dbeafe',
      badgeText: isDarkMode ? '#bae6fd' : '#1d4ed8',
    };
  }
  if (Number.isFinite(value)) {
    return {
      label: 'Skill Practice',
      borderColor: isDarkMode ? '#22c55e' : '#16a34a',
      badgeBg: isDarkMode ? '#14532d' : '#dcfce7',
      badgeText: isDarkMode ? '#86efac' : '#166534',
    };
  }

  return {
    label: 'Study Session',
    borderColor: isDarkMode ? '#374151' : '#e5e7eb',
    badgeBg: isDarkMode ? '#374151' : '#e5e7eb',
    badgeText: isDarkMode ? '#d1d5db' : '#6b7280',
  };
}

function getTaskCategoryBadge(category, complexity, isDarkMode) {
  const normalized = String(category || '').toLowerCase();
  const value = Number(complexity);

  if (normalized === 'stem') {
    return {
      label: value >= 1.5 ? 'High Intensity' : 'STEM Focus',
      badgeBg: isDarkMode ? '#7f1d1d' : '#fee2e2',
      badgeText: isDarkMode ? '#fca5a5' : '#b91c1c',
    };
  }

  if (normalized === 'humanities') {
    return {
      label: 'Deep Reading',
      badgeBg: isDarkMode ? '#0c4a6e' : '#dbeafe',
      badgeText: isDarkMode ? '#bae6fd' : '#1d4ed8',
    };
  }

  return {
    label: 'Skill Practice',
    badgeBg: isDarkMode ? '#14532d' : '#dcfce7',
    badgeText: isDarkMode ? '#86efac' : '#166534',
  };
}
