import React from 'react';
import { Menu, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Badge } from '../ui/Badge.jsx';

export const Topbar = ({ onOpenMobileSidebar, onOpenMobileMenu }) => {
  const { logout, user } = useAuth();
  const handleOpenMobile = onOpenMobileSidebar || onOpenMobileMenu;

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-4 select-none">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={handleOpenMobile}
          aria-label="Open Navigation Menu"
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Current Garage System Context */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-900 hidden sm:inline-block">
            National Auto Garage
          </span>
          <Badge variant="neutral" size="sm">
            Admin Portal
          </Badge>
        </div>
      </div>

      {/* Admin Area & Logout */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-900">
              {user?.username ? `@${user.username}` : 'Administrator'}
            </div>
            <div className="text-[10px] text-slate-500 flex items-center gap-0.5 font-medium">
              <Shield className="w-2.5 h-2.5 text-orange-600" />
              Full Workshop Admin
            </div>
          </div>
        </div>

        {/* Logout Action Button */}
        <button
          type="button"
          onClick={logout}
          title="Sign Out of Workshop"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 ml-1"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
