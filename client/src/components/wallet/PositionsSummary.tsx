// src/components/wallet/PositionsSummary.tsx
import { DollarSign, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { UserPositions } from '@types';
import { StatsCard } from '@components/ui/Card';
import { formatUSD, formatPercentage } from '@utils/formatters';
import { motion } from 'framer-motion';

interface PositionsSummaryProps {
  positions: UserPositions;
}

export function PositionsSummary({ positions }: PositionsSummaryProps) {
  const stats = [
    {
      title: 'Total Supplied',
      value: formatUSD(positions.totalSuppliedUSD),
      subtitle: `${positions.supplyPositions.length} positions`,
      icon: <DollarSign size={24} />,
      trend: positions.netAPY > 0 ? { value: positions.netAPY, isPositive: true } : undefined,
    },
    {
      title: 'Total Borrowed',
      value: formatUSD(positions.totalBorrowedUSD),
      subtitle: `${positions.borrowPositions.length} positions`,
      icon: <TrendingDown size={24} />,
    },
    {
      title: 'Net APY',
      value: formatPercentage(positions.netAPY),
      subtitle: 'Weighted average',
      icon: <Activity size={24} />,
    },
    {
      title: 'Health Factor',
      value: positions.healthFactor
        ? positions.healthFactor.toFixed(2)
        : 'N/A',
      subtitle: positions.healthFactor && positions.healthFactor >= 2 ? 'Safe' : 'At Risk',
      icon: <TrendingUp size={24} />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <StatsCard {...stat} />
        </motion.div>
      ))}
    </div>
  );
}