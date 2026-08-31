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
      'inline-flex items-center justify-center font-extrabold rounded-2xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-95 cursor-pointer';

    const sizeStyles = {
      sm: 'h-8 px-3.5 text-xs gap-1.5 min-w-[2rem]',
      md: 'h-10 px-4.5 text-xs sm:text-sm gap-2 min-w-[2.5rem]',
      lg: 'h-12 px-6 text-sm sm:text-base gap-2.5 min-w-[3rem]',
    };

    const variantStyles = {
      primary:
        'bg-gradient-to-r from-[#0284C7] to-sky-600 hover:from-[#0369A1] hover:to-sky-700 text-white focus-visible:ring-[#0284C7] shadow-md shadow-sky-500/25 border border-sky-400/30',
      accent:
        'bg-gradient-to-r from-[#F59E0B] to-amber-600 hover:from-[#D97706] hover:to-amber-700 text-white focus-visible:ring-[#F59E0B] shadow-md shadow-amber-500/25 border border-amber-400/30',
      secondary:
        'bg-white/80 hover:bg-white text-slate-800 focus-visible:ring-slate-400 border border-slate-200/90 shadow-2xs',
      outline:
        'bg-white/90 text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-slate-300/90 focus-visible:ring-[#0284C7] shadow-2xs',
      ghost:
        'bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-[#0284C7]',
      danger:
        'bg-gradient-to-r from-[#E11D48] to-rose-600 hover:from-[#BE123C] hover:to-rose-700 text-white focus-visible:ring-rose-500 shadow-md shadow-rose-500/25 border border-rose-400/30',
      success:
        'bg-gradient-to-r from-[#059669] to-emerald-600 hover:from-[#047857] hover:to-emerald-700 text-white focus-visible:ring-emerald-500 shadow-md shadow-emerald-500/25 border border-emerald-400/30',
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
