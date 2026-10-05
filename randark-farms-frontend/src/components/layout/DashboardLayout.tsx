import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close mobile nav on route change
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname, isMobile]);

  // Lock body scroll when mobile nav is open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {!isMobile && <Sidebar />}
      {isMobile && (
        <MobileNav isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}

      <div
        className={`${
          !isMobile ? 'ml-[260px]' : ''
        } flex flex-col min-h-screen transition-[margin] duration-300 ease-out`}
      >
        <Header onMenuClick={() => setSidebarOpen(true)} isMobile={isMobile} />

        <main className="flex-1 w-full">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-5 md:px-6 md:py-6 lg:px-8">
            {children}
          </div>
        </main>

        <footer className="border-t border-gray-100 dark:border-gray-800 py-4 px-6">
          <div className="mx-auto max-w-[1600px] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
            <span>© {new Date().getFullYear()} Randark Farms. All rights reserved.</span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              System operational
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;