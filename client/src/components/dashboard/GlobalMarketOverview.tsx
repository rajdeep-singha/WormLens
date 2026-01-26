// src/components/dashboard/GlobalMarketStats.tsx
import { TrendingUp, TrendingDown } from 'lucide-react';
import { MarketOverview } from '@types';
import { formatCompactUSD, formatPercentage } from '@utils/formatters';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface GlobalMarketStatsProps {
  overview: MarketOverview;
}

export function GlobalMarketStats({ overview }: GlobalMarketStatsProps) {
  const stats = [
    {
      label: 'Total Value Locked',
      value: formatCompactUSD(overview.totalValueLockedUSD),
      change: 2.5,
      positive: true,
    },
    {
      label: 'Total Borrowed',
      value: formatCompactUSD(overview.totalBorrowedUSD),
      change: 1.8,
      positive: true,
    },
    {
      label: 'Avg Supply APY',
      value: formatPercentage(overview.averageSupplyAPY),
      change: 0.3,
      positive: true,
    },
    {
      label: 'Avg Borrow APY',
      value: formatPercentage(overview.averageBorrowAPY),
      change: -0.2,
      positive: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-wh-bg-card border border-gray-800 rounded-wh p-4"
        >
          <p className="text-sm text-wh-text-secondary mb-1">{stat.label}</p>
          <p className="text-2xl font-bold text-wh-text-primary mb-2">
            {stat.value}
          </p>
          <div
            className={clsx(
              'flex items-center text-sm',
              stat.positive ? 'text-success' : 'text-danger'
            )}
          >
            {stat.positive ? (
              <TrendingUp size={16} className="mr-1" />
            ) : (
              <TrendingDown size={16} className="mr-1" />
            )}
            <span>{Math.abs(stat.change)}%</span>
            <span className="text-wh-text-muted ml-1">24h</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}