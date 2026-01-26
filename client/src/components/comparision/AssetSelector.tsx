// src/components/comparison/AssetSelector.tsx
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface AssetSelectorProps {
  value: string;
  onChange: (asset: string) => void;
  popularAssets: string[];
}

export function AssetSelector({ value, onChange, popularAssets }: AssetSelectorProps) {
  const [customAsset, setCustomAsset] = useState('');

  return (
    <div className="space-y-4">
      {/* Popular Assets */}
      <div className="flex flex-wrap gap-2">
        {popularAssets.map((asset) => (
          <Button
            key={asset}
            variant={value === asset ? 'primary' : 'secondary'}
            size="md"
            onClick={() => onChange(asset)}
          >
            {asset}
          </Button>
        ))}
      </div>

      {/* Custom Asset Input */}
      <div className="flex gap-2">
        <Input
          placeholder="Or enter custom asset symbol..."
          value={customAsset}
          onChange={(e) => setCustomAsset(e.target.value.toUpperCase())}
          icon={<Search size={18} />}
        />
        <Button
          variant="primary"
          onClick={() => {
            if (customAsset) {
              onChange(customAsset);
              setCustomAsset('');
            }
          }}
          disabled={!customAsset}
        >
          Compare
        </Button>
      </div>
    </div>
  );
}

// src/components/comparison/RateComparisonCard.tsx
import { motion } from 'framer-motion';
import { Crown, ExternalLink } from 'lucide-react';
import { ChainBadge, ProtocolBadge, Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { formatPercentage } from '@utils/formatters';
import clsx from 'clsx';

interface RateComparisonCardProps {
  item: {
    protocol: string;
    chain: string;
    supplyAPY: number;
    borrowAPY: number;
    utilizationRate: number;
    availableLiquidityUSD: number;
  };
  type: 'supply' | 'borrow';
  rank: number;
  isBest: boolean;
  delay: number;
}

export function RateComparisonCard({
  item,
  type,
  rank,
  isBest,
  delay,
}: RateComparisonCardProps) {
  const apy = type === 'supply' ? item.supplyAPY : item.borrowAPY;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className={clsx(
        'relative p-4 rounded-wh border transition-all',
        isBest
          ? 'bg-wh-gradient/10 border-wh-primary-start shadow-glow-sm'
          : 'bg-wh-bg-card border-gray-800 hover:border-gray-700'
      )}
    >
      {isBest && (
        <div className="absolute -top-3 left-4">
          <Badge variant="success" className="flex items-center gap-1">
            <Crown size={14} />
            <span>Best Rate</span>
          </Badge>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={clsx(
              'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
              isBest ? 'bg-wh-gradient text-white' : 'bg-gray-700 text-wh-text-secondary'
            )}
          >
            #{rank}
          </div>

          <div className="flex items-center gap-2">
            <ProtocolBadge protocol={item.protocol as any} />
            <ChainBadge chain={item.chain as any} />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p
              className={clsx(
                'text-2xl font-bold',
                isBest ? 'text-success' : 'text-wh-text-primary'
              )}
            >
              {formatPercentage(apy)}
            </p>
            <p className="text-xs text-wh-text-muted">APY</p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            icon={<ExternalLink size={14} />}
            onClick={() => {
              // Open protocol website
              const protocolUrls: Record<string, string> = {
                aave: 'https://aave.com',
                solend: 'https://solend.fi',
              };
              window.open(protocolUrls[item.protocol.toLowerCase()] || '#', '_blank');
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// src/components/comparison/OpportunityHighlight.tsx
import { motion } from 'framer-motion';
import { Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@components/ui/Card';
import { ChainBadge, ProtocolBadge } from '@components/ui/Badge';
import { GradientText } from '@components/ui/GradientText';
import { formatPercentage } from '@utils/formatters';
import { LendingRate } from '@types';

interface OpportunityHighlightProps {
  type: 'supply' | 'borrow';
  title: string;
  rate: LendingRate;
  savingsPercent: number;
  delay: number;
}

export function OpportunityHighlight({
  type,
  title,
  rate,
  savingsPercent,
  delay,
}: OpportunityHighlightProps) {
  const Icon = type === 'supply' ? TrendingUp : TrendingDown;
  const apy = type === 'supply' ? rate.supplyAPY : rate.borrowAPY;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
    >
      <Card variant="gradient" glow className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-wh-gradient flex items-center justify-center">
              <Icon className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-wh-text-primary">{title}</h3>
              <p className="text-sm text-wh-text-muted">
                {rate.asset.symbol} · {rate.asset.name}
              </p>
            </div>
          </div>

          {savingsPercent > 0 && (
            <div className="flex items-center gap-1 text-success text-sm font-medium">
              <Zap size={16} />
              <span>Save {formatPercentage(savingsPercent, 1)}</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-wh-text-secondary">Rate</span>
            <GradientText className="text-3xl font-bold">
              {formatPercentage(apy)}
            </GradientText>
          </div>

          <div className="flex items-center gap-2">
            <ProtocolBadge protocol={rate.protocol} />
            <ChainBadge chain={rate.chain} />
          </div>

          <div className="pt-3 border-t border-gray-700 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-wh-text-muted">Utilization</span>
              <span className="font-medium">
                {formatPercentage(rate.utilizationRate)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-wh-text-muted">Available Liquidity</span>
              <span className="font-medium">
                {formatCompactUSD(rate.totalSupplyUSD - rate.totalBorrowUSD)}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

import { formatCompactUSD } from '@utils/formatters';