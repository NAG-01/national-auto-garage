import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';

export const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`relative inline-flex items-center gap-1.5 p-1.5 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 select-none ${
        isDark
          ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700 hover:border-slate-600'
          : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:border-slate-300'
      } ${className}`}
    >
      <div className="flex items-center gap-1 px-1">
        {isDark ? (
          <>
            <Moon className="w-4 h-4 text-amber-300 transition-transform duration-200 rotate-0 scale-100" />
            <span className="text-[11px] font-bold text-slate-200 hidden sm:inline">Dark</span>
          </>
        ) : (
          <>
            <Sun className="w-4 h-4 text-amber-500 transition-transform duration-200 rotate-0 scale-100" />
            <span className="text-[11px] font-bold text-slate-700 hidden sm:inline">Light</span>
          </>
        )}
      </div>
    </button>
  );
};
