// src/pages/Dashboard.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Layers, Activity } from 'lucide-react';
import { useMarketOverview, useMarketRates } from '@hooks/useMarketData';
import { Card, StatsCard } from '@components/ui/Card';
import { GradientText } from '@components/ui/GradientText';
import { LoadingSpinner, EmptyState, Skeleton } from '@components/ui/GradientText';
import { GlobalMarketStats } from '@components/dashboard/GlobalMarketOverview';
import { TopRatesTable } from '@components/dashboard/TopRatesTable';
import { ChainLiquidityChart } from '@components/dashboard/ChainLiquidityChart';
import { ProtocolTVLChart } from '@components/dashboard/ProtocolTVLChart';
import { formatCompactUSD, formatPercentage } from '@utils/formatters';
import { Chain, Protocol } from '@types';

export default function Dashboard() {
  const [selectedChain, setSelectedChain] = useState<Chain | 'all'>('all');
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | 'all'>('all');

  const { data: overview, isLoading: overviewLoading, error: overviewError } = useMarketOverview();
  const { data: rates, isLoading: ratesLoading, error: ratesError } = useMarketRates({
    chain: selectedChain !== 'all' ? selectedChain : undefined,
    protocol: selectedProtocol !== 'all' ? selectedProtocol : undefined,
  });

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl md:text-5xl font-bold">
          <GradientText>Multichain Lending Analytics</GradientText>
        </h1>
        <p className="text-lg text-wh-text-secondary max-w-2xl mx-auto">
          Compare lending and borrowing rates across Aave, Solend, and more.
          Powered by Wormhole Queries for real-time cross-chain data.
        </p>
      </motion.div>

      {/* Global Stats Cards */}
      {overviewLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton height={80} />
            </Card>
          ))}
        </div>
      ) : overviewError ? (
        <EmptyState
          icon={<Activity size={48} />}
          title="Failed to load market overview"
          description="Unable to fetch market data. Please try again."
        />
      ) : overview ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <motion.div variants={itemVariants}>
            <StatsCard
              title="Total Value Locked"
              value={formatCompactUSD(overview.totalValueLockedUSD)}
              subtitle="Across all protocols"
              icon={<DollarSign size={24} />}
              trend={{
                value: 2.5,
                isPositive: true,
              }}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <StatsCard
              title="Total Borrowed"
              value={formatCompactUSD(overview.totalBorrowedUSD)}
              subtitle="Active borrows"
              icon={<TrendingUp size={24} />}
              trend={{
                value: 1.8,
                isPositive: true,
              }}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <StatsCard
              title="Avg Supply APY"
              value={formatPercentage(overview.averageSupplyAPY)}
              subtitle="Weighted average"
              icon={<Activity size={24} />}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <StatsCard
              title="Protocols"
              value={overview.topProtocols.length}
              subtitle={`${overview.topAssets.length} assets`}
              icon={<Layers size={24} />}
            />
          </motion.div>
        </motion.div>
      ) : null}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chain Liquidity Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">
              Chain Liquidity Distribution
            </h2>
            {ratesLoading ? (
              <Skeleton height={300} />
            ) : rates ? (
              <ChainLiquidityChart rates={rates.rates} />
            ) : (
              <EmptyState
                title="No data available"
                description="Unable to load chart data"
              />
            )}
          </Card>
        </motion.div>

        {/* Protocol TVL */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Protocol TVL</h2>
            {overviewLoading ? (
              <Skeleton height={300} />
            ) : overview ? (
              <ProtocolTVLChart protocols={overview.topProtocols} />
            ) : (
              <EmptyState
                title="No data available"
                description="Unable to load chart data"
              />
            )}
          </Card>
        </motion.div>
      </div>

      {/* Top Rates Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <h2 className="text-xl font-semibold">🔥 Top Lending Rates</h2>
            
            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={selectedChain}
                onChange={(e) => setSelectedChain(e.target.value as Chain | 'all')}
                className="px-4 py-2 bg-wh-bg-input text-wh-text-primary rounded-wh border border-gray-700 focus:outline-none focus:ring-2 focus:ring-wh-primary-start/50"
              >
                <option value="all">All Chains</option>
                <option value={Chain.ETHEREUM}>Ethereum</option>
                <option value={Chain.POLYGON}>Polygon</option>
                <option value={Chain.ARBITRUM}>Arbitrum</option>
                <option value={Chain.SOLANA}>Solana</option>
              </select>

              <select
                value={selectedProtocol}
                onChange={(e) => setSelectedProtocol(e.target.value as Protocol | 'all')}
                className="px-4 py-2 bg-wh-bg-input text-wh-text-primary rounded-wh border border-gray-700 focus:outline-none focus:ring-2 focus:ring-wh-primary-start/50"
              >
                <option value="all">All Protocols</option>
                <option value={Protocol.AAVE}>Aave</option>
                <option value={Protocol.SOLEND}>Solend</option>
              </select>
            </div>
          </div>

          {ratesLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} height={60} />
              ))}
            </div>
          ) : ratesError ? (
            <EmptyState
              icon={<Activity size={48} />}
              title="Failed to load rates"
              description="Unable to fetch lending rates. Please try again."
            />
          ) : rates && rates.rates.length > 0 ? (
            <TopRatesTable rates={rates.rates} />
          ) : (
            <EmptyState
              title="No rates found"
              description="Try adjusting your filters to see more results."
            />
          )}
        </Card>
      </motion.div>

      {/* Top Assets Section */}
      {overview && overview.topAssets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">📊 Top Assets by TVL</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {overview.topAssets.slice(0, 6).map((asset, index) => (
                <motion.div
                  key={asset.symbol}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                >
                  <Card variant="glass" hoverable className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-lg">{asset.symbol}</p>
                        <p className="text-sm text-wh-text-secondary">
                          {formatCompactUSD(asset.tvlUSD)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-success font-medium">
                          {formatPercentage(asset.supplyAPY)}
                        </p>
                        <p className="text-xs text-wh-text-muted">APY</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}