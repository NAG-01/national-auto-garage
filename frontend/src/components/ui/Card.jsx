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
      className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-shadow duration-150 ${className}`}
      {...props}
    >
      {(title || action) && (
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div>
            {title && <h3 className="text-base font-semibold text-slate-900 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
      {footer && <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">{footer}</div>}
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
      bg: 'bg-amber-50/70 border-amber-200 text-amber-900',
      iconBg: 'text-amber-600',
      Icon: AlertTriangle,
    },
    info: {
      bg: 'bg-blue-50/70 border-blue-200 text-blue-900',
      iconBg: 'text-blue-600',
      Icon: Info,
    },
    danger: {
      bg: 'bg-rose-50/70 border-rose-200 text-rose-900',
      iconBg: 'text-rose-600',
      Icon: AlertTriangle,
    },
    success: {
      bg: 'bg-emerald-50/70 border-emerald-200 text-emerald-900',
      iconBg: 'text-emerald-600',
      Icon: CheckCircle2,
    },
  };

  const config = typeConfig[type] || typeConfig.warning;
  const Icon = config.Icon;

  return (
    <div className={`rounded-xl border p-4 flex items-start gap-3.5 ${config.bg} ${className}`}>
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconBg}`} />
      <div className="flex-1 text-sm">
        {title && <div className="font-semibold mb-1">{title}</div>}
        <div className="text-slate-700 leading-relaxed text-xs sm:text-sm">{children}</div>
      </div>
    </div>
  );
};
