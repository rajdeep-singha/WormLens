import { getWormholeClient } from '../config/wormholeClient';
import {
  AAVE_POOL_ABI,
  AAVE_DATA_PROVIDER_ABI,
  AAVE_ORACLE_ABI,
  getProtocolAddresses,
  getProtocolAssets,
} from '../config/protocols';
import { DecoderUtils } from '../utils/decoder';
import {
  Chain,
  Protocol,
  AaveReserveData,
  AaveUserAccountData,
  LendingAnalyticsError,
  ErrorCode,
} from '../types';

/**
 * Query Aave reserve data for a specific asset
 */
export async function getAaveReserveData(
  chain: Chain,
  assetAddress: string
): Promise<AaveReserveData> {
  try {
    const wormhole = getWormholeClient();
    const addresses = getProtocolAddresses(Protocol.AAVE, chain);

    if (!addresses) {
      throw new LendingAnalyticsError(
        `Aave not supported on ${chain}`,
        ErrorCode.INVALID_CHAIN,
        400
      );
    }

    console.log(`📊 Querying Aave reserve data for ${assetAddress} on ${chain}...`);

    // Call Pool.getReserveData(asset)
    const reserveData = await wormhole.callContract(
      chain,
      addresses.pool,
      AAVE_POOL_ABI,
      'getReserveData',
      [assetAddress]
    );

    // Call DataProvider.getReserveData(asset) for additional info
    let additionalData;
    if (addresses.dataProvider) {
      additionalData = await wormhole.callContract(
        chain,
        addresses.dataProvider,
        AAVE_DATA_PROVIDER_ABI,
        'getReserveData',
        [assetAddress]
      );
    }

    // Call Oracle.getAssetPrice(asset)
    const assetPrice = await wormhole.callContract(
      chain,
      addresses.oracle,
      AAVE_ORACLE_ABI,
      'getAssetPrice',
      [assetAddress]
    );

    // Parse and format the data
    const parsedData: AaveReserveData = {
      configuration: reserveData.configuration.toString(),
      liquidityIndex: reserveData.liquidityIndex.toString(),
      currentLiquidityRate: reserveData.currentLiquidityRate.toString(),
      variableBorrowIndex: reserveData.variableBorrowIndex.toString(),
      currentVariableBorrowRate: reserveData.currentVariableBorrowRate.toString(),
      currentStableBorrowRate: reserveData.currentStableBorrowRate.toString(),
      lastUpdateTimestamp: Number(reserveData.lastUpdateTimestamp),
      aTokenAddress: reserveData.aTokenAddress,
      stableDebtTokenAddress: reserveData.stableDebtTokenAddress,
      variableDebtTokenAddress: reserveData.variableDebtTokenAddress,
      interestRateStrategyAddress: reserveData.interestRateStrategyAddress,
      availableLiquidity: additionalData?.totalAToken?.toString() || '0',
      totalStableDebt: additionalData?.totalStableDebt?.toString() || '0',
      totalVariableDebt: additionalData?.totalVariableDebt?.toString() || '0',
      liquidityRate: additionalData?.liquidityRate?.toString() || reserveData.currentLiquidityRate.toString(),
      variableBorrowRate: additionalData?.variableBorrowRate?.toString() || reserveData.currentVariableBorrowRate.toString(),
      stableBorrowRate: additionalData?.stableBorrowRate?.toString() || reserveData.currentStableBorrowRate.toString(),
      averageStableBorrowRate: additionalData?.averageStableBorrowRate?.toString() || '0',
      utilizationRate: '0', // Will be calculated below
    };

    // Calculate utilization rate
    const totalSupply = BigInt(parsedData.availableLiquidity);
    const totalDebt = BigInt(parsedData.totalStableDebt) + BigInt(parsedData.totalVariableDebt);
    
    if (totalSupply > 0n) {
      const utilization = (Number(totalDebt) / Number(totalSupply)) * 100;
      parsedData.utilizationRate = utilization.toFixed(2);
    }

    console.log(`✓ Retrieved Aave reserve data for ${assetAddress}`);
    return parsedData;

  } catch (error) {
    console.error('❌ Failed to query Aave reserve data:', error);
    throw new LendingAnalyticsError(
      `Failed to query Aave reserve data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ErrorCode.QUERY_FAILED,
      500
    );
  }
}

/**
 * Query Aave user account data
 */
export async function getAaveUserAccountData(
  chain: Chain,
  userAddress: string
): Promise<AaveUserAccountData> {
  try {
    const wormhole = getWormholeClient();
    const addresses = getProtocolAddresses(Protocol.AAVE, chain);

    if (!addresses) {
      throw new LendingAnalyticsError(
        `Aave not supported on ${chain}`,
        ErrorCode.INVALID_CHAIN,
        400
      );
    }

    console.log(`👤 Querying Aave user data for ${userAddress} on ${chain}...`);

    // Call Pool.getUserAccountData(user)
    const userData = await wormhole.callContract(
      chain,
      addresses.pool,
      AAVE_POOL_ABI,
      'getUserAccountData',
      [userAddress]
    );

    const parsedData: AaveUserAccountData = {
      totalCollateralETH: userData.totalCollateralBase.toString(),
      totalDebtETH: userData.totalDebtBase.toString(),
      availableBorrowsETH: userData.availableBorrowsBase.toString(),
      currentLiquidationThreshold: userData.currentLiquidationThreshold.toString(),
      ltv: userData.ltv.toString(),
      healthFactor: userData.healthFactor.toString(),
    };

    console.log(`✓ Retrieved Aave user data for ${userAddress}`);
    return parsedData;

  } catch (error) {
    console.error('❌ Failed to query Aave user data:', error);
    throw new LendingAnalyticsError(
      `Failed to query Aave user data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ErrorCode.QUERY_FAILED,
      500
    );
  }
}

