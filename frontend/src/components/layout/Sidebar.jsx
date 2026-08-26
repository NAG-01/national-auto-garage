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
              ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-100'
              : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/70'
          }`
        }
      >
        <Icon className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-105" />
        <span className="truncate">{item.label}</span>
        {item.highlight && (
          <span className="ml-auto text-[10px] bg-rose-500 text-white px-1.5 py-0.5 rounded font-bold shadow-2xs">
            Due
          </span>
        )}
      </NavLink>
    );
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white font-black text-base shadow-md shadow-indigo-200">
          N
        </div>
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 tracking-tight leading-none uppercase">
            National Auto
          </h2>
          <span className="text-[10px] font-bold text-indigo-600 tracking-widest uppercase mt-0.5 block">
            Garage Workshop
          </span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        <div>
          <div className="px-3 pb-1.5 text-[10px] font-extrabold text-indigo-600/80 uppercase tracking-wider">
            Workshop Operations
          </div>
          <div className="space-y-1">{mainNavItems.map(renderLink)}</div>
        </div>
      </div>

      {/* System Admin Status & Logout Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/60 space-y-2">
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
          <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
            {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-slate-900 truncate">
              {user?.username ? `@${user.username}` : 'System Admin'}
            </div>
            <div className="text-[10px] text-slate-500 flex items-center gap-1">
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
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out of Workshop
        </button>
      </div>
    </aside>
  );
};
