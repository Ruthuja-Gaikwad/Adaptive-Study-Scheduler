import { createContext, useContext, useEffect, useState } from 'react';

const DarkModeContext = createContext(undefined);

// Apply theme synchronously before React renders
function applyThemeSynchronously() {
  if (typeof window === 'undefined') return false;
  
  const saved = localStorage.getItem('darkMode');
  const isDark = saved === 'true';
  
  const html = document.documentElement;
  if (isDark) {
    html.classList.add('dark');
    html.style.colorScheme = 'dark';
  } else {
    html.classList.remove('dark');
    html.style.colorScheme = 'light';
  }
  
  console.log('⚡ Theme applied synchronously on page load:', isDark ? '🌙 Dark' : '☀️ Light');
  return isDark;
}

export function DarkModeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Force clear any old dark mode setting on first load
    if (typeof window !== 'undefined') {
      // Check if localStorage has dark mode set
      const saved = localStorage.getItem('darkMode');
      
      // If not explicitly saved, default to light mode (false)
      if (saved === null) {
        localStorage.setItem('darkMode', 'false');
      }
      
      // Apply theme immediately
      applyThemeSynchronously();
      
      // Parse the saved value
      return saved === 'true';
    }
    
    return false;
  });

  // Initialize and sync with document element on mount (backup)
  useEffect(() => {
    // Ensure document starts in correct state
    updateDarkMode(isDarkMode);
  }, []);

  // Update whenever isDarkMode changes
  useEffect(() => {
    updateDarkMode(isDarkMode);
  }, [isDarkMode]);

  function updateDarkMode(isDark) {
    // Update localStorage
    localStorage.setItem('darkMode', isDark.toString());
    
    // Update document element class
    const html = document.documentElement;
    
    // Ensure clean state
    html.classList.remove('dark');
    
    // Apply the correct class
    if (isDark) {
      html.classList.add('dark');
      html.style.colorScheme = 'dark';
    } else {
      html.style.colorScheme = 'light';
    }
    
    // Force repaint by accessing offsetHeight
    void html.offsetHeight;
    
    // Log for debugging
    console.log('🌙 Dark Mode:', isDark);
    console.log('📝 Document has "dark" class:', html.classList.contains('dark'));
    console.log('📝 HTML classList:', html.className);
    console.log('🎨 Color Scheme:', html.style.colorScheme);
  }

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newValue = !prev;
      console.log('🔄 Toggling dark mode from', prev, 'to', newValue);
      // Apply immediately
      if (typeof window !== 'undefined') {
        updateDarkMode(newValue);
      }
      return newValue;
    });
  };

  const setDarkMode = (value) => {
    const boolValue = Boolean(value);
    console.log('🔄 Setting dark mode to', boolValue);
    setIsDarkMode(boolValue);
    // Apply immediately
    if (typeof window !== 'undefined') {
      updateDarkMode(boolValue);
    }
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode, setDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
}
