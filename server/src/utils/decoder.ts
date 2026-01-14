import { ethers } from 'ethers';
import { LendingAnalyticsError, ErrorCode } from '../types';
import BigNumber from 'bignumber.js';

/**
 * Decode hexadecimal string to various formats
 */
export class HexDecoder {
  /**
   * Decode hex string to BigInt
   */
  static toBigInt(hex: string): bigint {
    try {
      if (!hex || hex === '0x') return BigInt(0);
      return BigInt(hex);
    } catch (error) {
      throw new LendingAnalyticsError(
        `Failed to decode hex to BigInt: ${hex}`,
        ErrorCode.DECODE_FAILED,
        500
      );
    }
  }

  /**
   * Decode hex string to number
   */
  static toNumber(hex: string): number {
    try {
      if (!hex || hex === '0x') return 0;
      return Number(BigInt(hex));
    } catch (error) {
      throw new LendingAnalyticsError(
        `Failed to decode hex to number: ${hex}`,
        ErrorCode.DECODE_FAILED,
        500
      );
    }
  }

  /**
   * Decode hex string to UTF-8 string
   */
  static toString(hex: string): string {
    try {
      if (!hex || hex === '0x') return '';
      const bytes = ethers.getBytes(hex);
      return ethers.toUtf8String(bytes);
    } catch (error) {
      throw new LendingAnalyticsError(
        `Failed to decode hex to string: ${hex}`,
        ErrorCode.DECODE_FAILED,
        500
      );
    }
  }

  /**
   * Decode hex string to address
   */
  static toAddress(hex: string): string {
    try {
      if (!hex || hex === '0x') return ethers.ZeroAddress;
      return ethers.getAddress(hex);
    } catch (error) {
      throw new LendingAnalyticsError(
        `Failed to decode hex to address: ${hex}`,
        ErrorCode.DECODE_FAILED,
        500
      );
    }
  }

  /**
   * Decode hex string to boolean
   */
  static toBoolean(hex: string): boolean {
    const num = this.toNumber(hex);
    return num !== 0;
  }
}

/**
 * Format blockchain numbers to human-readable values
 */
export class NumberFormatter {
  /**
   * Convert Wei (18 decimals) to ETH
   */
  static weiToEth(wei: string | bigint): string {
    try {
      return ethers.formatEther(wei);
    } catch (error) {
      throw new LendingAnalyticsError(
        'Failed to convert Wei to ETH',
        ErrorCode.DECODE_FAILED,
        500
      );
    }
  }

  /**
   * Convert ETH to Wei
   */
  static ethToWei(eth: string | number): string {
    try {
      return ethers.parseEther(eth.toString()).toString();
    } catch (error) {
      throw new LendingAnalyticsError(
        'Failed to convert ETH to Wei',
        ErrorCode.DECODE_FAILED,
        500
      );
    }
  }

  /**
   * Format token amount with custom decimals
   */
  static formatUnits(amount: string | bigint, decimals: number): string {
    try {
      return ethers.formatUnits(amount, decimals);
    } catch (error) {
      throw new LendingAnalyticsError(
        `Failed to format units with ${decimals} decimals`,
        ErrorCode.DECODE_FAILED,
        500
      );
    }
  }

  /**
   * Parse token amount with custom decimals
   */
  static parseUnits(amount: string, decimals: number): string {
    try {
      return ethers.parseUnits(amount, decimals).toString();
    } catch (error) {
      throw new LendingAnalyticsError(
        `Failed to parse units with ${decimals} decimals`,
        ErrorCode.DECODE_FAILED,
        500
      );
    }
  }

  /**
   * Format percentage from basis points (1% = 100 bp, stored as 10000 = 100%)
   */
  static bpsToPercentage(bps: number | bigint): number {
    return Number(bps) / 10000;
  }

  /**
   * Format APR/APY from ray (27 decimals, Aave format)
   * Ray = 10^27, so 1 ray = 1
   */
  static rayToPercentage(ray: string | bigint): number {
    try {
      const RAY = new BigNumber(10).pow(27);
      const value = new BigNumber(ray.toString());
      return value.div(RAY).times(100).toNumber();
    } catch (error) {
      throw new LendingAnalyticsError(
        'Failed to convert ray to percentage',
        ErrorCode.DECODE_FAILED,
        500
      );
    }
  }

