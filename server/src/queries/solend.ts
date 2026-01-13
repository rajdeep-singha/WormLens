
import { Connection, PublicKey } from '@solana/web3.js';
import { SOLEND_ADDRESSES, SOLEND_ASSETS } from '../config/protocols';
import { DecoderUtils } from '../utils/decoder';
import {
  Chain,
  SolendReserve,
  LendingAnalyticsError,
  ErrorCode,
} from '../types';

/**
 * Initialize Solana connection
 */
function getSolanaConnection(): Connection {
  const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
  return new Connection(rpcUrl, 'confirmed');
}

/**
 * Solend Reserve layout (simplified)
 * Full implementation requires @project-serum/borsh or @coral-xyz/borsh
 */
interface SolendReserveRaw {
  version: number;
  lastUpdate: {
    slot: bigint;
    stale: boolean;
  };
  lendingMarket: PublicKey;
  liquidity: {
    mintPubkey: PublicKey;
    supplyPubkey: PublicKey;
    availableAmount: bigint;
    borrowedAmountWads: bigint;
    cumulativeBorrowRateWads: bigint;
    marketPrice: bigint;
  };
  collateral: {
    mintPubkey: PublicKey;
    mintTotalSupply: bigint;
    supplyPubkey: PublicKey;
  };
  config: {
    loanToValueRatio: number;
    liquidationThreshold: number;
    liquidationBonus: number;
    optimalUtilizationRate: number;
    maxBorrowRate: bigint;
  };
}

/**
 * Parse Solend reserve account data
 * Note: This is a simplified parser. Production should use proper Borsh deserialization
 */
function parseSolendReserve(data: Buffer): SolendReserve {
  try {
    console.warn('⚠️  Using simplified Solend parser - implement full Borsh layout for production');
    
    // This is a placeholder implementation
    // Real implementation would use Borsh layout from Solend SDK
    
    // For now, return a mock structure
    // TODO: Implement proper Borsh deserialization
    const mockReserve: SolendReserve = {
      liquidity: {
        mintPubkey: '',
        supplyPubkey: '',
        availableAmount: '0',
        borrowedAmountWads: '0',
        cumulativeBorrowRateWads: '0',
        marketPrice: '0',
      },
      collateral: {
        mintPubkey: '',
        mintTotalSupply: '0',
        supplyPubkey: '',
      },
      config: {
        loanToValueRatio: 0,
        liquidationThreshold: 0,
        liquidationBonus: 0,
        optimalUtilizationRate: 0,
        maxBorrowRate: '0',
      },
      lastUpdate: {
        slot: 0,
        stale: false,
      },
    };

    return mockReserve;

  } catch (error) {
    throw new LendingAnalyticsError(
      `Failed to parse Solend reserve: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ErrorCode.DECODE_FAILED,
      500
    );
  }
}

/**
 * Get Solend reserve data for a specific reserve account
 */
export async function getSolendReserveData(
  reserveAddress: string
): Promise<SolendReserve> {
  try {
    console.log(`📊 Querying Solend reserve data for ${reserveAddress}...`);

    const connection = getSolanaConnection();
    const reservePubkey = new PublicKey(reserveAddress);

    // Fetch account data
    const accountInfo = await connection.getAccountInfo(reservePubkey);

    if (!accountInfo) {
      throw new LendingAnalyticsError(
        `Solend reserve not found: ${reserveAddress}`,
        ErrorCode.QUERY_FAILED,
        404
      );
    }

    // Parse the reserve data
    const reserveData = parseSolendReserve(accountInfo.data);

    console.log(`✓ Retrieved Solend reserve data for ${reserveAddress}`);
    return reserveData;

  } catch (error) {
    console.error('❌ Failed to query Solend reserve data:', error);
    throw new LendingAnalyticsError(
      `Failed to query Solend reserve data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ErrorCode.QUERY_FAILED,
      500
    );
  }
}

/**
 * Get all Solend reserves from the main pool
 */
