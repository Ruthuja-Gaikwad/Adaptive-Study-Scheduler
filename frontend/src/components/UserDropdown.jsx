import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Settings, Moon, LogOut, Sun, ChevronUp, Check } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useDarkMode } from '../contexts/DarkModeContext';

export function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { isDarkMode, setDarkMode } = useDarkMode();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Here you would implement logout logic
    console.log('Logging out...');
    setIsOpen(false);
    navigate('/login');
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
          <span className="text-white font-bold text-xs">RJ</span>
        </div>
        <div className="flex-1 text-left">
          <p 
            className="text-sm font-semibold"
            style={{ color: isDarkMode ? '#f9fafb' : '#111827' }}
          >
            Ruthuja
          </p>
          <p 
            className="text-xs"
            style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
          >
            Student
          </p>
        </div>
        <ChevronUp 
          className="w-4 h-4 transition-transform"
          style={{
            color: isDarkMode ? '#9ca3af' : '#6b7280',
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
                  style={{ backgroundColor: isDarkMode ? '#374151' : '#e5e7eb' }}
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
        color: isDanger ? '#dc2626' : (isDarkMode ? '#e5e7eb' : '#6b7280'),
        backgroundColor: isDanger ? (isDarkMode ? '#7f1d1d' : '#fee2e2') : (isDarkMode ? 'transparent' : 'transparent'),
      }}
    >
      <span style={{ 
        color: isDanger ? '#dc2626' : (isDarkMode ? '#9ca3af' : '#6b7280') 
      }}>
        {icon}
      </span>
      <span className="flex-1 font-medium text-sm">{label}</span>
      {rightElement}
    </motion.button>
  );
}

