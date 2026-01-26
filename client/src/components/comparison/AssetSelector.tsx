// src/components/comparison/AssetSelector.tsx
import { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

interface AssetSelectorProps {
  value: string;
  onChange: (value: string) => void;
  popularAssets: string[];
}

const ALL_ASSETS = [
  { symbol: 'USDC', name: 'USD Coin' },
  { symbol: 'USDT', name: 'Tether USD' },
  { symbol: 'DAI', name: 'Dai Stablecoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'WETH', name: 'Wrapped Ether' },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin' },
  { symbol: 'SOL', name: 'Solana' },
  { symbol: 'LINK', name: 'Chainlink' },
  { symbol: 'UNI', name: 'Uniswap' },
  { symbol: 'AAVE', name: 'Aave' },
  { symbol: 'CRV', name: 'Curve DAO' },
  { symbol: 'MATIC', name: 'Polygon' },
  { symbol: 'ARB', name: 'Arbitrum' },
  { symbol: 'OP', name: 'Optimism' },
];

export function AssetSelector({
  value,
  onChange,
  popularAssets,
}: AssetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredAssets = ALL_ASSETS.filter(
    (asset) =>
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (symbol: string) => {
    onChange(symbol);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Main Input */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
          }
        }}
        className={clsx(
          'w-full flex items-center justify-between px-4 py-3 bg-wh-bg-input rounded-wh border transition-all',
          isOpen
            ? 'border-wh-primary-start ring-2 ring-wh-primary-start/50'
            : 'border-gray-700 hover:border-gray-600'
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-wh-gradient flex items-center justify-center text-white font-bold text-sm">
            {value.charAt(0)}
          </div>
          <span className="font-semibold text-wh-text-primary">{value}</span>
        </div>
        <ChevronDown
          size={20}
          className={clsx(
            'text-wh-text-muted transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Popular Assets Quick Select */}
      <div className="flex flex-wrap gap-2 mt-3">
        {popularAssets.map((asset) => (
          <button
            key={asset}
            onClick={() => handleSelect(asset)}
            className={clsx(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
              value === asset
                ? 'bg-wh-gradient text-white'
                : 'bg-wh-bg-card border border-gray-700 text-wh-text-secondary hover:border-wh-primary-start hover:text-wh-text-primary'
            )}
          >
            {asset}
          </button>
        ))}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-wh-bg-card border border-gray-700 rounded-wh shadow-xl overflow-hidden"
          >
            {/* Search Input */}
            <div className="p-3 border-b border-gray-800">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-wh-text-muted"
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search assets..."
                  className="w-full pl-10 pr-10 py-2 bg-wh-bg-input text-wh-text-primary rounded-wh border border-gray-700 focus:outline-none focus:border-wh-primary-start placeholder:text-wh-text-muted"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-wh-text-muted hover:text-wh-text-primary"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Assets List */}
            <div className="max-h-64 overflow-y-auto">
              {filteredAssets.length === 0 ? (
                <div className="p-4 text-center text-wh-text-muted">
                  No assets found
                </div>
              ) : (
                filteredAssets.map((asset) => (
                  <button
                    key={asset.symbol}
                    onClick={() => handleSelect(asset.symbol)}
                    className={clsx(
                      'w-full flex items-center gap-3 px-4 py-3 transition-colors',
                      value === asset.symbol
                        ? 'bg-wh-primary-start/20'
                        : 'hover:bg-wh-bg-card-hover'
                    )}
                  >
                    <div className="w-8 h-8 rounded-full bg-wh-gradient flex items-center justify-center text-white font-bold text-sm">
                      {asset.symbol.charAt(0)}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-wh-text-primary">
                        {asset.symbol}
                      </p>
                      <p className="text-xs text-wh-text-muted">{asset.name}</p>
                    </div>
                    {value === asset.symbol && (
                      <span className="ml-auto text-wh-primary-start">✓</span>
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