export async function getAllSolendReserves(): Promise<Map<string, SolendReserve>> {
  try {
    console.log('🌐 Fetching all Solend reserves...');

    const connection = getSolanaConnection();
    const reservesMap = new Map<string, SolendReserve>();

    // Get reserve addresses from configured assets
    // In production, you'd fetch this from the Solend lending market account
    const reserveAddresses = SOLEND_ASSETS.map(asset => ({
      symbol: asset.symbol,
      // These would be actual reserve account addresses from Solend
      // For now using placeholder - need to fetch from Solend Market
      reserveAddress: asset.address, 
    }));

    // Fetch all reserves in parallel
    const promises = reserveAddresses.map(async ({ symbol, reserveAddress }) => {
      try {
        const reserveData = await getSolendReserveData(reserveAddress);
        return { symbol, data: reserveData };
      } catch (error) {
        console.warn(`⚠️  Failed to fetch ${symbol} reserve:`, error);
        return null;
      }
    });

    const results = await Promise.all(promises);

    for (const result of results) {
      if (result) {
        reservesMap.set(result.symbol, result.data);
      }
    }

    console.log(`✓ Fetched ${reservesMap.size}/${reserveAddresses.length} Solend reserves`);
    return reservesMap;

  } catch (error) {
    console.error('❌ Failed to fetch Solend reserves:', error);
    throw new LendingAnalyticsError(
      `Failed to fetch Solend reserves: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ErrorCode.QUERY_FAILED,
      500
    );
  }
}

/**
 * Get user obligations (borrowed positions) from Solend
 */
export async function getSolendUserObligations(
  userAddress: string
): Promise<any[]> {
  try {
    console.log(`👤 Querying Solend obligations for ${userAddress}...`);

    const connection = getSolanaConnection();
    const userPubkey = new PublicKey(userAddress);

    // Get all obligation accounts owned by the user
    // Obligation accounts are PDAs derived from the lending market and user
    // This is a simplified version - production needs proper PDA derivation
    
    const programId = new PublicKey(SOLEND_ADDRESSES.programId);
    
    // Find obligation accounts
    const obligations = await connection.getProgramAccounts(programId, {
      filters: [
        {
          memcmp: {
            offset: 10, // Offset where owner pubkey is stored in obligation
            bytes: userPubkey.toBase58(),
          },
        },
      ],
    });

    console.log(`✓ Found ${obligations.length} Solend obligations for user`);
    
    // Parse obligations
    const parsedObligations = obligations.map(({ pubkey, account }) => {
      // TODO: Implement proper Borsh deserialization for obligation layout
      return {
        pubkey: pubkey.toBase58(),
        // Parsed obligation data would go here
      };
    });

    return parsedObligations;

  } catch (error) {
    console.error('❌ Failed to query Solend user obligations:', error);
    throw new LendingAnalyticsError(
      `Failed to query Solend user obligations: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ErrorCode.QUERY_FAILED,
      500
    );
  }
}

/**
 * Get user collateral deposits in Solend
 */
export async function getSolendUserDeposits(
  userAddress: string
): Promise<Map<string, bigint>> {
  try {
    console.log(`💰 Querying Solend deposits for ${userAddress}...`);

    const connection = getSolanaConnection();
    const userPubkey = new PublicKey(userAddress);
    const deposits = new Map<string, bigint>();

    // Get user's collateral token accounts (cTokens)
    // For each asset, check if user has cToken balance
    for (const asset of SOLEND_ASSETS) {
      try {
        // TODO: Get the actual cToken mint from reserve data
        // TODO: Find user's token account for this cToken
        // TODO: Get balance
        
        // Placeholder implementation
        deposits.set(asset.symbol, BigInt(0));
      } catch (error) {
        console.warn(`⚠️  Failed to fetch ${asset.symbol} deposit:`, error);
      }
    }

    console.log(`✓ Fetched deposits for ${deposits.size} assets`);
    return deposits;

  } catch (error) {
    console.error('❌ Failed to query Solend user deposits:', error);
    throw new LendingAnalyticsError(
      `Failed to query Solend user deposits: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ErrorCode.QUERY_FAILED,
      500
    );
  }
}

/**
 * Calculate Solend APY from reserve data
 */
export function calculateSolendAPY(
  borrowRate: bigint,
  utilizationRate: number
): number {
  // Solend uses interest rate model similar to Compound
  // APY = ((1 + (rate * blocksPerYear)) ^ blocksPerYear) - 1
  
  // Simplified calculation
  // TODO: Implement proper Solend APY calculation
  const SLOTS_PER_YEAR = 78840000; // Approximate
  
  const ratePerSlot = Number(borrowRate) / 1e18;
  const apy = ((1 + ratePerSlot) ** SLOTS_PER_YEAR - 1) * 100;
  
  return apy;
}

/**
 * Calculate utilization rate for a reserve
 */
export function calculateSolendUtilization(reserve: SolendReserve): number {
  const available = BigInt(reserve.liquidity.availableAmount);
  const borrowed = BigInt(reserve.liquidity.borrowedAmountWads) / BigInt(1e18); // Convert from wads
  
  const total = available + borrowed;
  
  if (total === BigInt(0)) return 0;
  
  return (Number(borrowed) / Number(total)) * 100;
}

/**
 * Get market price from reserve (in USD)
 */
export function getSolendMarketPrice(reserve: SolendReserve): number {
  // Solend stores prices in a specific format
  // TODO: Implement proper price decoding based on Solend's price format
  return Number(reserve.liquidity.marketPrice) / 1e6;
}

/**
 * Helper to get all Solend data for a chain (Solana only)
 */
export async function getSolendDataForChain(): Promise<{
  reserves: Map<string, SolendReserve>;
  timestamp: number;
}> {
  try {
    console.log('🌐 Fetching comprehensive Solend data...');

    const reserves = await getAllSolendReserves();

    return {
      reserves,
      timestamp: Date.now(),
    };

  } catch (error) {
    console.error('❌ Failed to fetch Solend data:', error);
    throw new LendingAnalyticsError(
      `Failed to fetch Solend data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ErrorCode.QUERY_FAILED,
      500
    );
  }
}

export default {
  getSolendReserveData,
  getAllSolendReserves,
  getSolendUserObligations,
  getSolendUserDeposits,
  calculateSolendAPY,
  calculateSolendUtilization,
  getSolendMarketPrice,
  getSolendDataForChain,
};