import { useState } from 'react';
import { Outlet } from 'react-router';
import { Sidebar, SidebarContent, SidebarTrigger } from './ui/sidebar';
import { motion } from 'motion/react';

export function RootLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Sidebar */}
      <motion.div
        className={`${sidebarOpen ? 'w-64' : 'w-0'} overflow-hidden transition-all duration-300`}
        initial={{ width: sidebarOpen ? 256 : 0 }}
        animate={{ width: sidebarOpen ? 256 : 0 }}
      >
        <Sidebar className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <SidebarContent />
        </Sidebar>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Toggle */}
        <div className="flex items-center gap-4 px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors">
          <SidebarTrigger 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          />
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
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
