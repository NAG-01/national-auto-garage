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
  LogOut,
  ShieldCheck,
  ChevronRight,
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
    { label: 'Bills & Invoices', to: '/invoices', icon: FileText },
    { label: 'Customer Outstanding', to: '/outstanding', icon: CreditCard, highlight: true },
    { label: 'Operating Expenses', to: '/expenses', icon: Receipt },
    { label: 'Settlement Calculator', to: '/calculator', icon: Calculator },
    { label: 'Smart Keywords Master', to: '/keywords', icon: Tag },
  ];

  const renderLink = (item) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.to}
        to={item.to}
        onClick={onClose}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
            isActive
              ? 'bg-[#0284C7] text-white font-extrabold shadow-md shadow-sky-900/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`
        }
      >
        <Icon className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110" />
        <span className="truncate flex-1">{item.label}</span>
        {item.highlight && (
          <span className="text-[10px] bg-rose-500/90 text-white px-1.5 py-0.5 rounded font-bold shadow-2xs">
            Due
          </span>
        )}
      </NavLink>
    );
  };

  return (
    <aside className="w-64 bg-[#0F172A] text-slate-100 flex flex-col h-full select-none border-r border-slate-800">
      {/* Brand Header (Clickable Link to Dashboard) */}
      <Link
        to="/dashboard"
        onClick={onClose}
        title="Go to Dashboard"
        className="h-16 px-5 border-b border-slate-800/80 flex items-center gap-3 bg-[#0B1120] hover:bg-slate-900 transition-colors group cursor-pointer"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0284C7] to-[#0369A1] group-hover:scale-105 transition-transform flex items-center justify-center text-white font-black text-base shadow-md shadow-sky-900/40 shrink-0">
          N
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-black text-white tracking-tight leading-none uppercase truncate group-hover:text-sky-400 transition-colors">
            National Auto
          </h2>
          <span className="text-[10px] font-bold text-sky-400 tracking-widest uppercase mt-1 block">
            Garage Portal
          </span>
        </div>
      </Link>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-4 overflow-y-auto scrollbar-thin">
        <div>
          <div className="px-3.5 pb-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
            Workshop Operations
          </div>
          <div className="space-y-1">{mainNavItems.map(renderLink)}</div>
        </div>
      </div>

      {/* System Admin Status & Logout Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-[#0B1120] space-y-2">
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-[#0284C7] text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
            {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate">
              {user?.username ? `@${user.username}` : 'System Admin'}
            </div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
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
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800/60 hover:bg-rose-600/90 border border-slate-700/60 hover:border-rose-500 transition-all duration-150"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
