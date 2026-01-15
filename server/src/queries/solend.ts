

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
 * Solend Main Pool Reserve Addresses (actual reserve accounts, not token mints)
 */
const SOLEND_RESERVE_ADDRESSES: Record<string, string> = {
  SOL: '8PbodeaosQP19SjYFx855UMqWxH2HynZLdBXmsrbac36',
  USDC: 'BgxfHJDzm44T7XG68MYKx7YisTjZu73tVovyZSjJMpmw',
  USDT: '8K9WC8xoh2rtQNY7iEGXtPvfbDCi563SdWhCAhuMP2xE',
};


/**
 * Read a u64 from buffer (little-endian)
 */
function readU64(buffer: Buffer, offset: number): bigint {
  return buffer.readBigUInt64LE(offset);
}


/**
 * Read a u128 from buffer (little-endian) - stored as two u64s
 */
function readU128(buffer: Buffer, offset: number): bigint {
  const low = buffer.readBigUInt64LE(offset);
  const high = buffer.readBigUInt64LE(offset + 8);
  return low + (high << 64n);
}


/**
 * Read a Pubkey (32 bytes) as base58 string
 */
function readPubkey(buffer: Buffer, offset: number): string {
  return new PublicKey(buffer.subarray(offset, offset + 32)).toBase58();
}


/**
 * Parse Solend reserve account data using Borsh layout
 * Solend Reserve Layout (v1):
 * - version: u8 (1 byte)
 * - lastUpdate.slot: u64 (8 bytes)
 * - lastUpdate.stale: bool (1 byte)
 * - lendingMarket: Pubkey (32 bytes)
 * - liquidity.mintPubkey: Pubkey (32 bytes)
 * - liquidity.mintDecimals: u8 (1 byte)
 * - liquidity.supplyPubkey: Pubkey (32 bytes)
 * - liquidity.pythOracle: Pubkey (32 bytes)
 * - liquidity.switchboardOracle: Pubkey (32 bytes)
 * - liquidity.availableAmount: u64 (8 bytes)
 * - liquidity.borrowedAmountWads: u128 (16 bytes)
 * - liquidity.cumulativeBorrowRateWads: u128 (16 bytes)
 * - liquidity.marketPrice: u64 (8 bytes)
 * - collateral section follows...
 */
function parseSolendReserve(data: Buffer): SolendReserve {
  try {
    if (data.length < 300) {
      throw new Error(`Reserve data too short: ${data.length} bytes`);
    }


    let offset = 0;


    // Version (1 byte)
    const version = data.readUInt8(offset);
    offset += 1;


    // LastUpdate
    const lastUpdateSlot = Number(readU64(data, offset));
    offset += 8;
    const lastUpdateStale = data.readUInt8(offset) !== 0;
    offset += 1;


    // Lending Market (32 bytes)
    offset += 32;


    // Liquidity section
    const liquidityMintPubkey = readPubkey(data, offset);
    offset += 32;


    const mintDecimals = data.readUInt8(offset);
    offset += 1;


    const liquiditySupplyPubkey = readPubkey(data, offset);
    offset += 32;


    // Pyth Oracle (32 bytes)
    offset += 32;
    // Switchboard Oracle (32 bytes)
    offset += 32;


    const availableAmount = readU64(data, offset);
    offset += 8;


    const borrowedAmountWads = readU128(data, offset);
    offset += 16;


    const cumulativeBorrowRateWads = readU128(data, offset);
    offset += 16;


    const marketPrice = readU64(data, offset);
    offset += 8;


    // Collateral section
    const collateralMintPubkey = readPubkey(data, offset);
    offset += 32;


    const collateralMintTotalSupply = readU64(data, offset);
    offset += 8;


    const collateralSupplyPubkey = readPubkey(data, offset);
    offset += 32;


    // Config section - read key rates
    const optimalUtilizationRate = data.readUInt8(offset);
    offset += 1;
    const loanToValueRatio = data.readUInt8(offset);
    offset += 1;
    const liquidationBonus = data.readUInt8(offset);
    offset += 1;
    const liquidationThreshold = data.readUInt8(offset);
    offset += 1;
    const minBorrowRate = data.readUInt8(offset);
    offset += 1;
    const optimalBorrowRate = data.readUInt8(offset);
    offset += 1;
    const maxBorrowRate = data.readUInt8(offset);


    console.log(`✓ Parsed Solend reserve v${version}: available=${availableAmount}, borrowed=${borrowedAmountWads / BigInt(1e18)}`);


    return {
      liquidity: {
        mintPubkey: liquidityMintPubkey,
        supplyPubkey: liquiditySupplyPubkey,
        availableAmount: availableAmount.toString(),
        borrowedAmountWads: borrowedAmountWads.toString(),
        cumulativeBorrowRateWads: cumulativeBorrowRateWads.toString(),
        marketPrice: marketPrice.toString(),
      },
      collateral: {
        mintPubkey: collateralMintPubkey,
        mintTotalSupply: collateralMintTotalSupply.toString(),
        supplyPubkey: collateralSupplyPubkey,
      },
      config: {
        loanToValueRatio,
        liquidationThreshold,
        liquidationBonus,
        optimalUtilizationRate,
        maxBorrowRate: maxBorrowRate.toString(),
      },
      lastUpdate: {
        slot: lastUpdateSlot,
        stale: lastUpdateStale,
      },
    };


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


    // Use actual Solend Main Pool reserve addresses
    const reserveAddresses = SOLEND_ASSETS
      .filter(asset => SOLEND_RESERVE_ADDRESSES[asset.symbol])
      .map(asset => ({
        symbol: asset.symbol,
        reserveAddress: SOLEND_RESERVE_ADDRESSES[asset.symbol],
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
