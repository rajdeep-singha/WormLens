// src/pages/Compare.tsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';
import { useRateComparison } from '@hooks/useMarketData';
import { Card } from '@components/ui/Card';
import { GradientText } from '@components/ui/GradientText';
import { Button } from '@components/ui/Button';
import { LoadingSpinner, EmptyState, Skeleton } from '@components/ui/GradientText';
import { AssetSelector } from '@components/comparison/AssetSelector';
import { RateComparisonCard } from '@components/comparison/RateComparisonCard';
import { OpportunityHighlight } from '@components/comparison/OpportunityHighlight';
import { ChainBadge, ProtocolBadge } from '@components/ui/Badge';
import { formatCompactUSD } from '@utils/formatters';
import { Chain, Protocol } from '@types';

const POPULAR_ASSETS = ['USDC', 'ETH', 'USDT', 'DAI', 'WBTC', 'SOL'];

export default function Compare() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedAsset, setSelectedAsset] = useState(searchParams.get('asset') || 'USDC');
  const [selectedChains, setSelectedChains] = useState<Chain[]>([]);
  const [selectedProtocols, setSelectedProtocols] = useState<Protocol[]>([]);

  const chainsParam = selectedChains.length > 0 ? selectedChains.join(',') : undefined;
  const protocolsParam = selectedProtocols.length > 0 ? selectedProtocols.join(',') : undefined;

  const { data, isLoading, error } = useRateComparison(
    selectedAsset,
    chainsParam,
    protocolsParam
  );

  // Update URL when asset changes
  useEffect(() => {
    if (selectedAsset) {
      setSearchParams({ asset: selectedAsset });
    }
  }, [selectedAsset, setSearchParams]);

  // Calculate opportunities
  const opportunities = data ? [
    {
      type: 'supply' as const,
      title: 'Best Supply Rate',
      rate: data.bestSupply,
      savingsPercent: data.comparison.length > 1
        ? ((data.bestSupply.supplyAPY - data.comparison[data.comparison.length - 1].supplyAPY) / 
           Math.max(data.comparison[data.comparison.length - 1].supplyAPY, 0.01) * 100)
        : 0,
    },
    {
      type: 'borrow' as const,
      title: 'Best Borrow Rate',
      rate: data.bestBorrow,
      savingsPercent: data.comparison.length > 1
        ? ((data.comparison[data.comparison.length - 1].borrowAPY - data.bestBorrow.borrowAPY) / 
           Math.max(data.comparison[data.comparison.length - 1].borrowAPY, 0.01) * 100)
        : 0,
    },
  ] : [];

  // Filter unique chains from Chain enum
  const uniqueChains = [Chain.ETHEREUM, Chain.POLYGON, Chain.ARBITRUM, Chain.SOLANA];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl md:text-5xl font-bold">
          <GradientText>Compare Rates</GradientText>
        </h1>
        <p className="text-lg text-wh-text-secondary max-w-2xl mx-auto">
          Find the best lending and borrowing rates across all chains and protocols.
          Save money by choosing the most competitive rates.
        </p>
      </motion.div>

      {/* Asset Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6">
          <div className="space-y-6">
            {/* Search Asset */}
            <div>
              <label className="block text-sm font-medium text-wh-text-secondary mb-2">
                Select Asset to Compare
              </label>
              <AssetSelector
                value={selectedAsset}
                onChange={setSelectedAsset}
                popularAssets={POPULAR_ASSETS}
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-wh-text-secondary mb-2">
                  Filter by Chains (Optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {uniqueChains.map((chain) => (
                    <Button
                      key={chain}
                      variant={selectedChains.includes(chain) ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => {
                        setSelectedChains((prev) =>
                          prev.includes(chain)
                            ? prev.filter((c) => c !== chain)
                            : [...prev, chain]
                        );
                      }}
                    >
                      {chain}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-wh-text-secondary mb-2">
                  Filter by Protocols (Optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.values(Protocol).map((protocol) => (
                    <Button
                      key={protocol}
                      variant={selectedProtocols.includes(protocol) ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => {
                        setSelectedProtocols((prev) =>
                          prev.includes(protocol)
                            ? prev.filter((p) => p !== protocol)
                            : [...prev, protocol]
                        );
                      }}
                    >
                      {protocol}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <EmptyState
          icon={<Search size={48} />}
          title="Failed to load comparison data"
          description="Unable to fetch rates for comparison. Please try again."
        />
      )}

      {/* Opportunities Highlight */}
      {data && opportunities && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {opportunities.map((opp, index) => (
            <OpportunityHighlight
              key={opp.type}
              type={opp.type}
              title={opp.title}
              rate={opp.rate}
              savingsPercent={opp.savingsPercent}
              delay={0.2 + index * 0.1}
            />
          ))}
        </motion.div>
      )}

      {/* Comparison Results */}
      {data && data.comparison.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Supply Rates */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <TrendingUp className="text-success" size={24} />
                Supply APY Comparison
              </h2>
              <div className="text-sm text-wh-text-muted">
                Higher is better
              </div>
            </div>
            <div className="space-y-3">
              {[...data.comparison]
                .sort((a, b) => b.supplyAPY - a.supplyAPY)
                .map((item, index) => (
                  <RateComparisonCard
                    key={`supply-${item.protocol}-${item.chain}`}
                    item={item}
                    type="supply"
                    rank={index + 1}
                    isBest={index === 0}
                    delay={0.3 + index * 0.05}
                  />
                ))}
            </div>
          </Card>

          {/* Borrow Rates */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <TrendingDown className="text-info" size={24} />
                Borrow APY Comparison
              </h2>
              <div className="text-sm text-wh-text-muted">
                Lower is better
              </div>
            </div>
            <div className="space-y-3">
              {[...data.comparison]
                .sort((a, b) => a.borrowAPY - b.borrowAPY)
                .map((item, index) => (
                  <RateComparisonCard
                    key={`borrow-${item.protocol}-${item.chain}`}
                    item={item}
                    type="borrow"
                    rank={index + 1}
                    isBest={index === 0}
                    delay={0.4 + index * 0.05}
                  />
                ))}
            </div>
          </Card>

          {/* Additional Metrics */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Additional Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.comparison.map((item) => (
                <div
                  key={`metrics-${item.protocol}-${item.chain}`}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ChainBadge chain={item.chain} size="sm" />
                      <ProtocolBadge protocol={item.protocol} size="sm" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-wh-text-muted">Utilization</span>
                      <span className="font-medium">
                        {item.utilizationRate.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-wh-text-muted">Available</span>
                      <span className="font-medium">
                        {formatCompactUSD(item.availableLiquidityUSD)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* No Results */}
      {data && data.comparison.length === 0 && (
        <EmptyState
          icon={<Search size={48} />}
          title="No rates found"
          description={`No lending rates available for ${selectedAsset} with the selected filters.`}
        />
      )}
    </div>
  );
}