  /**
   * Format USD value with 2 decimal places
   */
  static formatUSD(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Calculate utilization rate
   */
  static calculateUtilization(
    totalBorrow: string | bigint,
    totalSupply: string | bigint
  ): number {
    try {
      const borrow = new BigNumber(totalBorrow.toString());
      const supply = new BigNumber(totalSupply.toString());
      
      if (supply.isZero()) return 0;
      
      return borrow.div(supply).times(100).toNumber();
    } catch (error) {
      throw new LendingAnalyticsError(
        'Failed to calculate utilization rate',
        ErrorCode.DECODE_FAILED,
        500
      );
    }
  }
}

/**
 * Decode Aave-specific data structures
 */
export class AaveDecoder {
  /**
   * Decode Aave reserve configuration bitmap
   * Bitmap structure (256 bits):
   * - bits 0-15: LTV
   * - bits 16-31: Liquidation threshold
   * - bits 32-47: Liquidation bonus
   * - bits 48-55: Decimals
   * - bit 56: Reserve is active
   * - bit 57: Reserve is frozen
   * - bit 58: Borrowing is enabled
   * - bit 59: Stable rate borrowing enabled
   * - bit 60: Asset is paused
   * - bits 64-79: Reserve factor
   */
  static decodeReserveConfiguration(configBitmap: bigint): {
    ltv: number;
    liquidationThreshold: number;
    liquidationBonus: number;
    decimals: number;
    isActive: boolean;
    isFrozen: boolean;
    borrowingEnabled: boolean;
    stableBorrowingEnabled: boolean;
    isPaused: boolean;
    reserveFactor: number;
  } {
    try {
      const LIQUIDATION_THRESHOLD_START = 16n;
      const LIQUIDATION_BONUS_START = 32n;
      const DECIMALS_START = 48n;
      const ACTIVE_BIT = 56n;
      const FROZEN_BIT = 57n;
      const BORROWING_BIT = 58n;
      const STABLE_BORROWING_BIT = 59n;
      const PAUSED_BIT = 60n;
      const RESERVE_FACTOR_START = 64n;

      const getBits = (bitmap: bigint, start: bigint, length: bigint): number => {
        const mask = (1n << length) - 1n;
        return Number((bitmap >> start) & mask);
      };

      const getBit = (bitmap: bigint, position: bigint): boolean => {
        return ((bitmap >> position) & 1n) === 1n;
      };

      return {
        ltv: getBits(configBitmap, 0n, 16n) / 100,
        liquidationThreshold: getBits(configBitmap, LIQUIDATION_THRESHOLD_START, 16n) / 100,
        liquidationBonus: getBits(configBitmap, LIQUIDATION_BONUS_START, 16n) / 100,
        decimals: getBits(configBitmap, DECIMALS_START, 8n),
        isActive: getBit(configBitmap, ACTIVE_BIT),
        isFrozen: getBit(configBitmap, FROZEN_BIT),
        borrowingEnabled: getBit(configBitmap, BORROWING_BIT),
        stableBorrowingEnabled: getBit(configBitmap, STABLE_BORROWING_BIT),
        isPaused: getBit(configBitmap, PAUSED_BIT),
        reserveFactor: getBits(configBitmap, RESERVE_FACTOR_START, 16n) / 100,
      };
    } catch (error) {
      throw new LendingAnalyticsError(
        'Failed to decode Aave reserve configuration',
        ErrorCode.DECODE_FAILED,
        500
      );
    }
  }

  /**
   * Calculate health factor from Aave user data
   */
  static calculateHealthFactor(
    totalCollateralETH: string,
    totalDebtETH: string,
    liquidationThreshold: number
  ): number {
    try {
      const collateral = new BigNumber(totalCollateralETH);
      const debt = new BigNumber(totalDebtETH);

      if (debt.isZero()) return Infinity;

      const adjustedCollateral = collateral.times(liquidationThreshold).div(100);
      const healthFactor = adjustedCollateral.div(debt);

      return healthFactor.toNumber();
    } catch (error) {
      throw new LendingAnalyticsError(
        'Failed to calculate health factor',
        ErrorCode.DECODE_FAILED,
        500
      );
    }
  }
}

/**
 * Decode Solana account data
 */
export class SolanaDecoder {
  /**
   * Decode Solend reserve data from Solana account
   * This is a simplified version - actual implementation needs Borsh
   */
  static decodeReserveData(data: Buffer): {
    liquidity: {
      availableAmount: string;
      borrowedAmount: string;
      marketPrice: string;
    };
    collateral: {
      mintTotalSupply: string;
    };
  } {
    try {
      // This is a placeholder - actual implementation would use @project-serum/borsh
      // or @coral-xyz/borsh to properly decode the Solend reserve structure
      
      console.warn('⚠️  Using simplified Solana decoder - implement Borsh decoding for production');
      
      return {
        liquidity: {
          availableAmount: '0',
          borrowedAmount: '0',
          marketPrice: '0',
        },
        collateral: {
          mintTotalSupply: '0',
        },
      };
    } catch (error) {
      throw new LendingAnalyticsError(
        'Failed to decode Solend reserve data',
        ErrorCode.DECODE_FAILED,
        500
      );
    }
  }

  /**
   * Convert lamports to SOL
   */
  static lamportsToSol(lamports: string | number): number {
    return Number(lamports) / 1e9;
  }

  /**
   * Convert SOL to lamports
   */
  static solToLamports(sol: string | number): string {
    return (Number(sol) * 1e9).toString();
  }
}

/**
 * ABI encoders/decoders for contract interactions
 */
export class ABICoder {
  /**
   * Encode function call data
   */
  static encodeFunctionCall(
    abi: ethers.InterfaceAbi,
    functionName: string,
    params: any[]
  ): string {
    try {
      const iface = new ethers.Interface(abi);
      return iface.encodeFunctionData(functionName, params);
    } catch (error) {
      throw new LendingAnalyticsError(
        `Failed to encode function call: ${functionName}`,
        ErrorCode.DECODE_FAILED,
        500
      );
    }
  }

  /**
   * Decode function result
   */
  static decodeFunctionResult(
    abi: ethers.InterfaceAbi,
    functionName: string,
    data: string
  ): any {
    try {
      const iface = new ethers.Interface(abi);
      return iface.decodeFunctionResult(functionName, data);
    } catch (error) {
      throw new LendingAnalyticsError(
        `Failed to decode function result: ${functionName}`,
        ErrorCode.DECODE_FAILED,
        500
      );
    }
  }
}

/**
 * Utility functions for common conversions
 */
export const DecoderUtils = {
  hex: HexDecoder,
  number: NumberFormatter,
  aave: AaveDecoder,
  solana: SolanaDecoder,
  abi: ABICoder,
};

export default DecoderUtils;