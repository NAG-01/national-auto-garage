import React from 'react';
import { Menu, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const Topbar = ({ onOpenMobileSidebar, onOpenMobileMenu }) => {
  const { logout, user } = useAuth();
  const handleOpenMobile = onOpenMobileSidebar || onOpenMobileMenu;

  return (
    <header className="h-16 bg-white border-b border-[#BAE6FD] sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-4 select-none">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={handleOpenMobile}
          aria-label="Open Navigation Menu"
          className="lg:hidden p-2 rounded-xl text-[#0C4A6E] hover:text-[#0284C7] hover:bg-[#E0F2FE] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Current Garage System Context */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-extrabold text-[#0C4A6E] hidden sm:inline-block">
            National Auto Garage
          </span>
          <span className="text-[10px] bg-[#E0F2FE] text-[#0284C7] font-extrabold px-2.5 py-0.5 rounded-full border border-[#BAE6FD] uppercase">
            Admin Portal
          </span>
        </div>
      </div>

      {/* Right Controls: Admin Info & Logout */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="flex items-center gap-2.5 pl-2.5 sm:pl-3 border-l border-[#BAE6FD]">
          <div className="w-8 h-8 rounded-xl bg-[#0284C7] text-white font-black text-xs flex items-center justify-center shadow-xs">
            {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-extrabold text-[#0C4A6E]">
              {user?.username ? `@${user.username}` : 'Administrator'}
            </div>
            <div className="text-[10px] text-[#0284C7] flex items-center gap-0.5 font-bold">
              <Shield className="w-2.5 h-2.5 text-[#0284C7]" />
              Full Workshop Admin
            </div>
          </div>
        </div>

        {/* Logout Action Button */}
        <button
          type="button"
          onClick={logout}
          title="Sign Out of Workshop"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#0C4A6E] hover:text-rose-700 hover:bg-rose-50 border border-[#BAE6FD] hover:border-rose-200 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 ml-1"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
