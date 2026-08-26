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
      className={`bg-white rounded-2xl border border-[#BAE6FD] text-[#0C4A6E] shadow-2xs overflow-hidden transition-shadow duration-150 ${className}`}
      {...props}
    >
      {(title || action) && (
        <div className="px-5 py-4 border-b border-[#E0F2FE] flex items-center justify-between gap-4">
          <div>
            {title && <h3 className="text-base font-extrabold text-[#0C4A6E] tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-[#0369A1] font-medium mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
      {footer && (
        <div className="px-5 py-3 bg-[#F0F9FF] border-t border-[#E0F2FE] text-xs text-[#0369A1] font-medium">
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
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
      iconBg: 'text-[#F59E0B]',
      Icon: AlertTriangle,
    },
    info: {
      bg: 'bg-[#E0F2FE] border-[#BAE6FD] text-[#0C4A6E]',
      iconBg: 'text-[#0284C7]',
      Icon: Info,
    },
    danger: {
      bg: 'bg-rose-50 border-rose-200 text-rose-900',
      iconBg: 'text-rose-600',
      Icon: AlertTriangle,
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      iconBg: 'text-emerald-600',
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
        <div className="leading-relaxed text-xs sm:text-sm font-medium">{children}</div>
      </div>
    </div>
  );
};
