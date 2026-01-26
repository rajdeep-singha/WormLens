// src/components/wallet/PositionsTable.tsx
import { ExternalLink } from 'lucide-react';
import { UserSupplyPosition, UserBorrowPosition } from '@types';
import { ChainBadge, ProtocolBadge, APYBadge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { formatUSD, formatPercentage } from '@utils/formatters';
import { motion } from 'framer-motion';

interface PositionsTableProps {
  positions: (UserSupplyPosition | UserBorrowPosition)[];
  type: 'supply' | 'borrow';
}

export function PositionsTable({ positions, type }: PositionsTableProps) {
  return (
    <div className="overflow-x-auto">
      {/* Desktop Table */}
      <table className="w-full hidden md:table">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="text-left py-3 px-4 text-wh-text-secondary font-semibold text-sm">
              Asset
            </th>
            <th className="text-left py-3 px-4 text-wh-text-secondary font-semibold text-sm">
              Protocol
            </th>
            <th className="text-left py-3 px-4 text-wh-text-secondary font-semibold text-sm">
              Chain
            </th>
            <th className="text-right py-3 px-4 text-wh-text-secondary font-semibold text-sm">
              Amount
            </th>
            <th className="text-right py-3 px-4 text-wh-text-secondary font-semibold text-sm">
              Value (USD)
            </th>
            <th className="text-right py-3 px-4 text-wh-text-secondary font-semibold text-sm">
              APY
            </th>
            <th className="text-right py-3 px-4 text-wh-text-secondary font-semibold text-sm">
              Interest Earned
            </th>
          </tr>
        </thead>
        <tbody>
          {positions.map((position, index) => {
            const amount = 'suppliedAmountUSD' in position 
              ? position.suppliedAmountUSD 
              : position.borrowedAmountUSD;
            const interest = 'accruedInterestUSD' in position
              ? position.accruedInterestUSD
              : 0;

            return (
              <motion.tr
                key={`${position.asset.symbol}-${position.protocol}-${position.chain}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-gray-800/50 hover:bg-wh-bg-card-hover transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-wh-gradient flex items-center justify-center text-white font-bold text-sm">
                      {position.asset.symbol.charAt(0)}
                    </div>
                    <span className="font-semibold">{position.asset.symbol}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <ProtocolBadge protocol={position.protocol} size="sm" />
                </td>
                <td className="py-4 px-4">
                  <ChainBadge chain={position.chain} size="sm" />
                </td>
                <td className="py-4 px-4 text-right font-mono text-sm">
                  {'suppliedAmount' in position
                    ? parseFloat(position.suppliedAmount) / Math.pow(10, position.asset.decimals)
                    : parseFloat(position.borrowedAmount) / Math.pow(10, position.asset.decimals)
                  }{' '}
                  {position.asset.symbol}
                </td>
                <td className="py-4 px-4 text-right font-semibold">
                  {formatUSD(amount)}
                </td>
                <td className="py-4 px-4 text-right">
                  <APYBadge apy={position.currentAPY} type={type} size="sm" />
                </td>
                <td className="py-4 px-4 text-right">
                  <span
                    className={type === 'supply' ? 'text-success' : 'text-danger'}
                  >
                    {type === 'supply' ? '+' : '-'}
                    {formatUSD(interest)}
                  </span>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {positions.map((position, index) => {
          const amount = 'suppliedAmountUSD' in position 
            ? position.suppliedAmountUSD 
            : position.borrowedAmountUSD;

          return (
            <motion.div
              key={`${position.asset.symbol}-${position.protocol}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 bg-wh-bg-card rounded-wh border border-gray-800"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-wh-gradient flex items-center justify-center text-white font-bold">
                    {position.asset.symbol.charAt(0)}
                  </div>
                  <span className="font-semibold">{position.asset.symbol}</span>
                </div>
                <span className="text-lg font-bold">{formatUSD(amount)}</span>
              </div>

              <div className="flex gap-2 mb-3">
                <ProtocolBadge protocol={position.protocol} size="sm" />
                <ChainBadge chain={position.chain} size="sm" />
                <APYBadge apy={position.currentAPY} type={type} size="sm" />
              </div>

              <div className="text-sm text-wh-text-secondary">
                Interest: {formatUSD('accruedInterestUSD' in position ? position.accruedInterestUSD : 0)}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}