import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Grid,
  Sprout,
  ClipboardList,
  Droplets,
  Leaf,
  Wallet,
  Package,
  Wrench,
  CheckSquare,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const navSections = [
  {
    label: 'Overview',
    items: [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Farm Management',
    items: [
      { to: '/farms', label: 'Farms', icon: MapPin },
      { to: '/fields', label: 'Fields / Blocks', icon: Grid },
      { to: '/crops', label: 'Crops', icon: Sprout },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/activities', label: 'Activities', icon: ClipboardList },
      { to: '/spraying', label: 'Spraying', icon: Droplets },
      { to: '/fertilizers', label: 'Fertilizers', icon: Leaf },
      { to: '/harvests', label: 'Harvests', icon: Package },
    ],
  },
  {
    label: 'Finance',
    items: [{ to: '/expenses', label: 'Expenses', icon: Wallet }],
  },
  {
    label: 'Resources',
    items: [
      { to: '/inventory', label: 'Inventory', icon: Package },
      { to: '/equipment', label: 'Equipment', icon: Wrench },
    ],
  },
  {
    label: 'Planning',
    items: [{ to: '/tasks', label: 'Tasks & Reminders', icon: CheckSquare }],
  },
  {
    label: 'Analytics',
    items: [
      { to: '/reports', label: 'Reports', icon: BarChart3 },
    ],
  },
];

const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="fixed inset-y-0 left-0 w-[260px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col z-40">
      <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
        <img src="/logo.svg" alt="Randark Farms" className="h-8 w-8 mr-2" />
        <span className="font-semibold text-lg text-gray-900 dark:text-white">Randark Farms</span>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        {navSections.map((section) => (
          <div key={section.label} className="mb-4">
            <p className="px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {section.label}
            </p>
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center px-6 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                  )
                }
              >
                <item.icon size={18} className="mr-3" />
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <NavLink
          to="/settings"
          className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <Settings size={18} className="mr-3" />
          Settings
        </NavLink>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <LogOut size={18} className="mr-3" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;