// src/types/index.ts

export enum Chain {
  ETHEREUM = "ethereum",
  SOLANA = "solana",
  POLYGON = "polygon",
  ARBITRUM = "arbitrum",
}

export enum Protocol {
  AAVE = 'aave',
  SOLEND = 'solend',
  COMPOUND = 'compound',
}

// Chain Info for display
export interface ChainInfoItem {
  name: string;
  color: string;
  icon?: string;
}

export const CHAIN_INFO: Record<Chain, ChainInfoItem> = {
  [Chain.ETHEREUM]: {
    name: 'Ethereum',
    color: '#627EEA',
    icon: '⟠',
  },
  [Chain.POLYGON]: {
    name: 'Polygon',
    color: '#8247E5',
    icon: '⬡',
  },
  [Chain.ARBITRUM]: {
    name: 'Arbitrum',
    color: '#28A0F0',
    icon: '🅰️',
  },
  [Chain.SOLANA]: {
    name: 'Solana',
    color: '#14F195',
    icon: '◎',
  },
};

// Protocol Info for display
export interface ProtocolInfoItem {
  name: string;
  color: string;
  icon?: string;
}

export const PROTOCOL_INFO: Record<Protocol, ProtocolInfoItem> = {
  [Protocol.AAVE]: {
    name: 'Aave',
    color: '#B6509E',
    icon: '👻',
  },
  [Protocol.SOLEND]: {
    name: 'Solend',
    color: '#14F195',
    icon: '☀️',
  },
  [Protocol.COMPOUND]: {
    name: 'Compound',
    color: '#00D395',
    icon: '🧪',
  },
};

// Risk colors
export const RISK_COLORS = {
  safe: '#10B981',
  moderate: '#F59E0B',
  risky: '#F97316',
  danger: '#EF4444',
};

// Asset types 
export interface Asset {
  symbol: string;
  name: string;
  decimals: number;
  address: string;
  chain: Chain;
  logoURI?: string;
}

// Lending Rate Types
export interface LendingRate {
  asset: Asset;
  chain: Chain;
  protocol: Protocol;
  supplyAPY: number;
  borrowAPY: number;
  supplyAPR: number;
  borrowAPR: number;
  utilizationRate: number;
  totalSupply: string;
  totalBorrow: string;
  totalSupplyUSD: number;
  totalBurrowUSD: number;
  timestamp: number;
  totalBorrowUSD: number;
}

// Liquidity Types
export interface Liquidity {
  asset: Asset;
  protocol: Protocol;
  chain: Chain;
  totalLiquidity: string;
  availableLiquidity: string;
  totalLiquidityUSD: number;
  availableLiquidityUSD: number;
  utilizationRate: number;
  timestamp: number;
}

// User Position Types
export interface UserSupplyPosition {
  asset: Asset;
  protocol: Protocol;
  chain: Chain;
  suppliedAmount: string;
  suppliedAmountUSD: number;
  currentAPY: number;
  AccuredInterest: string;
  AccuredInterestUSD: number;
}

export interface UserBorrowPosition {
  asset: Asset;
  protocol: Protocol;
  chain: Chain;
  borrowedAmount: string;
  borrowedAmountUSD: number;
  currentAPY: number;
  accruedInterest: string;
  accruedInterestUSD: number;
  healthFactor?: number;
}

export interface UserPositions {
  walletAddress: string;
  supplyPositions: UserSupplyPosition[];
  borrowPositions: UserBorrowPosition[];
  totalSuppliedUSD: number;
  totalBorrowedUSD: number;
  netAPY: number;
  healthFactor?: number;
  timestamp: number;
}

// Health Factor Types
export type RiskLevel = 'safe' | 'moderate' | 'risky' | 'danger';

export interface HealthFactor {
  healthFactor: number;
  riskLevel: RiskLevel;
  collateralUSD: number;
  debtUSD: number;
  availableToBorrowUSD: number;
  liquidationThreshold: number;
  timestamp: number;
}

// Market Overview Types
export interface MarketOverview {
  totalValueLockedUSD: number;
  totalBorrowedUSD: number;
  averageSupplyAPY: number;
  averageBorrowAPY: number;
  topProtocols: Array<{
    protocol: Protocol;
    tvlUSD: number;
    chains: string[];
  }>;
  topAssets: Array<{
    symbol: string;
    tvlUSD: number;
    supplyAPY: number;
    borrowAPY: number;
  }>;
  lastUpdated: number;
}

// Rate Comparison Types
export interface RateComparisonItem {
  protocol: Protocol;
  chain: Chain;
  supplyAPY: number;
  borrowAPY: number;
  utilizationRate: number;
  availableLiquidityUSD: number;
  totalSupplyUSD: number;
}

export interface RateComparison {
  asset: string;
  comparison: RateComparisonItem[];
  bestSupply: RateComparisonItem;
  bestBorrow: RateComparisonItem;
  timestamp: number;
}

