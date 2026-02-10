import { createBrowserRouter } from 'react-router';
import { RootLayout } from './components/RootLayout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import { GPSView } from './components/GPSView.jsx';
import { Quests } from './components/Quests.jsx';
import { StudySquad } from './components/StudySquad.jsx';
import { Profile } from './pages/Profile.jsx';
import { Settings } from './pages/Settings.jsx';
import { Landing } from './pages/Landing.jsx';
import { Login } from './pages/Login.jsx';
import { Signup } from './pages/Signup.jsx';
import { Onboarding } from './pages/Onboarding.jsx';
import { Loading } from './pages/Loading.jsx';
import { NotFound } from './components/NotFound.jsx';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Landing,
  },
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/signup',
    Component: Signup,
  },
  {
    path: '/onboarding',
    Component: Onboarding,
  },
  {
    path: '/loading',
    Component: Loading,
  },
  {
    path: '/dashboard',
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: Dashboard,
      },
      {
        path: 'path',
        Component: GPSView,
      },
      {
        path: 'quests',
        Component: Quests,
      },
      {
        path: 'squad',
        Component: StudySquad,
      },
      {
        path: 'profile',
        Component: Profile,
      },
      {
        path: 'settings',
        Component: Settings,
      },
    ],
  },
  {
    path: '*',
    Component: NotFound,
  },
]);
