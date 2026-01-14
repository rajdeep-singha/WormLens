import { Chain, Protocol } from '../types';

/**
 * Aave V3 Pool ABI (minimal - only what we need)
 */
export const AAVE_POOL_ABI = [
  // Get reserve data
  'function getReserveData(address asset) external view returns (tuple(uint256 configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt))',
  
  // Get user account data
  'function getUserAccountData(address user) external view returns (uint256 totalCollateralBase, uint256 totalDebtBase, uint256 availableBorrowsBase, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)',
  
  // Get reserves list
  'function getReservesList() external view returns (address[])',
];

/**
 * Aave V3 Protocol Data Provider ABI
 */
export const AAVE_DATA_PROVIDER_ABI = [
  'function getReserveConfigurationData(address asset) external view returns (uint256 decimals, uint256 ltv, uint256 liquidationThreshold, uint256 liquidationBonus, uint256 reserveFactor, bool usageAsCollateralEnabled, bool borrowingEnabled, bool stableBorrowRateEnabled, bool isActive, bool isFrozen)',
  'function getReserveData(address asset) external view returns (uint256 unbacked, uint256 accruedToTreasuryScaled, uint256 totalAToken, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 liquidityRate, uint256 variableBorrowRate, uint256 stableBorrowRate, uint256 averageStableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex, uint40 lastUpdateTimestamp)',
  'function getUserReserveData(address asset, address user) external view returns (uint256 currentATokenBalance, uint256 currentStableDebt, uint256 currentVariableDebt, uint256 principalStableDebt, uint256 scaledVariableDebt, uint256 stableBorrowRate, uint256 liquidityRate, uint40 stableRateLastUpdated, bool usageAsCollateralEnabled)',
];

/**
 * Aave Price Oracle ABI
 */
export const AAVE_ORACLE_ABI = [
  'function getAssetPrice(address asset) external view returns (uint256)',
  'function getAssetsPrices(address[] calldata assets) external view returns (uint256[])',
];

/**
 * ERC20 ABI (for token info)
 */
export const ERC20_ABI = [
  'function name() external view returns (string)',
  'function symbol() external view returns (string)',
  'function decimals() external view returns (uint8)',
  'function totalSupply() external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
];

/**
 * Protocol contract addresses per chain
 */
export interface ProtocolAddresses {
  pool: string;
  dataProvider?: string;
  oracle: string;
}

/**
 * Aave V3 Contract Addresses
 */
export const AAVE_ADDRESSES: Record<Chain, ProtocolAddresses | null> = {
  [Chain.ETHEREUM]: {
    pool: process.env.AAVE_ETH_POOL || '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
    dataProvider: '0x7B4EB56E7CD4b454BA8ff71E4518426369a138a3',
    oracle: process.env.AAVE_ETH_ORACLE || '0x54586bE62E3c3580375aE3723C145253060Ca0C2',
  },
  //   [Chain.POLYGON]: {
  //     pool: process.env.AAVE_POLYGON_POOL || '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
  //     dataProvider: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
  //     oracle: process.env.AAVE_POLYGON_ORACLE || '0xb023e699F5a33916Ea823A16485e259257cA8Bd1',
  //   },
  //   [Chain.ARBITRUM]: {
  //     pool: process.env.AAVE_ARBITRUM_POOL || '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
  //     dataProvider: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
  //     oracle: process.env.AAVE_ARBITRUM_ORACLE || '0xb56c2F0B653B2e0b10C9b928C8580Ac5Df02C7C7',
  //   },
  [Chain.SOLANA]: null,
  [Chain.polygon]: null,
  [Chain.Arbitrum]: null,
  [Chain.POLYGON]: null,
  [Chain.ARBITRUM]: null
};

/**
 * Solend Program Addresses
 */
export const SOLEND_ADDRESSES = {
  programId: process.env.SOLEND_PROGRAM_ID || 'So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo',
  mainPool: process.env.SOLEND_MAIN_POOL || '4UpD2fh7xH3VP9QQaXtsS1YY3bxzWhtfpks7FatyKvdY',
};

/**
 * Supported assets per protocol per chain
 */
export interface AssetConfig {
  logoURI: string | undefined;
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  coingeckoId?: string;
}

/**
 * Aave supported assets
 */
