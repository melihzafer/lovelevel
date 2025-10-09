import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    'touch-target min-h-[44px] px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary:
      'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 focus-visible:ring-primary-500',
    secondary:
      'bg-bg-secondary text-text-primary hover:bg-bg-tertiary active:bg-bg-tertiary/80 focus-visible:ring-primary-500',
    outline:
      'border-2 border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 active:bg-primary-100 dark:active:bg-primary-900/50',
    ghost:
      'text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 active:bg-primary-100 dark:active:bg-primary-900/50',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
