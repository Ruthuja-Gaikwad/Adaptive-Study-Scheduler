import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { SidebarProvider } from './components/ui/sidebar';
import { DarkModeProvider } from './contexts/DarkModeContext';
import {
  SessionBootstrapProvider,
  SessionLoadingOverlay,
} from './contexts/SessionBootstrapContext';

export default function App() {
  return (
    <DarkModeProvider>
      <SessionBootstrapProvider>
        <SidebarProvider>
          <RouterProvider router={router} />
          <SessionLoadingOverlay />
          <Toaster />
        </SidebarProvider>
      </SessionBootstrapProvider>
    </DarkModeProvider>
  );
}