export const AAVE_ASSETS: Record<Chain, AssetConfig[] | null> = {
  [Chain.ETHEREUM]: [
    {
      symbol: 'ETH',
      name: 'Ethereum',
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
      decimals: 18,
      coingeckoId: 'ethereum',
      logoURI: undefined
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      decimals: 6,
      coingeckoId: 'usd-coin',
      logoURI: undefined
    },
    {
      symbol: 'USDT',
      name: 'Tether USD',
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      decimals: 6,
      coingeckoId: 'tether',
      logoURI: undefined
    },
    {
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      decimals: 18,
      coingeckoId: 'dai',
      logoURI: undefined
    },
    {
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      decimals: 8,
      coingeckoId: 'wrapped-bitcoin',
      logoURI: undefined
    },
  ],
  //   [Chain.POLYGON]: [
  //     {
  //       symbol: 'MATIC',
  //       name: 'Polygon',
  //       address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', // WMATIC
  //       decimals: 18,
  //       coingeckoId: 'matic-network',
  //     },
  //     {
  //       symbol: 'USDC',
  //       name: 'USD Coin',
  //       address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  //       decimals: 6,
  //       coingeckoId: 'usd-coin',
  //     },
  //     {
  //       symbol: 'USDT',
  //       name: 'Tether USD',
  //       address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
  //       decimals: 6,
  //       coingeckoId: 'tether',
  //     },
  //     {
  //       symbol: 'DAI',
  //       name: 'Dai Stablecoin',
  //       address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
  //       decimals: 18,
  //       coingeckoId: 'dai',
  //     },
  //   ],
  //   [Chain.ARBITRUM]: [
  //     {
  //       symbol: 'ETH',
  //       name: 'Ethereum',
  //       address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // WETH
  //       decimals: 18,
  //       coingeckoId: 'ethereum',
  //     },
  //     {
  //       symbol: 'USDC',
  //       name: 'USD Coin',
  //       address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  //       decimals: 6,
  //       coingeckoId: 'usd-coin',
  //     },
  //     {
  //       symbol: 'USDT',
  //       name: 'Tether USD',
  //       address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
  //       decimals: 6,
  //       coingeckoId: 'tether',
  //     },
  //     {
  //       symbol: 'ARB',
  //       name: 'Arbitrum',
  //       address: '0x912CE59144191C1204E64559FE8253a0e49E6548',
  //       decimals: 18,
  //       coingeckoId: 'arbitrum',
  //     },
  //   ],
  [Chain.SOLANA]: null,
  [Chain.polygon]: null,
  [Chain.Arbitrum]: null,
  [Chain.POLYGON]: null,
  [Chain.ARBITRUM]: null
};

/**
 * Solend supported assets
 */
export const SOLEND_ASSETS: AssetConfig[] = [
  {
    symbol: 'SOL',
    name: 'Solana',
    address: 'So11111111111111111111111111111111111111112', // Wrapped SOL
    decimals: 9,
    coingeckoId: 'solana',
    logoURI: undefined
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6,
    coingeckoId: 'usd-coin',
    logoURI: undefined
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    decimals: 6,
    coingeckoId: 'tether',
    logoURI: undefined
  },
];

/**
 * Get protocol addresses for a specific chain and protocol
 */
export function getProtocolAddresses(
  protocol: Protocol,
  chain: Chain
): ProtocolAddresses | null {
  if (protocol === Protocol.AAVE) {
    return AAVE_ADDRESSES[chain];
  }
  // Add other protocols here
  return null;
}

/**
 * Get supported assets for a protocol and chain
 */
export function getProtocolAssets(
  protocol: Protocol,
  chain: Chain
): AssetConfig[] {
  if (protocol === Protocol.AAVE) {
    return AAVE_ASSETS[chain] || [];
  }
  if (protocol === Protocol.SOLEND && chain === Chain.SOLANA) {
    return SOLEND_ASSETS;
  }
  return [];
}

/**
 * Find asset by symbol
 */
export function findAsset(
  symbol: string,
  protocol: Protocol,
  chain: Chain
): AssetConfig | undefined {
  const assets = getProtocolAssets(protocol, chain);
  return assets.find(a => a.symbol.toUpperCase() === symbol.toUpperCase());
}

/**
 * Check if protocol is supported on chain
 */
export function isProtocolSupported(protocol: Protocol, chain: Chain): boolean {
  if (protocol === Protocol.AAVE) {
    return AAVE_ADDRESSES[chain] !== null;
  }
  if (protocol === Protocol.SOLEND) {
    return chain === Chain.SOLANA;
  }
  return false;
}

export default {
  AAVE_ADDRESSES,
  SOLEND_ADDRESSES,
  AAVE_ASSETS,
  SOLEND_ASSETS,
  getProtocolAddresses,
  getProtocolAssets,
  findAsset,
  isProtocolSupported,
};