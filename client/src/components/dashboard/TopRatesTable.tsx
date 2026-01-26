// src/components/dashboard/TopRatesTable.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, ExternalLink } from 'lucide-react';
import { LendingRate } from '@types';
import { ChainBadge, ProtocolBadge, APYBadge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { formatCompactUSD, formatPercentage } from '@utils/formatters';
import clsx from 'clsx';

interface TopRatesTableProps {
  rates: LendingRate[];
}

type SortField = 'supplyAPY' | 'borrowAPY' | 'utilization' | 'tvl';
type SortDirection = 'asc' | 'desc';

export function TopRatesTable({ rates }: TopRatesTableProps) {
  const [sortField, setSortField] = useState<SortField>('supplyAPY');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedRates = [...rates].sort((a, b) => {
    let aValue: number, bValue: number;

    switch (sortField) {
      case 'supplyAPY':
        aValue = a.supplyAPY;
        bValue = b.supplyAPY;
        break;
      case 'borrowAPY':
        aValue = a.borrowAPY;
        bValue = b.borrowAPY;
        break;
      case 'utilization':
        aValue = a.utilizationRate;
        bValue = b.utilizationRate;
        break;
      case 'tvl':
        aValue = a.totalSupplyUSD;
        bValue = b.totalSupplyUSD;
        break;
    }

    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className={clsx(
        'flex items-center gap-1 font-semibold text-sm transition-colors',
        sortField === field
          ? 'text-wh-primary-start'
          : 'text-wh-text-secondary hover:text-wh-text-primary'
      )}
    >
      {label}
      <ArrowUpDown
        size={14}
        className={clsx(
          'transition-transform',
          sortField === field && sortDirection === 'desc' && 'rotate-180'
        )}
      />
    </button>
  );

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
            <th className="text-right py-3 px-4">
              <SortButton field="supplyAPY" label="Supply APY" />
            </th>
            <th className="text-right py-3 px-4">
              <SortButton field="borrowAPY" label="Borrow APY" />
            </th>
            <th className="text-right py-3 px-4">
              <SortButton field="utilization" label="Utilization" />
            </th>
            <th className="text-right py-3 px-4">
              <SortButton field="tvl" label="TVL" />
            </th>
            <th className="text-right py-3 px-4 text-wh-text-secondary font-semibold text-sm">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedRates.map((rate, index) => (
            <motion.tr
              key={`${rate.asset.symbol}-${rate.protocol}-${rate.chain}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onMouseEnter={() => setHoveredRow(index)}
              onMouseLeave={() => setHoveredRow(null)}
              className={clsx(
                'border-b border-gray-800/50 transition-colors',
                hoveredRow === index && 'bg-wh-bg-card-hover'
              )}
            >
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-wh-gradient flex items-center justify-center text-white font-bold text-sm">
                    {rate.asset.symbol.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{rate.asset.symbol}</p>
                    <p className="text-xs text-wh-text-muted">{rate.asset.name}</p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                <ProtocolBadge protocol={rate.protocol} />
              </td>
              <td className="py-4 px-4">
                <ChainBadge chain={rate.chain} />
              </td>
              <td className="py-4 px-4 text-right">
                <APYBadge apy={rate.supplyAPY} type="supply" />
              </td>
              <td className="py-4 px-4 text-right">
                <APYBadge apy={rate.borrowAPY} type="borrow" />
              </td>
              <td className="py-4 px-4 text-right">
                <span className="text-wh-text-primary">
                  {formatPercentage(rate.utilizationRate)}
                </span>
              </td>
              <td className="py-4 px-4 text-right">
                <span className="font-medium">{formatCompactUSD(rate.totalSupplyUSD)}</span>
              </td>
              <td className="py-4 px-4 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ExternalLink size={14} />}
                  iconPosition="right"
                  onClick={() => window.open(`/compare?asset=${rate.asset.symbol}`, '_blank')}
                >
                  Compare
                </Button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {sortedRates.map((rate, index) => (
          <motion.div
            key={`${rate.asset.symbol}-${rate.protocol}-${rate.chain}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 bg-wh-bg-card rounded-wh border border-gray-800 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-wh-gradient flex items-center justify-center text-white font-bold">
                  {rate.asset.symbol.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">{rate.asset.symbol}</p>
                  <p className="text-xs text-wh-text-muted">{rate.asset.name}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={<ExternalLink size={14} />}
                onClick={() => window.open(`/compare?asset=${rate.asset.symbol}`, '_blank')}
              />
            </div>

            <div className="flex gap-2">
              <ProtocolBadge protocol={rate.protocol} size="sm" />
              <ChainBadge chain={rate.chain} size="sm" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-wh-text-muted mb-1">Supply APY</p>
                <APYBadge apy={rate.supplyAPY} type="supply" size="sm" />
              </div>
              <div>
                <p className="text-xs text-wh-text-muted mb-1">Borrow APY</p>
                <APYBadge apy={rate.borrowAPY} type="borrow" size="sm" />
              </div>
              <div>
                <p className="text-xs text-wh-text-muted mb-1">Utilization</p>
                <p className="text-sm font-medium">{formatPercentage(rate.utilizationRate)}</p>
              </div>
              <div>
                <p className="text-xs text-wh-text-muted mb-1">TVL</p>
                <p className="text-sm font-medium">{formatCompactUSD(rate.totalSupplyUSD)}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}