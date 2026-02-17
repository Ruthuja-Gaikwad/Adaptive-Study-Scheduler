import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const SessionBootstrapContext = createContext({
  sessionUser: null,
  isSessionLoading: true,
});

const getUserFromLocalStorage = () => {
  const authTokenKey = Object.keys(localStorage).find(
    (key) => key.includes('auth-token') && !key.includes('verifier')
  );

  if (!authTokenKey) return null;

  const tokenStr = localStorage.getItem(authTokenKey);
  if (!tokenStr) return null;

  try {
    const parsed = JSON.parse(tokenStr);
    return parsed?.user || parsed?.session?.user || null;
  } catch (err) {
    console.warn('[SESSION] Failed to parse auth token:', err?.message || err);
    return null;
  }
};

export function SessionBootstrapProvider({ children }) {
  const [sessionUser, setSessionUser] = useState(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const setUser = (user) => {
      if (!isMounted) return;
      setSessionUser(user || null);
      setIsSessionLoading(false);
    };

    const localUser = getUserFromLocalStorage();
    if (localUser) {
      setUser(localUser);
    } else {
      supabase.auth
        .getSession()
        .then(({ data }) => {
          setUser(data?.session?.user || null);
        })
        .catch((err) => {
          console.warn('[SESSION] getSession failed:', err?.message || err);
          if (isMounted) setIsSessionLoading(false);
        });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (session?.user) {
          setUser(session.user);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({ sessionUser, isSessionLoading }),
    [sessionUser, isSessionLoading]
  );

  return (
    <SessionBootstrapContext.Provider value={value}>
      {children}
    </SessionBootstrapContext.Provider>
  );
}

export function useSessionBootstrap() {
  return useContext(SessionBootstrapContext);
}

export function SessionLoadingOverlay() {
  const { isSessionLoading } = useSessionBootstrap();

  if (!isSessionLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 backdrop-blur-sm">
      <div className="flex items-center gap-3 rounded-xl bg-white/90 px-4 py-3 text-sm font-medium text-slate-700 shadow-lg">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
        Loading session...
      </div>
    </div>
  );
}
