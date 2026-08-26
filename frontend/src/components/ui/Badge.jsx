import React from 'react';

export const Badge = ({
  children,
  variant = 'default', // 'default', 'success', 'warning', 'danger', 'info', 'accent', 'purple'
  size = 'md', // 'sm', 'md'
  dot = false,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px] font-extrabold tracking-wide',
    md: 'px-2.5 py-1 text-xs font-extrabold tracking-wide',
  };

  const variantStyles = {
    default: 'bg-[#F0F9FF] text-[#0C4A6E] border-[#BAE6FD]',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD]',
    accent: 'bg-amber-50 text-[#D97706] border-amber-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const dotColors = {
    default: 'bg-[#0284C7]',
    success: 'bg-emerald-500',
    warning: 'bg-[#F59E0B]',
    danger: 'bg-rose-500',
    info: 'bg-[#0284C7]',
    accent: 'bg-[#F59E0B]',
    purple: 'bg-purple-500',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[variant] || 'bg-[#0284C7]'}`} />}
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
