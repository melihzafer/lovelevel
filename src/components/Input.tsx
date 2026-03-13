import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Input({
  label,
  error,
  hint,
  size = 'md',
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  const hasError = !!error;

  const sizeStyles = {
    sm: 'min-h-[36px] px-3 py-1.5 text-sm',
    md: 'min-h-[44px] px-4 py-2 text-base',
    lg: 'min-h-[52px] px-5 py-3 text-lg',
  };

  const inputStyles = `
    w-full rounded-lg border bg-bg-primary text-text-primary
    placeholder:text-text-muted
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
    transition-all
    ${sizeStyles[size]}
    ${hasError ? 'border-error focus:ring-error' : 'border-border hover:border-border-dark'}
    ${leftIcon ? 'pl-10' : ''}
    ${rightIcon ? 'pr-10' : ''}
    ${className}
  `;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-text-primary">
          {label}
          {props.required && <span className="text-error ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          className={inputStyles}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            {rightIcon}
          </span>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-error" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-sm text-text-tertiary">
          {hint}
        </p>
      )}
    </div>
  );
}
