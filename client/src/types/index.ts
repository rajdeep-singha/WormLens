export enum Chain{
    ETHEREUM = "ethereum",
    SOLANA = "solana",
    polygon = "polygon",
    Arbitrum = "arbitrum",
    POLYGON = "POLYGON",
    ARBITRUM = "ARBITRUM",
}

export enum Protocol {
  AAVE = 'aave',
  SOLEND = 'solend',
  COMPOUND = 'compound',
}
// Asset types 

export interface Asset {
    symbol: string;
    name:string;
    decimals:number;
    address:string;
    chain: Chain;
    logoURI?: string;
}
// Lending Rate Types
export interface LendingRate {
  asset : Asset;
  chain: Chain;
  protocol: Protocol;
  supplyAPY: number;
  borrowAPY: number;
  supplyAPR: number;
  borrowAPR: number;
  utilizationRate: number;
  totalSupply: string;
  totalBorrow:string;
  totalSupplyUSD:number;
  totalBurrowUSD:number;
  timestamp:number;
  totalBorrowUSD:number;
  
}
// Liquidity  Types
export interface Liquidity{
  asset : Asset;
  protocol: Protocol;
  chain:Chain;
  totalLiquidity:string;
  availableLiquidity:string;
  totalLiquidityUSD:number;
  availableLiquidityUSD:number;
  utilizationRate:number;
  timestamp:number;
}
// User Position Types
export interface UserSupplyPosition{
  asset : Asset;
  protocol: Protocol;
  chain:Chain;
  suppliedAmount:string;
  suppliedAmountUSD:number;
  currentAPY:number;
  AccuredInterest:string;
  AccuredInterestUSD:number;
}

export interface UserBorrowPosition{
  asset: Asset;
  protocol: Protocol;
  chain: Chain;
  borrowedAmount: string; // Amount borrowed in native units
  borrowedAmountUSD: number;
  currentAPY: number;
  accruedInterest: string; // Interest owed in native units
  accruedInterestUSD: number;
  healthFactor?: number; 
}
export interface UserPositions {
  walletAddress: string;
  supplyPositions: UserSupplyPosition[];
  borrowPositions: UserBorrowPosition[];
  totalSuppliedUSD: number;
  totalBorrowedUSD: number;
  netAPY: number; // Weighted average APY
  healthFactor?: number; // Overall account health
  timestamp: number;
  
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
  result: string; // Hex-encoded result
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
    [key: string]: string; // e.g., { pool: '0x...', oracle: '0x...' }
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