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
        'bg-[#4F46E5] hover:bg-[#4338CA] dark:bg-[#6366F1] dark:hover:bg-[#818CF8] text-white focus-visible:ring-indigo-500 border border-transparent shadow-xs',
      accent:
        'bg-[#4F46E5] hover:bg-[#4338CA] dark:bg-[#6366F1] dark:hover:bg-[#818CF8] text-white focus-visible:ring-indigo-500 border border-transparent shadow-xs',
      secondary:
        'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 focus-visible:ring-slate-400 border border-slate-200 dark:border-slate-700',
      outline:
        'bg-white dark:bg-[#172033] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1E293B] border border-slate-300 dark:border-[#334155] focus-visible:ring-indigo-500 shadow-2xs',
      ghost:
        'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white focus-visible:ring-slate-400',
      danger:
        'bg-[#E11D48] hover:bg-[#BE123C] dark:bg-[#F43F5E] dark:hover:bg-[#E11D48] text-white focus-visible:ring-rose-500 border border-transparent shadow-xs',
      success:
        'bg-[#059669] hover:bg-[#047857] dark:bg-[#10B981] dark:hover:bg-[#059669] text-white focus-visible:ring-emerald-500 border border-transparent shadow-xs',
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
