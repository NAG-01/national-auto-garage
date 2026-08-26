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
      'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const sizeStyles = {
      sm: 'h-8 px-3 text-xs gap-1.5 min-w-[2rem]',
      md: 'h-10 px-4 text-xs sm:text-sm gap-2 min-w-[2.5rem]',
      lg: 'h-12 px-5 text-sm sm:text-base gap-2.5 min-w-[3rem]',
    };

    const variantStyles = {
      primary:
        'bg-[#0284C7] hover:bg-[#0369A1] text-white focus-visible:ring-[#0284C7] border border-transparent shadow-xs',
      accent:
        'bg-[#F59E0B] hover:bg-[#D97706] text-white focus-visible:ring-[#F59E0B] border border-transparent shadow-xs',
      secondary:
        'bg-slate-100 text-slate-800 hover:bg-slate-200 focus-visible:ring-slate-400 border border-slate-200',
      outline:
        'bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-slate-300 focus-visible:ring-[#0284C7] shadow-2xs',
      ghost:
        'bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-[#0284C7]',
      danger:
        'bg-[#E11D48] hover:bg-[#BE123C] text-white focus-visible:ring-rose-500 border border-transparent shadow-xs',
      success:
        'bg-[#059669] hover:bg-[#047857] text-white focus-visible:ring-emerald-500 border border-transparent shadow-xs',
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
