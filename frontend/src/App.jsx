import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { SidebarProvider } from './components/ui/sidebar';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { CognitiveCheckinProvider } from './contexts/CognitiveCheckinContext';
import {
  SessionBootstrapProvider,
  SessionLoadingOverlay,
} from './contexts/SessionBootstrapContext';

export default function App() {
  return (
    <DarkModeProvider>
      <SessionBootstrapProvider>
        <CognitiveCheckinProvider>
          <SidebarProvider>
            <RouterProvider router={router} />
            <SessionLoadingOverlay />
            <Toaster />
          </SidebarProvider>
        </CognitiveCheckinProvider>
      </SessionBootstrapProvider>
    </DarkModeProvider>
  );
}
