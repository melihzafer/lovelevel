import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = '', id, ...props }: InputProps) {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-text-primary">
          {label}
          {props.required && <span className="text-primary-500 ml-1">*</span>}
        </label>
      )}
      <input style={{ color: 'black'}}
        id={inputId}
        className={`w-full px-4 py-2 border border-border-color rounded-lg bg-bg-primary text-primary placeholder:text-black dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${className}`}
        {...props}
      />
    </div>
  );
}