// Best Rates Types
export interface BestRates {
  asset: string;
  type: 'supply' | 'borrow';
  bestRate: LendingRate;
  alternativeRates: LendingRate[];
  savingsPercent: number;
  timestamp: number;
}

// Utilization Rates Types
export interface UtilizationRates {
  rates: Array<{
    protocol: Protocol;
    chain: Chain;
    asset: string;
    utilizationRate: number;
    totalSupplyUSD: number;
    totalBorrowUSD: number;
  }>;
  averageUtilization: number;
  timestamp: number;
}

// Supported Response
export interface SupportedResponse {
  chains: Chain[];
  protocols: Protocol[];
}

// Wormhole Query Types
export interface WormholeQueryRequest {
  chain: Chain;
  contractAddress: string;
  callData: string;
  blockNumber?: number;
}

export interface WormholeQueryResponse {
  blockNumber: number;
  blockHash: string;
  result: string;
}

// Aave specific types
export interface AaveReserveData {
  configuration: string;
  liquidityIndex: string;
  currentLiquidityRate: string;
  variableBorrowIndex: string;
  currentVariableBorrowRate: string;
  currentStableBorrowRate: string;
  lastUpdateTimestamp: number;
  aTokenAddress: string;
  stableDebtTokenAddress: string;
  variableDebtTokenAddress: string;
  interestRateStrategyAddress: string;
  availableLiquidity: string;
  totalStableDebt: string;
  totalVariableDebt: string;
  liquidityRate: string;
  variableBorrowRate: string;
  stableBorrowRate: string;
  averageStableBorrowRate: string;
  utilizationRate: string;
}

export interface AaveUserAccountData {
  totalCollateralETH: string;
  totalDebtETH: string;
  availableBorrowsETH: string;
  currentLiquidationThreshold: string;
  ltv: string;
  healthFactor: string;
}

// Solend specific types
export interface SolendReserve {
  liquidity: {
    mintPubkey: string;
    supplyPubkey: string;
    availableAmount: string;
    borrowedAmountWads: string;
    cumulativeBorrowRateWads: string;
    marketPrice: string;
  };
  collateral: {
    mintPubkey: string;
    mintTotalSupply: string;
    supplyPubkey: string;
  };
  config: {
    loanToValueRatio: number;
    liquidationThreshold: number;
    liquidationBonus: number;
    optimalUtilizationRate: number;
    maxBorrowRate: string;
  };
  lastUpdate: {
    slot: number;
    stale: boolean;
  };
}

// Aggregated Response Types
export interface AggregatedRates {
  rates: LendingRate[];
  chains: Chain[];
  protocols: Protocol[];
  lastUpdated: number;
}

export interface AggregatedLiquidity {
  liquidity: Liquidity[];
  totalLiquidityUSD: number;
  chains: Chain[];
  protocols: Protocol[];
  lastUpdated: number;
}

// API Response Types 
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: number;
}

// Configuration Types 
export interface ChainConfig {
  chain: Chain;
  rpcUrl: string;
  wormholeChainId: number;
  protocols: ProtocolConfig[];
}

export interface ProtocolConfig {
  protocol: Protocol;
  contractAddresses: {
    [key: string]: string;
  };
}

export interface WormholeConfig {
  apiKey: string;
  environment: 'mainnet' | 'testnet';
  timeout: number;
}

// Price Feed Types
export interface PriceData {
  asset: string;
  priceUSD: number;
  timestamp: number;
  source: string;
}

// Error Types 
export class LendingAnalyticsError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'LendingAnalyticsError';
  }
}

export enum ErrorCode {
  INVALID_CHAIN = 'INVALID_CHAIN',
  INVALID_PROTOCOL = 'INVALID_PROTOCOL',
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  QUERY_FAILED = 'QUERY_FAILED',
  DECODE_FAILED = 'DECODE_FAILED',
  PRICE_FETCH_FAILED = 'PRICE_FETCH_FAILED',
  AGGREGATION_FAILED = 'AGGREGATION_FAILED',
  WORMHOLE_ERROR = 'WORMHOLE_ERROR',
}

// Validation Types
export interface WalletValidation {
  isValid: boolean;
  chain?: string;
  error?: string;
}

// Wallet Address Validation Utility
export function validateWalletAddress(address: string): WalletValidation {
  if (!address || address.trim().length === 0) {
    return {
      isValid: false,
      error: 'Address is required',
    };
  }

  const trimmedAddress = address.trim();

  // Ethereum-like address (0x...)
  if (trimmedAddress.startsWith('0x')) {
    if (/^0x[a-fA-F0-9]{40}$/.test(trimmedAddress)) {
      return {
        isValid: true,
        chain: 'Ethereum',
      };
    }
    return {
      isValid: false,
      error: 'Invalid Ethereum address format',
    };
  }

  // Solana address (base58, 32-44 chars)
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmedAddress)) {
    return {
      isValid: true,
      chain: 'Solana',
    };
  }

  return {
    isValid: false,
    error: 'Invalid wallet address format',
  };
}
