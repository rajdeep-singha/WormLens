// src/components/ui/Input.tsx
import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      icon,
      iconPosition = 'left',
      helperText,
      className,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-wh-text-secondary mb-2">
            {label}
          </label>
        )}

        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-wh-text-muted">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            className={clsx(
              'w-full px-4 py-2.5 bg-wh-bg-input text-wh-text-primary rounded-wh border transition-all duration-200',
              'placeholder:text-wh-text-muted',
              'focus:outline-none focus:ring-2 focus:ring-wh-primary-start/50',
              hasError
                ? 'border-danger focus:ring-danger/50'
                : 'border-gray-700 hover:border-gray-600',
              icon && iconPosition === 'left' && 'pl-10',
              icon && iconPosition === 'right' && 'pr-10',
              className
            )}
            {...props}
          />

          {icon && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-wh-text-muted">
              {icon}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1.5 text-sm text-danger">{error}</p>
        )}

        {helperText && !error && (
          <p className="mt-1.5 text-sm text-wh-text-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';