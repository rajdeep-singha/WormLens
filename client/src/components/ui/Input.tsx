// src/components/ui/Input.tsx
import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      iconPosition = 'left',
      fullWidth = true,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const hasIcon = !!icon;

    return (
      <div className={clsx('space-y-1.5', fullWidth && 'w-full')}>
        {label && (
          <label className="block text-sm font-medium text-wh-text-secondary">
            {label}
          </label>
        )}
        <div className="relative">
          {hasIcon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-wh-text-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            disabled={disabled}
            className={clsx(
              'w-full px-4 py-3 bg-wh-bg-input text-wh-text-primary rounded-wh border transition-all duration-200',
              'placeholder:text-wh-text-muted',
              'focus:outline-none focus:ring-2 focus:ring-wh-primary-start/50 focus:border-wh-primary-start',
              error
                ? 'border-danger focus:ring-danger/50 focus:border-danger'
                : 'border-gray-700 hover:border-gray-600',
              hasIcon && iconPosition === 'left' && 'pl-11',
              hasIcon && iconPosition === 'right' && 'pr-11',
              disabled && 'opacity-50 cursor-not-allowed',
              className
            )}
            {...props}
          />
          {hasIcon && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-wh-text-muted">
              {icon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-danger flex items-center gap-1">
            <span>⚠</span>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-sm text-success flex items-center gap-1">
            <span>✓</span>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
