import { useNavigate, useLocation } from 'react-router';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from './ui/sidebar';
import { UserDropdown } from './UserDropdown';
import {
  LayoutDashboard,
  Map,
  Scroll,
  Users,
  User,
  Settings,
} from 'lucide-react';

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Map, label: 'Learning Path', path: '/dashboard/path' },
    { icon: Scroll, label: 'Quests', path: '/dashboard/quests' },
    { icon: Users, label: 'Study Squad', path: '/dashboard/squad' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <Sidebar
      className="flex h-screen flex-col border-r border-[#E2E8F0] bg-white/80 text-slate-700 dark:border-[#1E293B] dark:bg-[#0F172A] dark:text-slate-200"
    >
      {/* Logo/Header */}
      <SidebarHeader className="border-b border-[#E2E8F0] px-4 py-6 dark:border-[#1E293B]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AS</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Study
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Scheduler
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* Main Navigation - Flex grow to push footer down */}
      <SidebarContent className="flex-1 px-3 py-4 overflow-y-auto">
        <SidebarMenu>
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  onClick={() => navigate(item.path)}
                  className={`cursor-pointer rounded-lg transition-colors ${active ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60'}`}
                >
                  <button className="flex items-center gap-3 w-full px-3 py-2">
                    <item.icon
                      className={`w-5 h-5 flex-shrink-0 ${active ? 'text-indigo-600 dark:text-indigo-200' : 'text-slate-500 dark:text-slate-400'}`}
                    />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

        <SidebarSeparator className="my-4 bg-[#E2E8F0] dark:bg-[#1E293B]" />

        {/* Settings and Profile */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/dashboard/profile')}
              onClick={() => navigate('/dashboard/profile')}
              className={`cursor-pointer rounded-lg transition-colors ${isActive('/dashboard/profile') ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60'}`}
            >
              <button className="flex items-center gap-3 w-full px-3 py-2">
                <User className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">Profile</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/dashboard/settings')}
              onClick={() => navigate('/dashboard/settings')}
              className={`cursor-pointer rounded-lg transition-colors ${isActive('/dashboard/settings') ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60'}`}
            >
              <button className="flex items-center gap-3 w-full px-3 py-2">
                <Settings className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">Settings</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      {/* Footer with User Info - Sticky at bottom */}
      <SidebarFooter className="border-t border-[#E2E8F0] px-3 py-4 dark:border-[#1E293B]">
        <UserDropdown />
      </SidebarFooter>
    </Sidebar>
  );
}
