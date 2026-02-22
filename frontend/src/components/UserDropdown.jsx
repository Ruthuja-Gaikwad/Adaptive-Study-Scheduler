import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Settings, Moon, LogOut, Sun, ChevronUp, Check } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useDarkMode } from '../contexts/DarkModeContext';
import { toast } from 'sonner';
import { supabase } from '../lib/supabaseClient';

export function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [roleLabel, setRoleLabel] = useState('Student');
  const { isDarkMode, setDarkMode } = useDarkMode();
  const navigate = useNavigate();

  const initials = useMemo(() => {
    if (!displayName) return 'U';
    const parts = displayName.trim().split(/\s+/).slice(0, 2);
    return parts.map((part) => part[0]).join('').toUpperCase();
  }, [displayName]);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (!isMounted) return;

      if (data?.full_name) {
        setDisplayName(data.full_name);
      } else {
        setDisplayName(user.email?.split('@')[0] || 'User');
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setIsOpen(false);
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error('Unable to sign out. Please try again.');
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
        }}
      >
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-xs">{initials}</span>
        </div>
        <div className="flex-1 text-left">
          <p 
            className="text-sm font-semibold"
            style={{ color: isDarkMode ? '#f9fafb' : '#0f172a' }}
          >
            {displayName || 'User'}
          </p>
          <p 
            className="text-xs"
            style={{ color: isDarkMode ? '#9ca3af' : '#475569' }}
          >
            {roleLabel}
          </p>
        </div>
        <ChevronUp 
          className="w-4 h-4 transition-transform"
          style={{
            color: isDarkMode ? '#9ca3af' : '#475569',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }}
        />
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu */}
            <motion.div
              className="absolute bottom-full left-0 right-0 mb-2 z-50"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              <div 
                className="rounded-lg shadow-lg border overflow-hidden"
                style={{
                  backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                  borderColor: isDarkMode ? '#374151' : '#f3f4f6'
                }}
              >
                {/* Menu Items */}
                <div className="py-2">
                  <MenuItem
                    icon={<User className="w-4 h-4" />}
                    label="My Profile"
                    onClick={() => handleNavigate('/dashboard/profile')}
                    isDarkMode={isDarkMode}
                  />
                  <MenuItem
                    icon={<Settings className="w-4 h-4" />}
                    label="Account Settings"
                    onClick={() => handleNavigate('/dashboard/settings')}
                    isDarkMode={isDarkMode}
                  />
                  <MenuItem
                    icon={<Sun className="w-4 h-4" />}
                    label="Light Mode"
                    onClick={() => setDarkMode(false)}
                    isDarkMode={isDarkMode}
                    rightElement={!isDarkMode ? <Check className="w-4 h-4 text-emerald-500" /> : null}
                  />
                  <MenuItem
                    icon={<Moon className="w-4 h-4" />}
                    label="Dark Mode"
                    onClick={() => setDarkMode(true)}
                    isDarkMode={isDarkMode}
                    rightElement={isDarkMode ? <Check className="w-4 h-4 text-emerald-500" /> : null}
                  />
                </div>

                {/* Divider */}
                <div 
                  className="h-px my-1"
                  style={{ backgroundColor: isDarkMode ? '#374151' : '#e2e8f0' }}
                />

                {/* Logout */}
                <div className="py-2">
                  <MenuItem
                    icon={<LogOut className="w-4 h-4" />}
                    label="Log Out"
                    onClick={handleLogout}
                    variant="danger"
                    isDarkMode={isDarkMode}
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItem({ icon, label, onClick, variant = 'default', rightElement, isDarkMode }) {
  const isDanger = variant === 'danger';
  
  return (
    <motion.button
      className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left"
      onClick={onClick}
      whileHover={{ x: 2 }}
      transition={{ duration: 0.15 }}
      style={{
        color: isDanger ? '#dc2626' : (isDarkMode ? '#e5e7eb' : '#475569'),
        backgroundColor: isDanger ? (isDarkMode ? '#7f1d1d' : '#fee2e2') : (isDarkMode ? 'transparent' : 'transparent'),
      }}
    >
      <span style={{ 
        color: isDanger ? '#dc2626' : (isDarkMode ? '#9ca3af' : '#475569') 
      }}>
        {icon}
      </span>
      <span className="flex-1 font-medium text-sm">{label}</span>
      {rightElement}
    </motion.button>
  );
}

