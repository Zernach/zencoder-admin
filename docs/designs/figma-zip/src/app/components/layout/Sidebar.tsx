import { Link, useLocation } from 'react-router';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Bot, 
  Activity, 
  DollarSign, 
  Shield, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/projects', label: 'Projects', icon: FolderKanban },
  { path: '/agents', label: 'Agents', icon: Bot },
  { path: '/runs', label: 'Runs', icon: Activity },
  { path: '/costs', label: 'Costs', icon: DollarSign },
  { path: '/governance', label: 'Governance', icon: Shield },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 border-2 border-gray-900 bg-white hover:bg-gray-100 transition-colors shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 border-r-4 border-gray-900 bg-white
        transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        shadow-2xl lg:shadow-none
      `}>
        <div className="p-6 border-b-4 border-gray-900">
          <div className="text-xl font-bold text-gray-900">
            AGENT ANALYTICS
          </div>
          <div className="text-xs text-gray-500 mt-1 uppercase tracking-wide">
            Org Dashboard
          </div>
        </div>
        <nav className="p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
                            (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 mb-2
                  border-2 transition-all duration-150
                  ${isActive 
                    ? 'border-gray-900 bg-gray-900 text-white shadow-md' 
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium uppercase tracking-wide">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t-2 border-gray-300 bg-gray-50">
          <div className="text-xs text-gray-500">
            <div className="font-medium">Acme Corp</div>
            <div className="mt-1">admin@acme.com</div>
          </div>
        </div>
      </div>
    </>
  );
}