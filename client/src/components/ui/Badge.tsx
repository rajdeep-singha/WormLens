// src/components/ui/Badge.tsx
import { ReactNode } from 'react';
import clsx from 'clsx';
import { Chain, Protocol, CHAIN_INFO, PROTOCOL_INFO } from '@types';

interface BadgeProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
}: BadgeProps) {
  const variantClasses = {
    success: 'bg-success/10 text-success border-success/30',
    warning: 'bg-warning/10 text-warning border-warning/30',
    danger: 'bg-danger/10 text-danger border-danger/30',
    info: 'bg-info/10 text-info border-info/30',
    default: 'bg-gray-700/30 text-wh-text-secondary border-gray-700',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-medium border',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
}

// Chain Badge with logo and color
interface ChainBadgeProps {
  chain: Chain;
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ChainBadge({
  chain,
  showName = true,
  size = 'md',
  className,
}: ChainBadgeProps) {
  const chainInfo = CHAIN_INFO[chain];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-medium border',
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: `${chainInfo.color}15`,
        borderColor: `${chainInfo.color}50`,
        color: chainInfo.color,
      }}
    >
      <span
        className={clsx('rounded-full', iconSizes[size])}
        style={{ backgroundColor: chainInfo.color }}
      />
      {showName && <span>{chainInfo.name}</span>}
    </span>
  );
}

// Protocol Badge with logo and color
interface ProtocolBadgeProps {
  protocol: Protocol;
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProtocolBadge({
  protocol,
  showName = true,
  size = 'md',
  className,
}: ProtocolBadgeProps) {
  const protocolInfo = PROTOCOL_INFO[protocol];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-medium border',
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: `${protocolInfo.color}15`,
        borderColor: `${protocolInfo.color}50`,
        color: protocolInfo.color,
      }}
    >
      <span
        className={clsx('rounded-full', iconSizes[size])}
        style={{ backgroundColor: protocolInfo.color }}
      />
      {showName && <span>{protocolInfo.name}</span>}
    </span>
  );
}

// APY Badge with color coding
interface APYBadgeProps {
  apy: number;
  type?: 'supply' | 'borrow';
  size?: 'sm' | 'md' | 'lg';
}

export function APYBadge({ apy, type = 'supply', size = 'md' }: APYBadgeProps) {
  const getColor = () => {
    if (type === 'supply') {
      if (apy >= 5) return 'success';
      if (apy >= 3) return 'info';
      return 'warning';
    } else {
      if (apy <= 3) return 'success';
      if (apy <= 5) return 'warning';
      return 'danger';
    }
  };

  return (
    <Badge variant={getColor()} size={size}>
      {apy.toFixed(2)}%
    </Badge>
  );
}