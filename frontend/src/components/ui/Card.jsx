import React from 'react';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export const Card = ({
  children,
  className = '',
  title,
  subtitle,
  action,
  noPadding = false,
  footer,
  ...props
}) => {
  return (
    <div
      className={`bg-white dark:bg-[#172033] rounded-2xl border border-slate-200 dark:border-[#263449] text-slate-900 dark:text-slate-100 shadow-2xs overflow-hidden transition-colors duration-200 ${className}`}
      {...props}
    >
      {(title || action) && (
        <div className="px-5 py-4 border-b border-slate-100 dark:border-[#263449] flex items-center justify-between gap-4">
          <div>
            {title && <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
      {footer && (
        <div className="px-5 py-3 bg-slate-50 dark:bg-[#111827] border-t border-slate-100 dark:border-[#263449] text-xs text-slate-500 dark:text-slate-400">
          {footer}
        </div>
      )}
    </div>
  );
};

export const CalloutCard = ({
  title,
  children,
  type = 'warning', // 'warning', 'info', 'danger', 'success'
  className = '',
}) => {
  const typeConfig = {
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200',
      iconBg: 'text-amber-600 dark:text-amber-400',
      Icon: AlertTriangle,
    },
    info: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/60 text-indigo-900 dark:text-indigo-200',
      iconBg: 'text-indigo-600 dark:text-indigo-400',
      Icon: Info,
    },
    danger: {
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200',
      iconBg: 'text-rose-600 dark:text-rose-400',
      Icon: AlertTriangle,
    },
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200',
      iconBg: 'text-emerald-600 dark:text-emerald-400',
      Icon: CheckCircle2,
    },
  };

  const config = typeConfig[type] || typeConfig.warning;
  const Icon = config.Icon;

  return (
    <div className={`rounded-2xl border p-4 flex items-start gap-3.5 ${config.bg} ${className}`}>
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconBg}`} />
      <div className="flex-1 text-sm">
        {title && <div className="font-extrabold mb-1">{title}</div>}
        <div className="leading-relaxed text-xs sm:text-sm">{children}</div>
      </div>
    </div>
  );
};
