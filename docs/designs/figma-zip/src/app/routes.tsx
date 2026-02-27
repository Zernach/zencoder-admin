import { createBrowserRouter } from 'react-router';
import { RootLayout } from './components/layout/RootLayout';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { Agents } from './pages/Agents';
import { Runs } from './pages/Runs';
import { RunDetail } from './pages/RunDetail';
import { Costs } from './pages/Costs';
import { Governance } from './pages/Governance';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'projects', Component: Projects },
      { path: 'projects/:id', Component: ProjectDetail },
      { path: 'agents', Component: Agents },
      { path: 'agents/:id', Component: Agents }, // Agent detail (reusing Agents for wireframe)
      { path: 'runs', Component: Runs },
      { path: 'runs/:id', Component: RunDetail },
      { path: 'costs', Component: Costs },
      { path: 'governance', Component: Governance },
      { path: 'settings', Component: Settings },
      { path: '*', Component: NotFound },
    ],
  },
]);