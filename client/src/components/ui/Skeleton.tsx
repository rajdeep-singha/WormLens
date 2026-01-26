// src/components/ui/Skeleton.tsx
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  count = 1,
}: SkeletonProps) {
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-wh',
  };

  const shimmerClasses = 'animate-shimmer bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:1000px_100%]';

  const skeletonStyle = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : '100%',
    height: height
      ? typeof height === 'number'
        ? `${height}px`
        : height
      : variant === 'text'
      ? '1rem'
      : '100%',
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={clsx(shimmerClasses, variantClasses[variant], className)}
          style={skeletonStyle}
        />
      ))}
    </>
  );
}

// Loading state component
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={clsx(
          'border-4 border-gray-700 border-t-wh-primary-start rounded-full animate-spin',
          sizeClasses[size]
        )}
      />
    </div>
  );
}

// Empty state component
interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && (
        <div className="mb-4 text-wh-text-muted opacity-50">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-wh-text-primary mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-wh-text-secondary max-w-md mb-4">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}