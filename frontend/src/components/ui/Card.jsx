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
      className={`bg-white/85 backdrop-blur-2xl rounded-3xl border border-white/90 text-slate-900 shadow-md shadow-slate-200/40 hover:shadow-xl hover:border-[#0284C7]/30 overflow-hidden transition-all duration-300 ${className}`}
      {...props}
    >
      {(title || action) && (
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between gap-4">
          <div>
            {title && <h3 className="text-base font-black text-slate-900 tracking-tight uppercase">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5 sm:p-6'}>{children}</div>
      {footer && (
        <div className="px-6 py-3.5 bg-slate-50/80 backdrop-blur-md border-t border-slate-100 text-xs text-slate-500 font-medium">
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
      bg: 'bg-amber-50/90 border-amber-200/90 text-amber-950',
      iconBg: 'text-[#F59E0B]',
      Icon: AlertTriangle,
    },
    info: {
      bg: 'bg-sky-50/90 border-sky-200/90 text-sky-950',
      iconBg: 'text-[#0284C7]',
      Icon: Info,
    },
    danger: {
      bg: 'bg-rose-50/90 border-rose-200/90 text-rose-950',
      iconBg: 'text-rose-600',
      Icon: AlertTriangle,
    },
    success: {
      bg: 'bg-emerald-50/90 border-emerald-200/90 text-emerald-950',
      iconBg: 'text-emerald-600',
      Icon: CheckCircle2,
    },
  };

  const config = typeConfig[type] || typeConfig.warning;
  const Icon = config.Icon;

  return (
    <div className={`rounded-3xl border p-4.5 sm:p-5 flex items-start gap-3.5 backdrop-blur-xl shadow-xs ${config.bg} ${className}`}>
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconBg}`} />
      <div className="flex-1 text-sm">
        {title && <div className="font-black mb-1 text-slate-900 uppercase tracking-tight">{title}</div>}
        <div className="leading-relaxed text-xs sm:text-sm font-medium">{children}</div>
      </div>
    </div>
  );
};
