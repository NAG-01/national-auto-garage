import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = React.forwardRef(
  (
    {
      children,
      type = 'button',
      variant = 'primary', // 'primary', 'accent', 'secondary', 'outline', 'ghost', 'danger', 'success'
      size = 'md', // 'sm', 'md', 'lg'
      loading = false,
      disabled = false,
      icon: Icon,
      iconPosition = 'left',
      className = '',
      onClick,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const sizeStyles = {
      sm: 'h-8 px-3 text-xs gap-1.5 min-w-[2rem]',
      md: 'h-10 px-4 text-sm gap-2 min-w-[2.5rem]',
      lg: 'h-12 px-5 text-base gap-2.5 min-w-[3rem]',
    };

    const variantStyles = {
      primary:
        'bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500 border border-transparent shadow-sm shadow-indigo-100',
      accent:
        'bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500 border border-transparent shadow-sm shadow-indigo-100',
      secondary:
        'bg-slate-100 text-slate-800 hover:bg-slate-200 focus-visible:ring-slate-400 border border-slate-200',
      outline:
        'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 focus-visible:ring-slate-400 shadow-sm hover:border-slate-400',
      ghost:
        'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-300',
      danger:
        'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500 border border-transparent shadow-sm',
      success:
        'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500 border border-transparent shadow-sm',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        onClick={onClick}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : Icon && iconPosition === 'left' ? (
          <Icon className="w-4 h-4 flex-shrink-0" />
        ) : null}

        {children}

        {!loading && Icon && iconPosition === 'right' ? (
          <Icon className="w-4 h-4 flex-shrink-0" />
        ) : null}
      </button>
    );
  }
);

Button.displayName = 'Button';
