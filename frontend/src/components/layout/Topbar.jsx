import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, ShieldCheck, LogOut, Activity, Plus, Wrench, Package, FileText, Receipt } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';

export const Topbar = ({ onOpenMobileSidebar, onOpenMobileMenu }) => {
  const { logout, user } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const handleOpenMobile = onOpenMobileSidebar || onOpenMobileMenu;
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  const quickActions = [
    { label: 'New Service Job', to: '/jobs/full-service', icon: Wrench, color: 'text-indigo-600' },
    { label: 'Add Inventory Item', to: '/inventory', icon: Package, color: 'text-emerald-600' },
    { label: 'Create New Bill', to: '/invoices', icon: FileText, color: 'text-sky-600' },
    { label: 'Record Expense', to: '/expenses', icon: Receipt, color: 'text-amber-600' },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-4 select-none shadow-2xs">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={handleOpenMobile}
          aria-label="Open Navigation Menu"
          className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Current Context (Clickable Link to Dashboard) */}
        <Link
          to="/dashboard"
          title="Go to Dashboard"
          className="flex items-center gap-2.5 hover:opacity-85 transition-opacity cursor-pointer group"
        >
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span className="group-hover:text-slate-900 transition-colors">
              {settings?.topbarContextText || 'Workshop System'}
            </span>
            <span className="text-slate-300">•</span>
          </div>
          <span className="text-xs bg-sky-50 text-[#0284C7] group-hover:bg-[#0284C7] group-hover:text-white font-extrabold px-3 py-1 rounded-full border border-sky-200 uppercase tracking-wider transition-all shadow-2xs">
            {settings?.portalBadgeText || 'ADMIN PORTAL'}
          </span>
        </Link>
      </div>

      {/* Right Controls: Quick Action Menu, Admin User & Logout Button */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Action Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowQuickMenu(!showQuickMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-2xs transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Quick Action</span>
          </button>

          {showQuickMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowQuickMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-1.5 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Create / Add New
                </div>
                {quickActions.map((act) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={act.to}
                      type="button"
                      onClick={() => {
                        setShowQuickMenu(false);
                        navigate(act.to);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                    >
                      <Icon className={`w-4 h-4 ${act.color}`} />
                      <span>{act.label}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* User Profile (Clickable Link to Dashboard) */}
        <Link
          to="/dashboard"
          title="Go to Dashboard"
          className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200 hover:opacity-85 transition-opacity cursor-pointer"
        >
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
        </Link>

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
