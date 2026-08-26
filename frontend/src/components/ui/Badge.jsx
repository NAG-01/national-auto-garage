import React from 'react';

export const Badge = ({
  children,
  variant = 'default', // 'default', 'success', 'warning', 'danger', 'info', 'accent', 'purple'
  size = 'md', // 'sm', 'md'
  dot = false,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px] font-bold tracking-wide',
    md: 'px-2.5 py-1 text-xs font-bold tracking-wide',
  };

  const variantStyles = {
    default: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    success: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    danger: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    info: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    accent: 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    purple: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  };

  const dotColors = {
    default: 'bg-slate-400 dark:bg-slate-500',
    success: 'bg-emerald-500 dark:bg-emerald-400',
    warning: 'bg-amber-500 dark:bg-amber-400',
    danger: 'bg-rose-500 dark:bg-rose-400',
    info: 'bg-indigo-500 dark:bg-indigo-400',
    accent: 'bg-orange-500 dark:bg-orange-400',
    purple: 'bg-purple-500 dark:bg-purple-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[variant] || 'bg-slate-400'}`} />}
      {children}
    </span>
  );
};

export const StatusBadge = ({ status, className = '' }) => {
  if (!status) return null;

  const mapping = {
    // Inventory Stock Statuses
    IN_STOCK: { label: 'In Stock', variant: 'success' },
    LOW_STOCK: { label: 'Low Stock', variant: 'warning' },
    OUT_OF_STOCK: { label: 'Out of Stock', variant: 'danger' },

    // Service Job Statuses
    PENDING: { label: 'Pending', variant: 'warning' },
    IN_PROGRESS: { label: 'In Progress', variant: 'info' },
    COMPLETED: { label: 'Completed', variant: 'success' },
    DELIVERED: { label: 'Delivered', variant: 'success' },
    CANCELLED: { label: 'Cancelled', variant: 'danger' },

    // Payment Statuses
    UNPAID: { label: 'Unpaid', variant: 'danger' },
    PARTIALLY_PAID: { label: 'Partially Paid', variant: 'warning' },
    PAID: { label: 'Paid', variant: 'success' },

    // Supplier Order Statuses
    DRAFT: { label: 'Draft', variant: 'default' },
    ORDERED: { label: 'Ordered', variant: 'info' },
    RECEIVED: { label: 'Received', variant: 'success' },

    // Active Statuses
    ACTIVE: { label: 'Active', variant: 'success' },
    INACTIVE: { label: 'Inactive', variant: 'default' },

    // Payer / Money Sources
    GARAGE_MONEY: { label: 'Garage Money', variant: 'default' },
    NAIM_PERSONAL: { label: 'Naim (Personal)', variant: 'purple' },
    IMRAN_PERSONAL: { label: 'Imran (Personal)', variant: 'accent' },
  };

  const config = mapping[status] || {
    label: String(status).replace(/_/g, ' '),
    variant: 'default',
  };

  return (
    <Badge variant={config.variant} dot className={className}>
      {config.label}
    </Badge>
  );
};
