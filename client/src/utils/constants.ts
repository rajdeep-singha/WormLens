// src/utils/constants.ts
export const REFRESH_INTERVALS = {
  FAST: 30 * 1000,      // 30 seconds
  MEDIUM: 60 * 1000,    // 1 minute
  SLOW: 5 * 60 * 1000,  // 5 minutes
};

export const ASSET_LOGOS: Record<string, string> = {
  ETH: '/assets/tokens/eth.svg',
  WETH: '/assets/tokens/eth.svg',
  USDC: '/assets/tokens/usdc.svg',
  USDT: '/assets/tokens/usdt.svg',
  DAI: '/assets/tokens/dai.svg',
  WBTC: '/assets/tokens/wbtc.svg',
  SOL: '/assets/tokens/sol.svg',
  MATIC: '/assets/tokens/matic.svg',
  ARB: '/assets/tokens/arb.svg',
};