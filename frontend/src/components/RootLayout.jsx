import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { SidebarTrigger } from './ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabaseClient';
import { useSessionBootstrap } from '../contexts/SessionBootstrapContext';
import {
  LayoutDashboard,
  Map,
  Scroll,
  Users,
  User,
  Settings,
} from 'lucide-react';

export function RootLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionUser, isSessionLoading } = useSessionBootstrap();

  const mobileNavItems = [
    { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
    { icon: Map, label: 'Path', path: '/dashboard/path' },
    { icon: Scroll, label: 'Quests', path: '/dashboard/quests' },
    { icon: Users, label: 'Squad', path: '/dashboard/squad' },
    { icon: User, label: 'Profile', path: '/dashboard/profile' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  ];

  useEffect(() => {
    let isMounted = true;

    const ensureOnboarding = async () => {
      if (isSessionLoading) return;
      if (!sessionUser) {
        navigate('/login', { replace: true });
        return;
      }

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', sessionUser.id)
        .single();

      if (!isMounted) return;

      if (error || !profileData?.onboarding_completed) {
        navigate('/onboarding', { replace: true });
      }
    };

    ensureOnboarding();

    return () => {
      isMounted = false;
    };
  }, [isSessionLoading, navigate, sessionUser]);

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] text-[#334155] transition-colors dark:bg-[#0F172A] dark:text-slate-100">
      {/* Sidebar with menu items */}
      <div className="hidden w-[260px] flex-shrink-0 lg:block">
        <AppSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Toggle */}
        <div className="flex items-center gap-4 border-b border-[#E2E8F0] bg-white/70 px-6 py-4 backdrop-blur-md transition-colors dark:border-[#1E293B] dark:bg-[#0F172A]/80">
          <SidebarTrigger 
            className="hidden rounded-lg p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/60 lg:inline-flex"
          />
          <div className="flex-1">
            <h1 className="text-lg font-semibold">
              Adaptive Study Scheduler
            </h1>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto pb-24 lg:pb-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-[#E2E8F0] bg-white/95 px-3 py-2 backdrop-blur-md transition-colors dark:border-[#1E293B] dark:bg-[#0F172A]/95 lg:hidden">
        {mobileNavItems.map((item) => {
          const active = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${active ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100'}`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