/**
 * Query all Aave reserves for a chain
 */
export async function getAllAaveReserves(chain: Chain): Promise<string[]> {
  try {
    const wormhole = getWormholeClient();
    const addresses = getProtocolAddresses(Protocol.AAVE, chain);

    if (!addresses) {
      throw new LendingAnalyticsError(
        `Aave not supported on ${chain}`,
        ErrorCode.INVALID_CHAIN,
        400
      );
    }

    console.log(`📋 Querying all Aave reserves on ${chain}...`);

    // Call Pool.getReservesList()
    const reservesList = await wormhole.callContract(
      chain,
      addresses.pool,
      AAVE_POOL_ABI,
      'getReservesList',
      []
    );

    console.log(`✓ Found ${reservesList.length} Aave reserves on ${chain}`);
    return reservesList;

  } catch (error) {
    console.error('❌ Failed to query Aave reserves list:', error);
    throw new LendingAnalyticsError(
      `Failed to query Aave reserves list: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ErrorCode.QUERY_FAILED,
      500
    );
  }
}

/**
 * Get Aave reserve data for all configured assets on a chain
 */
export async function getAaveReservesForChain(
  chain: Chain
): Promise<Map<string, AaveReserveData>> {
  try {
    console.log(`🌐 Fetching all Aave reserves for ${chain}...`);

    // Check if RPC provider is configured BEFORE attempting to fetch
    const wormhole = getWormholeClient();
    if (!wormhole.isChainSupported(chain)) {
      const rpcEnvVar = chain === Chain.ETHEREUM ? 'ETHEREUM_RPC_URL' : `${chain}_RPC_URL`;
      throw new LendingAnalyticsError(
        `RPC provider not configured for ${chain}. Please set ${rpcEnvVar} environment variable.`,
        ErrorCode.INVALID_CHAIN,
        400
      );
    }

    const assets = getProtocolAssets(Protocol.AAVE, chain);
    if (assets.length === 0) {
      console.warn(`⚠️  No assets configured for Aave on ${chain}`);
      return new Map();
    }

    const reservesMap = new Map<string, AaveReserveData>();

    // Fetch reserve data for each asset in parallel
    const promises = assets.map(async (asset) => {
      try {
        const reserveData = await getAaveReserveData(chain, asset.address);
        return { symbol: asset.symbol, data: reserveData };
      } catch (error) {
        console.warn(`⚠️  Failed to fetch ${asset.symbol} on ${chain}:`, error);
        return null;
      }
    });

    const results = await Promise.all(promises);

    // Build the map
    for (const result of results) {
      if (result) {
        reservesMap.set(result.symbol, result.data);
      }
    }

    // If we got zero results and we have assets configured, that's an error
    if (reservesMap.size === 0 && assets.length > 0) {
      throw new LendingAnalyticsError(
        `Failed to fetch any Aave reserves for ${chain}. All ${assets.length} asset queries failed. Check RPC configuration and network connectivity.`,
        ErrorCode.QUERY_FAILED,
        500
      );
    }

    console.log(`✓ Fetched ${reservesMap.size}/${assets.length} Aave reserves for ${chain}`);
    return reservesMap;

  } catch (error) {
    console.error('❌ Failed to fetch Aave reserves for chain:', error);
    throw new LendingAnalyticsError(
      `Failed to fetch Aave reserves for ${chain}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ErrorCode.QUERY_FAILED,
      500
    );
  }
}

