import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  LogOut,
  Plus,
  Wrench,
  Package,
  FileText,
  Receipt,
  Globe,
  ExternalLink,
  Sliders,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';

export const Topbar = ({ onOpenMobileSidebar, onOpenMobileMenu }) => {
  const { logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const handleOpenMobile = onOpenMobileSidebar || onOpenMobileMenu;
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  const quickActions = [
    { label: 'New Service Job', to: '/jobs/full-service', icon: Wrench, color: 'text-[#0284C7]' },
    { label: 'Add Inventory Item', to: '/inventory', icon: Package, color: 'text-emerald-600' },
    { label: 'Create New Bill', to: '/invoices', icon: FileText, color: 'text-sky-600' },
    { label: 'Record Expense', to: '/expenses', icon: Receipt, color: 'text-amber-600' },
    { label: 'Edit Visiting Website', to: '/settings', icon: Sliders, color: 'text-purple-600' },
  ];

  return (
    <header className="h-16 bg-white/85 backdrop-blur-2xl backdrop-saturate-180 border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-3 select-none shadow-xs">
      {/* Left Context Info */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={handleOpenMobile}
          aria-label="Open Navigation Menu"
          className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 shadow-2xs hover:bg-white transition-all active:scale-90 shrink-0 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand Portal Badge */}
        <Link
          to="/dashboard"
          title="Go to Dashboard"
          className="flex items-center hover:opacity-90 transition-opacity cursor-pointer min-w-0"
        >
          <span className="text-xs bg-sky-50 text-[#0284C7] hover:bg-[#0284C7] hover:text-white font-black px-3.5 py-1.5 rounded-full border border-sky-200 uppercase tracking-wider transition-all shadow-2xs shrink-0">
            {settings?.portalBadgeText || 'ADMIN PORTAL'}
          </span>
        </Link>
      </div>

      {/* Right Controls: Visiting Site, Quick Action, Logout Button */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* 1. Visiting Website Glass Pill */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          title="Open Public Visiting Website"
          className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100/90 hover:bg-white hover:text-[#0284C7] border border-slate-200 shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-[#0284C7]" />
          <span>Visiting Site</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>

        {/* 2. Quick Action Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowQuickMenu(!showQuickMenu)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[#0284C7] to-sky-600 hover:from-[#0369A1] hover:to-sky-700 text-white shadow-md shadow-sky-500/20 border border-sky-400/30 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Quick Action</span>
          </button>

          {showQuickMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowQuickMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-2xl shadow-2xl z-50 p-1.5 animate-in fade-in zoom-in-95 space-y-1">
                <div className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
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
                      className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:text-[#0284C7] hover:bg-sky-50 rounded-xl flex items-center gap-2.5 transition-all cursor-pointer group"
                    >
                      <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-white shadow-2xs transition-colors">
                        <Icon className={`w-3.5 h-3.5 ${act.color}`} />
                      </div>
                      <span className="truncate">{act.label}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* 3. Sleek Direct Logout Button */}
        <button
          type="button"
          onClick={logout}
          title="Sign Out"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-rose-600 bg-slate-100/90 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 shadow-2xs transition-all active:scale-95 cursor-pointer ml-1"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
