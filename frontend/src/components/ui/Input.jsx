import React from 'react';
import { Search, X, Loader2 } from 'lucide-react';

export const Input = React.forwardRef(
  (
    {
      label,
      error,
      hint,
      icon: Icon,
      rightElement,
      type = 'text',
      className = '',
      required = false,
      disabled = false,
      id,
      onChange,
      onKeyDown,
      onlyNumbers = false,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const isNumericType =
      onlyNumbers ||
      type === 'number' ||
      type === 'tel' ||
      type === 'phone' ||
      (label && (label.toLowerCase().includes('mobile') || label.toLowerCase().includes('phone') || label.toLowerCase().includes('qty') || label.toLowerCase().includes('price') || label.toLowerCase().includes('amount')));

    const inputMode = props.inputMode || (isNumericType ? (type === 'number' ? 'decimal' : 'numeric') : undefined);
    const pattern = props.pattern || (isNumericType ? '[0-9]*' : undefined);

    const handleKeyDown = (e) => {
      if (isNumericType && type === 'tel') {
        const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
        if (!allowedKeys.includes(e.key) && !/^\d$/.test(e.key) && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
        }
      }
      onKeyDown?.(e);
    };

    const handleChange = (e) => {
      if (isNumericType && type === 'tel') {
        e.target.value = e.target.value.replace(/\D/g, '');
      }
      onChange?.(e);
    };

    let paddingClass = 'px-3.5 py-2 h-10';
    if (Icon && rightElement) {
      paddingClass = 'pl-10 pr-10 py-2 h-10';
    } else if (Icon) {
      paddingClass = 'pl-10 pr-3.5 py-2 h-10';
    } else if (rightElement) {
      paddingClass = 'pl-3.5 pr-10 py-2 h-10';
    }

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <div className="relative rounded-xl shadow-2xs">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            inputMode={inputMode}
            pattern={pattern}
            disabled={disabled}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={`w-full rounded-xl border text-sm text-slate-900 font-medium placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:border-[#0284C7] disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed ${paddingClass} ${
              error
                ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/20'
                : 'border-slate-300 bg-white hover:border-slate-400'
            } ${className}`}
            {...props}
          />
          {rightElement && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {rightElement}
            </div>
          )}
        </div>
        {error ? (
          <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>
        ) : hint ? (
          <p className="mt-1 text-xs text-slate-500">{hint}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = 'Input';

export const CurrencyInput = React.forwardRef(
  (
    {
      label,
      error,
      hint,
      className = '',
      required = false,
      disabled = false,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <div className="relative rounded-xl shadow-2xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none font-black text-[#0284C7] text-sm select-none">
            ₹
          </div>
          <input
            ref={ref}
            id={inputId}
            type="number"
            inputMode="decimal"
            pattern="[0-9]*"
            min="0"
            step="any"
            disabled={disabled}
            className={`w-full rounded-xl border text-sm text-slate-900 font-bold pl-8 pr-3.5 py-2 h-10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:border-[#0284C7] disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed ${
              error
                ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/20'
                : 'border-slate-300 bg-white hover:border-slate-400'
            } ${className}`}
            {...props}
          />
        </div>
        {error ? (
          <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>
        ) : hint ? (
          <p className="mt-1 text-xs text-slate-500">{hint}</p>
        ) : null}
      </div>
    );
  }
);
CurrencyInput.displayName = 'CurrencyInput';

export const Select = React.forwardRef(
  (
    {
      label,
      error,
      hint,
      children,
      className = '',
      required = false,
      disabled = false,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          className={`w-full rounded-xl border text-sm text-slate-900 font-semibold h-10 px-3.5 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:border-[#0284C7] disabled:bg-slate-100 disabled:cursor-not-allowed ${
            error
              ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/20'
              : 'border-slate-300 bg-white hover:border-slate-400'
          } ${className}`}
          {...props}
        >
          {children}
        </select>
        {error ? (
          <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>
        ) : hint ? (
          <p className="mt-1 text-xs text-slate-500">{hint}</p>
        ) : null}
      </div>
    );
  }
);
Select.displayName = 'Select';

export const Textarea = React.forwardRef(
  (
    {
      label,
      error,
      hint,
      rows = 3,
      className = '',
      required = false,
      disabled = false,
      id,
      ...props
    },
    ref
  ) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          disabled={disabled}
          className={`w-full rounded-xl border text-sm text-slate-900 font-medium placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:border-[#0284C7] px-3.5 py-2 disabled:bg-slate-100 disabled:cursor-not-allowed ${
            error
              ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/20'
              : 'border-slate-300 bg-white hover:border-slate-400'
          } ${className}`}
          {...props}
        />
        {error ? (
          <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>
        ) : hint ? (
          <p className="mt-1 text-xs text-slate-500">{hint}</p>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export const SearchInput = React.forwardRef(
  (
    {
      value,
      onChange,
      onClear,
      placeholder = 'Search by name, phone, bike number, or bill #...',
      loading = false,
      className = '',
      disabled = false,
      ...props
    },
    ref
  ) => {
    return (
      <div className={`relative rounded-xl shadow-2xs w-full ${className}`}>
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-300 bg-white h-10 pl-10 pr-10 text-sm text-slate-900 font-medium placeholder:text-slate-400 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:border-[#0284C7] transition-colors disabled:bg-slate-100"
          {...props}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#0284C7]" />
          ) : value && onClear ? (
            <button
              type="button"
              onClick={onClear}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      </div>
    );
  }
);
SearchInput.displayName = 'SearchInput';
