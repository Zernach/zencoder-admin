import { Link, useLocation } from 'react-router';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Bot, 
  Activity, 
  Settings
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/projects', label: 'Projects', icon: FolderKanban },
  { path: '/agents', label: 'Agents', icon: Bot },
  { path: '/runs', label: 'Runs', icon: Activity },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 border-t-4 border-gray-900 bg-white z-30">
      <nav className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center justify-center py-2 px-3 flex-1
                ${isActive ? 'bg-gray-900 text-white' : 'text-gray-600'}
              `}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs uppercase tracking-wide">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