/**
 * Get user positions across all Aave assets on a chain
 */
export async function getAaveUserPositions(
  chain: Chain,
  userAddress: string
): Promise<{
  accountData: AaveUserAccountData;
  positions: Map<string, any>;
}> {
  try {
    console.log(`👤 Fetching Aave user positions for ${userAddress} on ${chain}...`);

    const addresses = getProtocolAddresses(Protocol.AAVE, chain);
    if (!addresses?.dataProvider) {
      throw new LendingAnalyticsError(
        'Data provider not available',
        ErrorCode.QUERY_FAILED,
        500
      );
    }

    // Get overall account data
    const accountData = await getAaveUserAccountData(chain, userAddress);

    // Get user reserve data for each asset
    const assets = getProtocolAssets(Protocol.AAVE, chain);
    const wormhole = getWormholeClient();
    const positions = new Map<string, any>();

    const promises = assets.map(async (asset) => {
      try {
        const userReserveData = await wormhole.callContract(
          chain,
          addresses.dataProvider!,
          AAVE_DATA_PROVIDER_ABI,
          'getUserReserveData',
          [asset.address, userAddress]
        );

        // Only add if user has a position
        if (userReserveData.currentATokenBalance > 0n || 
            userReserveData.currentVariableDebt > 0n || 
            userReserveData.currentStableDebt > 0n) {
          return { symbol: asset.symbol, data: userReserveData };
        }
        return null;
      } catch (error) {
        console.warn(`⚠️  Failed to fetch user position for ${asset.symbol}:`, error);
        return null;
      }
    });

    const results = await Promise.all(promises);

    for (const result of results) {
      if (result) {
        positions.set(result.symbol, result.data);
      }
    }

    console.log(`✓ Found ${positions.size} active positions for user on ${chain}`);
    return { accountData, positions };

  } catch (error) {
    console.error('❌ Failed to fetch Aave user positions:', error);
    throw new LendingAnalyticsError(
      `Failed to fetch Aave user positions: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ErrorCode.QUERY_FAILED,
      500
    );
  }
}

/**
 * Calculate APY from ray-formatted rate
 */
export function calculateAaveAPY(rateRay: string): number {
  const SECONDS_PER_YEAR = 31536000;
  const RAY = 1e27;
  
  const rate = Number(rateRay) / RAY;
  const apy = ((1 + rate / SECONDS_PER_YEAR) ** SECONDS_PER_YEAR - 1) * 100;
  
  return apy;
}

/**
 * Helper to convert Aave rates to percentages
 */
export function formatAaveRate(rateRay: string): {
  apr: number;
  apy: number;
} {
  const apr = DecoderUtils.number.rayToPercentage(rateRay);
  const apy = calculateAaveAPY(rateRay);
  
  return { apr, apy };
}

export default {
  getAaveReserveData,
  getAaveUserAccountData,
  getAllAaveReserves,
  getAaveReservesForChain,
  getAaveUserPositions,
  calculateAaveAPY,
  formatAaveRate,
};