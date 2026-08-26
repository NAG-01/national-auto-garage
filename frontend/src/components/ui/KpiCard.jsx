import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const KpiCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendDirection = 'neutral', // 'up', 'down', 'neutral'
  variant = 'default', // 'default', 'accent', 'success', 'danger', 'info', 'purple'
  className = '',
}) => {
  const variantStyles = {
    default: 'border-t-indigo-500 bg-white',
    accent: 'border-t-amber-500 bg-gradient-to-b from-amber-50/30 to-white',
    success: 'border-t-emerald-500 bg-gradient-to-b from-emerald-50/30 to-white',
    danger: 'border-t-rose-500 bg-gradient-to-b from-rose-50/30 to-white',
    info: 'border-t-blue-500 bg-gradient-to-b from-blue-50/30 to-white',
    purple: 'border-t-purple-500 bg-gradient-to-b from-purple-50/30 to-white',
  };

  const iconVariants = {
    default: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
    accent: 'bg-amber-50 text-amber-600 border border-amber-100',
    success: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    danger: 'bg-rose-50 text-rose-600 border border-rose-100',
    info: 'bg-blue-50 text-blue-600 border border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border border-purple-100',
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/90 border-t-4 p-5 shadow-2xs hover:shadow-md transition-all duration-200 ${
        variantStyles[variant] || variantStyles.default
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl flex-shrink-0 ${iconVariants[variant] || iconVariants.default}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</div>
        {(subtitle || trend) && (
          <div className="mt-1.5 text-xs text-slate-500 flex items-center gap-1.5">
            {trend && (
              <span
                className={`inline-flex items-center font-semibold ${
                  trendDirection === 'up'
                    ? 'text-emerald-600'
                    : trendDirection === 'down'
                    ? 'text-rose-600'
                    : 'text-slate-600'
                }`}
              >
                {trendDirection === 'up' && <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />}
                {trendDirection === 'down' && <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                {trend}
              </span>
            )}
            {subtitle && <span className="text-slate-500">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
