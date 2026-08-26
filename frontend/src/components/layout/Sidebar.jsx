import React from 'react';
import { NavLink } from 'react-router-dom';
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
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const Sidebar = ({ onClose }) => {
  const { logout, user } = useAuth();

  const mainNavItems = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Products / Inventory', to: '/inventory', icon: Package },
    { label: 'Suppliers Directory', to: '/suppliers', icon: Truck },
    { label: 'Supplier Orders', to: '/supplier-orders', icon: ShoppingCart },
    { label: 'Full Service', to: '/jobs/full-service', icon: Wrench },
    { label: 'Engine Jobs', to: '/jobs/engine-job', icon: Flame },
    { label: 'Bills', to: '/invoices', icon: FileText },
    { label: 'Customer Outstanding', to: '/outstanding', icon: CreditCard, highlight: true },
    { label: 'Operating Expenses', to: '/expenses', icon: Receipt },
    { label: 'Settlement Calculator', to: '/calculator', icon: Calculator },
  ];

  const renderLink = (item) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.to}
        to={item.to}
        onClick={onClose}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
            isActive
              ? 'bg-[#4F46E5] dark:bg-[#6366F1] text-white font-extrabold shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
          }`
        }
      >
        <Icon className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-105" />
        <span className="truncate">{item.label}</span>
        {item.highlight && (
          <span className="ml-auto text-[10px] bg-rose-600 dark:bg-rose-500 text-white px-1.5 py-0.5 rounded font-bold shadow-2xs">
            Due
          </span>
        )}
      </NavLink>
    );
  };

  return (
    <aside className="w-64 bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-[#263449] flex flex-col h-full select-none transition-colors duration-200">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-slate-100 dark:border-[#263449] flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="w-9 h-9 rounded-xl bg-[#4F46E5] dark:bg-[#6366F1] flex items-center justify-center text-white font-black text-base shadow-sm">
          N
        </div>
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight leading-none uppercase">
            National Auto
          </h2>
          <span className="text-[10px] font-extrabold text-[#4F46E5] dark:text-[#818CF8] tracking-widest uppercase mt-0.5 block">
            Garage Workshop
          </span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        <div>
          <div className="px-3 pb-2 text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
            Workshop Operations
          </div>
          <div className="space-y-1">{mainNavItems.map(renderLink)}</div>
        </div>
      </div>

      {/* System Admin Status & Logout Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-[#263449] bg-slate-50/60 dark:bg-slate-900/60 space-y-2">
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-[#172033] border border-slate-200/80 dark:border-[#263449] shadow-2xs">
          <div className="w-7 h-7 rounded-lg bg-[#4F46E5] dark:bg-[#6366F1] text-white font-bold text-xs flex items-center justify-center">
            {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100 truncate">
              {user?.username ? `@${user.username}` : 'System Admin'}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Admin Session Active
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (onClose) onClose();
            logout();
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/50 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out of Workshop
        </button>
      </div>
    </aside>
  );
};
