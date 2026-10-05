import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, Search, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format, isBefore, startOfDay, addDays } from 'date-fns';
import { taskService } from '@/services/api';

interface HeaderProps {
  onMenuClick: () => void;
  isMobile: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, isMobile }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch all tasks once
  const { data: tasks } = useQuery({
    queryKey: ['tasks', 'notifications'],
    queryFn: () => taskService.getAll(),
    refetchInterval: 60_000, // refresh every minute
  });

  // Build the notification list: overdue + due within 7 days, not completed
  const today = startOfDay(new Date());
  const weekAhead = addDays(today, 7);

  const notifications = (tasks || [])
    .filter((t: any) => t.status !== 'Completed' && t.status !== 'Cancelled')
    .map((t: any) => {
      const due = t.due_date ? new Date(t.due_date) : null;
      const isOverdue = due && isBefore(due, today);
      const isDueSoon =
        due && !isOverdue && isBefore(due, weekAhead) && due >= today;
      return { task: t, isOverdue, isDueSoon, due };
    })
    .filter((n: any) => n.isOverdue || n.isDueSoon)
    .sort((a: any, b: any) => {
      // Overdue first, then by date
      if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
      return (a.due?.getTime() || 0) - (b.due?.getTime() || 0);
    });

  const overdueCount = notifications.filter((n: any) => n.isOverdue).length;
  const hasNotifications = notifications.length > 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const handleNotificationClick = (task: any) => {
    setShowNotifications(false);
    navigate('/tasks', { state: { highlightId: task._id || task.id } });
  };

  const badgeClass = overdueCount > 0 ? 'bg-red-500' : 'bg-brand-500';

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 md:px-6 sticky top-0 z-30">
      {isMobile && (
        <button onClick={onMenuClick} className="mr-2 text-gray-500 hover:text-gray-700">
          <Menu size={20} />
        </button>
      )}
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search..."
            className="input pl-10 w-64"
          />
        </div>

        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications((v) => !v)}
            className="text-gray-500 hover:text-gray-700 relative"
            title="Notifications"
          >
            <Bell size={20} />
            {hasNotifications && (
              <span
                className={`absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full text-white text-[10px] flex items-center justify-center font-medium ${badgeClass}`}
              >
                {notifications.length > 9 ? '9+' : notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900 z-50">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                <h3 className="text-sm font-semibold">Notifications</h3>
                {hasNotifications && (
                  <span className="text-xs text-gray-500">
                    {notifications.length} pending
                  </span>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {!hasNotifications ? (
                  <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
                    <CheckCircle size={32} className="text-green-500 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      You're all caught up!
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      No overdue or upcoming tasks.
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                    {notifications.slice(0, 10).map((n: any) => {
                      const t = n.task;
                      return (
                        <li key={t._id || t.id}>
                          <button
                            onClick={() => handleNotificationClick(t)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">
                                {n.isOverdue ? (
                                  <AlertTriangle
                                    size={16}
                                    className="text-red-500"
                                  />
                                ) : (
                                  <Clock size={16} className="text-amber-500" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                  {t.title}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span
                                    className={`text-xs ${
                                      n.isOverdue
                                        ? 'text-red-600 font-medium'
                                        : 'text-gray-500'
                                    }`}
                                  >
                                    {n.isOverdue ? 'Overdue' : 'Due'} —{' '}
                                    {n.due ? format(n.due, 'MMM d') : '—'}
                                  </span>
                                  {t.priority && (
                                    <span className="text-xs text-gray-400">
                                      • {t.priority}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {hasNotifications && (
                <div className="border-t border-gray-100 px-4 py-2 dark:border-gray-800">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/tasks');
                    }}
                    className="w-full text-center text-sm text-brand-600 hover:text-brand-700 py-1"
                  >
                    View all tasks
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-brand-700 text-white flex items-center justify-center text-sm font-medium">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium">{user?.name || 'Admin'}</p>
            <p className="text-xs text-gray-500">
              {format(new Date(), 'EEE, MMM d')}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;