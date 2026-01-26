// src/components/comparison/OpportunityHighlight.tsx
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Sparkles, Zap } from 'lucide-react';
import { RateComparisonItem } from '@types';
import { Card } from '@components/ui/Card';
import { ChainBadge, ProtocolBadge } from '@components/ui/Badge';
import { GradientText } from '@components/ui/GradientText';
import { formatPercentage } from '@utils/formatters';

interface OpportunityHighlightProps {
  type: 'supply' | 'borrow';
  title: string;
  rate: RateComparisonItem;
  savingsPercent: number;
  delay?: number;
}

export function OpportunityHighlight({
  type,
  title,
  rate,
  savingsPercent,
  delay = 0,
}: OpportunityHighlightProps) {
  const Icon = type === 'supply' ? TrendingUp : TrendingDown;
  const apy = type === 'supply' ? rate.supplyAPY : rate.borrowAPY;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card variant="gradient" glow className="p-6 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-wh-gradient opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className={`p-2 rounded-lg ${
                  type === 'supply' ? 'bg-success/20' : 'bg-info/20'
                }`}
              >
                <Icon
                  size={20}
                  className={type === 'supply' ? 'text-success' : 'text-info'}
                />
              </div>
              <div>
                <h3 className="font-semibold text-wh-text-primary">{title}</h3>
                <p className="text-xs text-wh-text-muted">
                  {type === 'supply' ? 'Earn interest' : 'Lowest cost'}
                </p>
              </div>
            </div>
            {savingsPercent > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-success/20 rounded-full">
                <Sparkles size={12} className="text-success" />
                <span className="text-xs font-medium text-success">
                  +{savingsPercent.toFixed(1)}% vs avg
                </span>
              </div>
            )}
          </div>

          {/* Rate Display */}
          <div className="mb-4">
            <p className="text-4xl font-bold">
              <GradientText>{formatPercentage(apy)}</GradientText>
            </p>
            <p className="text-sm text-wh-text-muted mt-1">
              {type === 'supply' ? 'Annual Yield' : 'Annual Cost'}
            </p>
          </div>

          {/* Protocol & Chain */}
          <div className="flex items-center gap-2 mb-4">
            <ProtocolBadge protocol={rate.protocol} size="sm" />
            <ChainBadge chain={rate.chain} size="sm" />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-800">
            <div>
              <p className="text-xs text-wh-text-muted">Utilization</p>
              <p className="font-medium text-wh-text-primary">
                {formatPercentage(rate.utilizationRate)}
              </p>
            </div>
            <div>
              <p className="text-xs text-wh-text-muted">
                {type === 'supply' ? 'Total Supply' : 'Available'}
              </p>
              <p className="font-medium text-wh-text-primary">
                ${(rate.totalSupplyUSD / 1e6).toFixed(1)}M
              </p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

