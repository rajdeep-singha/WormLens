// src/components/comparison/RateComparisonCard.tsx
import { motion } from 'framer-motion';
import { Trophy, ExternalLink } from 'lucide-react';
import { RateComparisonItem } from '@types';
import { ChainBadge, ProtocolBadge, APYBadge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { formatCompactUSD, formatPercentage } from '@utils/formatters';
import clsx from 'clsx';

interface RateComparisonCardProps {
  item: RateComparisonItem;
  type: 'supply' | 'borrow';
  rank: number;
  isBest: boolean;
  delay?: number;
}

export function RateComparisonCard({
  item,
  type,
  rank,
  isBest,
  delay = 0,
}: RateComparisonCardProps) {
  const apy = type === 'supply' ? item.supplyAPY : item.borrowAPY;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className={clsx(
        'flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-wh border transition-all',
        isBest
          ? 'bg-wh-primary-start/10 border-wh-primary-start/50 shadow-glow-sm'
          : 'bg-wh-bg-card border-gray-800 hover:border-gray-700'
      )}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4 mb-3 sm:mb-0">
        {/* Rank */}
        <div
          className={clsx(
            'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
            isBest
              ? 'bg-wh-gradient text-white'
              : 'bg-gray-800 text-wh-text-muted'
          )}
        >
          {isBest ? <Trophy size={16} /> : rank}
        </div>

        {/* Protocol & Chain */}
        <div className="flex flex-wrap gap-2">
          <ProtocolBadge protocol={item.protocol} />
          <ChainBadge chain={item.chain} />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        {/* APY */}
        <div className="text-center">
          <p className="text-xs text-wh-text-muted mb-1">
            {type === 'supply' ? 'Supply APY' : 'Borrow APY'}
          </p>
          <APYBadge apy={apy} type={type} size="lg" />
        </div>

        {/* Utilization */}
        <div className="text-center">
          <p className="text-xs text-wh-text-muted mb-1">Utilization</p>
          <p className="font-semibold text-wh-text-primary">
            {formatPercentage(item.utilizationRate)}
          </p>
        </div>

        {/* Available Liquidity */}
        <div className="text-center">
          <p className="text-xs text-wh-text-muted mb-1">Available</p>
          <p className="font-semibold text-wh-text-primary">
            {formatCompactUSD(item.availableLiquidityUSD)}
          </p>
        </div>

        {/* Action */}
        <Button
          variant={isBest ? 'primary' : 'ghost'}
          size="sm"
          icon={<ExternalLink size={14} />}
          iconPosition="right"
        >
          {type === 'supply' ? 'Supply' : 'Borrow'}
        </Button>
      </div>
    </motion.div>
  );
}

