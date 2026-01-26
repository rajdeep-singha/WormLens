// src/components/ui/Card.tsx
import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'glass' | 'gradient';
  glow?: boolean;
  hoverable?: boolean;
  className?: string;
  onClick?: () => void;
}

export function Card({
  children,
  variant = 'default',
  glow = false,
  hoverable = false,
  className,
  onClick,
}: CardProps) {
  const baseClasses = 'rounded-wh-lg transition-all duration-200';

  const variantClasses = {
    default: 'bg-wh-bg-card border border-gray-800',
    glass: 'bg-wh-bg-card/50 backdrop-blur-xl border border-gray-700/50',
    gradient: 'bg-gradient-to-br from-wh-bg-card to-wh-bg-card-hover border border-wh-primary-start/30',
  };

  const hoverClasses = hoverable
    ? 'hover:shadow-card-hover hover:scale-[1.02] cursor-pointer'
    : '';

  const glowClasses = glow ? 'shadow-glow-md' : 'shadow-card';

  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={clsx(
        baseClasses,
        variantClasses[variant],
        hoverClasses,
        glowClasses,
        className
      )}
    >
      {children}
    </Component>
  );
}

// Pre-styled card variants for common use cases
export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: { value: number; isPositive: boolean };
  className?: string;
}) {
  return (
    <Card variant="glass" glow className={clsx('p-6', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-wh-text-secondary mb-1">{title}</p>
          <p className="text-3xl font-bold text-wh-text-primary">{value}</p>
          {subtitle && (
            <p className="text-sm text-wh-text-muted mt-1">{subtitle}</p>
          )}
          {trend && (
            <div
              className={clsx(
                'inline-flex items-center text-sm mt-2',
                trend.isPositive ? 'text-success' : 'text-danger'
              )}
            >
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span className="ml-1">{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-wh-primary-end opacity-80">{icon}</div>
        )}
      </div>
    </Card>
  );
}