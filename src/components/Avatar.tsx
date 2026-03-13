import type { HTMLAttributes, ReactNode } from 'react';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'busy' | 'away';
}

export function Avatar({
  src,
  alt = 'Avatar',
  fallback,
  size = 'md',
  status,
  className = '',
  ...props
}: AvatarProps) {
  const sizeStyles = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };

  const statusStyles = {
    online: 'bg-success',
    offline: 'bg-text-muted',
    busy: 'bg-error',
    away: 'bg-warning',
  };

  const statusSizeStyles = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
  };

  return (
    <div className={`relative inline-block ${className}`} {...props}>
      <div
        className={`${sizeStyles[size]} rounded-full bg-bg-tertiary flex items-center justify-center overflow-hidden`}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
          />
        ) : fallback ? (
          <span className="font-medium text-text-secondary uppercase">
            {fallback.slice(0, 2)}
          </span>
        ) : (
          <svg
            className="w-1/2 h-1/2 text-text-muted"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
      </div>
      {status && (
        <span
          className={`absolute bottom-0 right-0 ${statusSizeStyles[size]} ${statusStyles[status]} rounded-full ring-2 ring-bg-primary`}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
}

interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  max?: number;
  children: ReactNode;
}

export function AvatarGroup({ max = 4, children, className = '', ...props }: AvatarGroupProps) {
  const childArray = Array.isArray(children) ? children : [children];
  const visibleChildren = childArray.slice(0, max);
  const remainingCount = childArray.length - max;

  return (
    <div className={`flex -space-x-2 ${className}`} {...props}>
      {visibleChildren}
      {remainingCount > 0 && (
        <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center text-sm font-medium text-text-secondary ring-2 ring-bg-primary">
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
