import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { SidebarProvider } from './components/ui/sidebar';
import { DarkModeProvider } from './contexts/DarkModeContext';

export default function App() {
  return (
    <DarkModeProvider>
      <SidebarProvider>
        <RouterProvider router={router} />
        <Toaster />
      </SidebarProvider>
    </DarkModeProvider>
  );
}
