import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Wrench,
  Flame,
  Package,
  Truck,
  ShoppingCart,
  FileText,
  CreditCard,
  Receipt,
  Calculator,
  Tag,
  BookOpen,
  Sliders,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';

export const Sidebar = ({ onClose }) => {
  const { logout, user } = useAuth();
  const { settings } = useSettings();

  const mainNavItems = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Products / Inventory', to: '/inventory', icon: Package },
    { label: 'Suppliers Directory', to: '/suppliers', icon: Truck },
    { label: 'Supplier Orders', to: '/supplier-orders', icon: ShoppingCart },
    { label: 'Full Service', to: '/jobs/full-service', icon: Wrench },
    { label: 'Engine Jobs', to: '/jobs/engine-job', icon: Flame },
    { label: 'Bills & Invoices', to: '/invoices', icon: FileText },
    { label: 'Customer Outstanding', to: '/outstanding', icon: CreditCard, highlight: true },
    { label: 'Operating Expenses', to: '/expenses', icon: Receipt },
    { label: 'Settlement Calculator', to: '/calculator', icon: Calculator },
    { label: 'Smart Keywords Master', to: '/keywords', icon: Tag },
    { label: 'Settings & Website CMS', to: '/settings', icon: Sliders },
    { label: 'User Guide & Docs', to: '/help', icon: BookOpen },
  ];

  const renderLink = (item) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.to}
        to={item.to}
        onClick={onClose}
        className={({ isActive }) =>
          `flex items-center gap-3.5 px-4 py-3 sm:py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 group cursor-pointer ${
            isActive
              ? 'bg-gradient-to-r from-[#0284C7] to-sky-600 text-white font-black shadow-lg shadow-sky-900/40 scale-[1.02] border border-sky-400/30'
              : 'text-slate-400 hover:text-white hover:bg-white/10'
          }`
        }
      >
        <Icon className="w-4.5 h-4.5 flex-shrink-0 transition-transform group-hover:scale-110" />
        <span className="truncate flex-1 tracking-tight">{item.label}</span>
        {item.highlight && (
          <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider shadow-xs animate-pulse shrink-0">
            Due
          </span>
        )}
      </NavLink>
    );
  };

  return (
    <aside className="w-full md:w-68 bg-slate-950/95 backdrop-blur-2xl text-slate-100 flex flex-col h-full select-none border-r border-slate-800/80 shadow-2xl">
      {/* Brand Header (Aligned to h-16 = 64px) */}
      <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/60 shrink-0">
        <Link
          to="/dashboard"
          onClick={onClose}
          title="Go to Dashboard"
          className="flex items-center gap-3 min-w-0 group cursor-pointer flex-1"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#0284C7] via-sky-500 to-blue-700 group-hover:scale-105 transition-transform flex items-center justify-center text-white font-black text-sm shadow-md shadow-sky-500/30 ring-2 ring-white/10 shrink-0">
            {settings?.brandNameMain ? settings.brandNameMain.charAt(0).toUpperCase() : 'N'}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-black text-white tracking-tight leading-none uppercase truncate group-hover:text-sky-400 transition-colors">
              {settings?.brandNameMain || 'National Auto'}
            </h2>
            <span className="text-[10px] font-extrabold text-sky-400 tracking-wider uppercase mt-1 block truncate">
              {settings?.brandNameSub || 'Garage Portal'}
            </span>
          </div>
        </Link>

        {/* Mobile Close X Button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Sidebar"
            className="md:hidden p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-rose-600 transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation Links with Hidden Scrollbars */}
      <div className="flex-1 px-3.5 py-4 space-y-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div>
          <div className="px-3 pb-2 text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
            <span>Workshop Operations</span>
          </div>
          <div className="space-y-1.5">{mainNavItems.map(renderLink)}</div>
        </div>
      </div>

      {/* System Admin Status & Logout Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/80 space-y-2.5 shrink-0 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800/80 backdrop-blur-md shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0284C7] to-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0 ring-1 ring-white/20">
            {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-black text-white truncate" title={user?.username ? `@${user.username}` : 'System Admin'}>
              {user?.username ? `@${user.username}` : 'System Admin'}
            </div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Session Active
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (onClose) onClose();
            logout();
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-900 hover:bg-rose-600 border border-slate-800 hover:border-rose-500 transition-all duration-200 cursor-pointer shadow-xs active:scale-98"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
