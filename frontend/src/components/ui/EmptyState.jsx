import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button.jsx';

export const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No records found',
  description = 'There are no items matching the current view or filter criteria.',
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-10 sm:p-14 text-center bg-white rounded-xl border border-slate-200 border-dashed ${className}`}
    >
      <div className="p-4 rounded-2xl bg-slate-50 text-slate-400 mb-3.5 border border-slate-100">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-base font-bold text-slate-800 tracking-tight">{title}</h4>
      <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} className="mt-4 shadow-sm">
          {actionText}
        </Button>
      )}
    </div>
  );
};
