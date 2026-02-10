import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { SidebarTrigger } from './ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabaseClient';

export function RootLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const ensureSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      if (!data?.session) {
        navigate('/login', { replace: true });
        return;
      }

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', data.session.user.id)
        .single();

      if (!isMounted) return;

      if (error || !profileData?.onboarding_completed) {
        navigate('/onboarding', { replace: true });
      }
    };

    ensureSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!session) {
          navigate('/login', { replace: true });
          return;
        }

        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .single();

        if (error || !profileData?.onboarding_completed) {
          navigate('/onboarding', { replace: true });
        }
      }
    );

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] text-[#334155] transition-colors dark:bg-[#0F172A] dark:text-slate-100">
      {/* Sidebar with menu items */}
      <AppSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Toggle */}
        <div className="flex items-center gap-4 border-b border-[#E2E8F0] bg-white/70 px-6 py-4 backdrop-blur-md transition-colors dark:border-[#1E293B] dark:bg-[#0F172A]/80">
          <SidebarTrigger 
            className="rounded-lg p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/60"
          />
          <div className="flex-1">
            <h1 className="text-lg font-semibold">
              Adaptive Study Scheduler
            </h1>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
