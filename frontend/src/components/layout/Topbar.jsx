import React from 'react';
import { Menu, ShieldCheck, LogOut, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const Topbar = ({ onOpenMobileSidebar, onOpenMobileMenu }) => {
  const { logout, user } = useAuth();
  const handleOpenMobile = onOpenMobileSidebar || onOpenMobileMenu;

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-4 select-none shadow-2xs">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={handleOpenMobile}
          aria-label="Open Navigation Menu"
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Current Context (Clean, non-repetitive) */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span>Workshop System</span>
            <span className="text-slate-300">•</span>
          </div>
          <span className="text-xs bg-sky-50 text-[#0284C7] font-extrabold px-3 py-1 rounded-full border border-sky-200 uppercase tracking-wider">
            Admin Portal
          </span>
        </div>
      </div>

      {/* Right Controls: Admin User & Logout Button */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-xl bg-[#0284C7] text-white font-black text-xs flex items-center justify-center shadow-2xs shrink-0">
            {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="hidden sm:block text-left leading-tight">
            <div className="text-xs font-extrabold text-slate-900">
              {user?.username ? `@${user.username}` : 'Administrator'}
            </div>
            <div className="text-[10px] text-slate-500 flex items-center gap-1 font-medium mt-0.5">
              <ShieldCheck className="w-3 h-3 text-[#0284C7]" />
              Workshop Admin
            </div>
          </div>
        </div>

        {/* Sleek Logout Button */}
        <button
          type="button"
          onClick={logout}
          title="Sign Out"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-all focus:outline-none focus:ring-2 focus:ring-rose-500"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
