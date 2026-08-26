import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button.jsx';

export const ErrorState = ({
  title = 'Something went wrong',
  message = 'We encountered an error while loading the requested data. Please try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-10 sm:p-14 text-center bg-rose-50/40 rounded-xl border border-rose-200 ${className}`}
    >
      <div className="p-4 rounded-2xl bg-rose-100 text-rose-600 mb-3.5">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h4 className="text-base font-bold text-slate-900 tracking-tight">{title}</h4>
      <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md leading-relaxed">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          icon={RefreshCw}
          className="mt-4 border-rose-300 text-rose-700 hover:bg-rose-50"
        >
          Try Again
        </Button>
      )}
    </div>
  );
};
