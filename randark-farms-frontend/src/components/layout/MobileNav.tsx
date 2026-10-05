import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  ClipboardList,
  CheckSquare,
  X,
  Grid,
  Sprout,
  Droplets,
  Leaf,
  Wallet,
  Package,
  Wrench,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/farms', label: 'Farms', icon: MapPin },
    { to: '/fields', label: 'Fields', icon: Grid },
    { to: '/crops', label: 'Crops', icon: Sprout },
    { to: '/activities', label: 'Activities', icon: ClipboardList },
    { to: '/spraying', label: 'Spraying', icon: Droplets },
    { to: '/fertilizers', label: 'Fertilizers', icon: Leaf },
    { to: '/expenses', label: 'Expenses', icon: Wallet },
    { to: '/harvests', label: 'Harvests', icon: Package },
    { to: '/inventory', label: 'Inventory', icon: Package },
    { to: '/equipment', label: 'Equipment', icon: Wrench },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/reports', label: 'Reports', icon: BarChart3 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 w-64 max-w-xs h-full overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center">
            <img src="/logo.svg" alt="Randark Farms" className="h-8 w-8 mr-2" />
            <span className="font-semibold">Randark Farms</span>
          </div>
          <button onClick={onClose} className="text-gray-500">
            <X size={20} />
          </button>
        </div>
        <nav className="mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center px-4 py-2.5 text-sm font-medium',
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )
              }
            >
              <item.icon size={18} className="mr-3" />
              {item.label}
            </NavLink>
          ))}
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <LogOut size={18} className="mr-3" />
            Logout
          </button>
        </nav>
      </div>
    </div>
  );
};

export default MobileNav;