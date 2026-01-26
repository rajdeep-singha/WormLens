// src/pages/Wallet.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet as WalletIcon, AlertCircle } from 'lucide-react';
import { useWalletPositions, useHealthFactor } from '@hooks/useWalletData';
import { useDebounce } from '@hooks/useDebounce';
import { useLocalStorage } from '@hooks/useLocalStorage';
import { Card } from '@components/ui/Card';
import { GradientText } from '@components/ui/GradientText';
import { LoadingSpinner, EmptyState } from '@components/ui/GradientText';
import { WalletInput } from '@components/wallet/WalletInput';
import { PositionsSummary } from '@components/wallet/PositionsSummary';
import { PositionsTable } from '@components/wallet/PositionsTable';
import { RiskIndicator } from '@components/wallet/RiskIndicator';
import { ChainBreakdown } from '@components/wallet/ChainBreakdown';
import { validateWalletAddress } from '@/types';

const EXAMPLE_ADDRESSES = [
  {
    label: 'Ethereum Whale',
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    chain: 'ethereum',
  },
  {
    label: 'DeFi Power User',
    address: '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503',
    chain: 'ethereum',
  },
];

export default function Wallet() {
  const [inputAddress, setInputAddress] = useState('');
  const [recentAddresses, setRecentAddresses] = useLocalStorage<string[]>(
    'recent-addresses',
    []
  );

  // Debounce the address input to avoid excessive API calls
  const debouncedAddress = useDebounce(inputAddress, 500);
  const validation = validateWalletAddress(debouncedAddress);

  // Only fetch if address is valid
  const {
    data: positions,
    isLoading: positionsLoading,
    error: positionsError,
  } = useWalletPositions(debouncedAddress);

  const {
    data: health,
    isLoading: healthLoading,
    error: healthError,
  } = useHealthFactor(debouncedAddress);

  const isLoading = positionsLoading || healthLoading;
  const hasError = positionsError || healthError;

  const handleAddressSubmit = (address: string) => {
    setInputAddress(address);
    
    // Add to recent addresses
    if (validateWalletAddress(address).isValid) {
      const updated = [
        address,
        ...recentAddresses.filter((a) => a !== address),
      ].slice(0, 5); // Keep only 5 most recent
      setRecentAddresses(updated);
    }
  };

  const hasPositions = positions && (
    positions.supplyPositions.length > 0 ||
    positions.borrowPositions.length > 0
  );

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl md:text-5xl font-bold">
          <GradientText>Analyze Wallet Positions</GradientText>
        </h1>
        <p className="text-lg text-wh-text-secondary max-w-2xl mx-auto">
          View lending and borrowing positions across all supported chains.
          No wallet connection required - just paste an address.
        </p>
      </motion.div>

      {/* Wallet Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <WalletInput
          value={inputAddress}
          onChange={setInputAddress}
          onSubmit={handleAddressSubmit}
          validation={validation}
          recentAddresses={recentAddresses}
          exampleAddresses={EXAMPLE_ADDRESSES}
        />
      </motion.div>

      {/* Loading State */}
      {isLoading && validation.isValid && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center py-12"
        >
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-wh-text-secondary">
              Fetching positions across chains...
            </p>
          </div>
        </motion.div>
      )}

      {/* Error State */}
      {hasError && validation.isValid && (
        <EmptyState
          icon={<AlertCircle size={48} />}
          title="Failed to load positions"
          description="Unable to fetch wallet data. The address may have no positions, or there was an error."
        />
      )}

      {/* Positions Display */}
      {!isLoading && !hasError && hasPositions && positions && (
        <>
          {/* Summary Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <PositionsSummary positions={positions} />
          </motion.div>

          {/* Risk Indicator */}
          {health && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <RiskIndicator health={health} />
            </motion.div>
          )}

          {/* Chain Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <ChainBreakdown positions={positions} />
          </motion.div>

          {/* Detailed Positions Tables */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            {/* Supply Positions */}
            {positions.supplyPositions.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">
                  💰 Supply Positions
                </h2>
                <PositionsTable
                  positions={positions.supplyPositions}
                  type="supply"
                />
              </Card>
            )}

            {/* Borrow Positions */}
            {positions.borrowPositions.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">
                  📊 Borrow Positions
                </h2>
                <PositionsTable
                  positions={positions.borrowPositions}
                  type="borrow"
                />
              </Card>
            )}
          </motion.div>
        </>
      )}

      {/* No Positions State */}
      {!isLoading && !hasError && !hasPositions && validation.isValid && (
        <EmptyState
          icon={<WalletIcon size={48} />}
          title="No positions found"
          description="This address doesn't have any active lending or borrowing positions on supported protocols."
        />
      )}

      {/* Empty State - No Address */}
      {!inputAddress && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <EmptyState
            icon={<WalletIcon size={64} />}
            title="Enter a wallet address to begin"
            description="Paste any Ethereum or Solana address above to analyze their lending positions across all supported protocols."
          />
        </motion.div>
      )}
    </div>
  );
}