import React from 'react';
import { Menu, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ThemeToggle } from '../ui/ThemeToggle.jsx';

export const Topbar = ({ onOpenMobileSidebar, onOpenMobileMenu }) => {
  const { logout, user } = useAuth();
  const handleOpenMobile = onOpenMobileSidebar || onOpenMobileMenu;

  return (
    <header className="h-16 bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-[#263449] sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-4 select-none transition-colors duration-200">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={handleOpenMobile}
          aria-label="Open Navigation Menu"
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Current Garage System Context */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 hidden sm:inline-block">
            National Auto Garage
          </span>
          <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-extrabold px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800/80 uppercase">
            Admin Portal
          </span>
        </div>
      </div>

      {/* Right Controls: Theme Toggle, Admin Info & Logout */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Global Light / Dark Mode Toggle */}
        <ThemeToggle />

        <div className="flex items-center gap-2.5 pl-2.5 sm:pl-3 border-l border-slate-200 dark:border-slate-700">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
            {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
              {user?.username ? `@${user.username}` : 'Administrator'}
            </div>
            <div className="text-[10px] text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 font-bold">
              <Shield className="w-2.5 h-2.5 text-indigo-600 dark:text-indigo-400" />
              Full Workshop Admin
            </div>
          </div>
        </div>

        {/* Logout Action Button */}
        <button
          type="button"
          onClick={logout}
          title="Sign Out of Workshop"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-900/50 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 ml-1"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
