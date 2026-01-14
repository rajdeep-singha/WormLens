import {
  AggregatedRates,
  AggregatedLiquidity,
  UserPositions,
  Chain,
  Protocol,
  LendingRate,
  Liquidity,
  Asset,
  UserSupplyPosition,
  UserBorrowPosition,
  LendingAnalyticsError,
  ErrorCode,
} from '../types';

// Import query functions
import {
  getAaveReservesForChain,
  getAaveUserPositions,
  formatAaveRate,
} from '../queries/aave';
import {
  getSolendDataForChain,
  calculateSolendUtilization,
  calculateSolendAPY,
  getSolendMarketPrice,
} from '../queries/solend';

// Import configuration
import {
  getProtocolAssets,
  isProtocolSupported,
  findAsset,
} from '../config/protocols';

// Import utilities
import { DecoderUtils } from '../utils/decoder';
import { getWormholeClient } from '../config/wormholeClient';

interface QueryOptions {
  chains?: Chain[];
  protocols?: Protocol[];
  asset?: string;
}

export class LendingService {
  static getAggregatedRates: any;
  /**
   * Get aggregated lending/borrowing rates across protocols and chains
   */
  async getAggregatedRates(options: QueryOptions = {}): Promise<AggregatedRates> {
    try {
      console.log('📊 Fetching aggregated rates...', options);
      const startTime = Date.now();

      const {
        chains = [Chain.ETHEREUM,  Chain.SOLANA], //Chain.POLYGON, Chain.ARBITRUM,
        protocols = [Protocol.AAVE, Protocol.SOLEND],
        asset,
      } = options;

      const allRates: LendingRate[] = [];
      const fetchPromises: Array<Promise<LendingRate[]> & { chain?: Chain; protocol?: Protocol }> = [];

      // Fetch Aave data for each EVM chain
      for (const chain of chains) {
        if (protocols.includes(Protocol.AAVE) && isProtocolSupported(Protocol.AAVE, chain)) {
          const promise = this.fetchAaveRates(chain, asset) as any;
          promise.chain = chain;
          promise.protocol = Protocol.AAVE;
          fetchPromises.push(promise);
        }
      }

      // Fetch Solend data (Solana only)
      if (chains.includes(Chain.SOLANA) && protocols.includes(Protocol.SOLEND)) {
        const promise = this.fetchSolendRates(asset) as any;
        promise.chain = Chain.SOLANA;
        promise.protocol = Protocol.SOLEND;
        fetchPromises.push(promise);
      }

      // Execute all fetches in parallel
      const results = await Promise.allSettled(fetchPromises);

      // Collect successful results and log failures with context
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const promise = fetchPromises[i];
        if (result.status === 'fulfilled') {
          allRates.push(...result.value);
          console.log(`✓ Successfully fetched ${result.value.length} rates from ${promise.protocol} on ${promise.chain}`);
        } else {
          console.error(`❌ Failed to fetch rates from ${promise.protocol} on ${promise.chain}:`, result.reason);
          if (result.reason?.message) {
            console.error(`   Error details: ${result.reason.message}`);
          }
        }
      }

      const elapsed = Date.now() - startTime;
      console.log(`✓ Fetched ${allRates.length} rates in ${elapsed}ms`);

      return {
        rates: allRates,
        chains: [...new Set(allRates.map(r => r.chain))],
        protocols: [...new Set(allRates.map(r => r.protocol))],
        lastUpdated: Date.now(),
      };

    } catch (error) {
      console.error('❌ Failed to get aggregated rates:', error);
      throw new LendingAnalyticsError(
        `Failed to aggregate rates: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ErrorCode.AGGREGATION_FAILED,
        500
      );
    }
  }

  /**
   * Fetch Aave rates for a specific chain
   */
  private async fetchAaveRates(chain: Chain, assetFilter?: string): Promise<LendingRate[]> {
    try {
      console.log(`🔹 Fetching Aave rates for ${chain}...`);

      // Check if RPC provider is configured for this chain
      const wormhole = getWormholeClient();
      if (!wormhole.isChainSupported(chain)) {
        throw new LendingAnalyticsError(
          `RPC provider not configured for ${chain}. Please set ETHEREUM_RPC_URL environment variable.`,
          ErrorCode.INVALID_CHAIN,
          400
        );
      }

      const reservesMap = await getAaveReservesForChain(chain);
      const assets = getProtocolAssets(Protocol.AAVE, chain);
      const rates: LendingRate[] = [];

      for (const assetConfig of assets) {
        // Skip if filtering by asset and this isn't it
        if (assetFilter && assetConfig.symbol.toLowerCase() !== assetFilter.toLowerCase()) {
          continue;
        }

        const reserveData = reservesMap.get(assetConfig.symbol);
        if (!reserveData) {
          console.warn(`⚠️  No reserve data for ${assetConfig.symbol} on ${chain}`);
          continue;
        }

        // Parse rates
        const supplyRate = formatAaveRate(reserveData.liquidityRate);
        const borrowRate = formatAaveRate(reserveData.variableBorrowRate);

        // Calculate totals
        const totalSupply = reserveData.availableLiquidity;
        const totalBorrow = (
          BigInt(reserveData.totalStableDebt) + 
          BigInt(reserveData.totalVariableDebt)
        ).toString();

        // Format amounts
        const totalSupplyFormatted = DecoderUtils.number.formatUnits(
          totalSupply,
          assetConfig.decimals
        );
        const totalBorrowFormatted = DecoderUtils.number.formatUnits(
          totalBorrow,
          assetConfig.decimals
        );

        // Calculate utilization
        const utilization = DecoderUtils.number.calculateUtilization(
          totalBorrow,
          totalSupply
        );

        // Create asset object
        const asset: Asset = {
          symbol: assetConfig.symbol,
          name: assetConfig.name,
          decimals: assetConfig.decimals,
          address: assetConfig.address,
          chain,
          logoURI: assetConfig.logoURI,
        };

        // TODO: Get real USD prices from price oracle
        // For now, using placeholder values
        const mockPriceUSD = this.getMockPrice(assetConfig.symbol);
        const totalSupplyUSD = parseFloat(totalSupplyFormatted) * mockPriceUSD;
        const totalBorrowUSD = parseFloat(totalBorrowFormatted) * mockPriceUSD;

        const rate: LendingRate = {
          asset,
          protocol: Protocol.AAVE,
          chain,
          supplyAPY: supplyRate.apy,
          borrowAPY: borrowRate.apy,
          supplyAPR: supplyRate.apr,
          borrowAPR: borrowRate.apr,
          utilizationRate: utilization,
          totalSupply,
          totalBorrow,
          totalSupplyUSD,
          totalBorrowUSD,
          timestamp: Date.now(),
          totalBurrowUSD: 0
        };

        rates.push(rate);
      }

      console.log(`✓ Fetched ${rates.length} Aave rates for ${chain}`);
      return rates;

    } catch (error) {
      console.error(`❌ Failed to fetch Aave rates for ${chain}:`, error);
      throw error;
    }
  }

  /**
   * Fetch Solend rates for Solana
   */
  private async fetchSolendRates(assetFilter?: string): Promise<LendingRate[]> {
    try {
      console.log('🔹 Fetching Solend rates for Solana...');

      const { reserves } = await getSolendDataForChain();
      const rates: LendingRate[] = [];

      for (const [symbol, reserveData] of reserves.entries()) {
        // Skip if filtering by asset and this isn't it
        if (assetFilter && symbol.toLowerCase() !== assetFilter.toLowerCase()) {
          continue;
        }

        // Calculate metrics
        const utilization = calculateSolendUtilization(reserveData);
        const borrowAPY = calculateSolendAPY(
          BigInt(reserveData.config.maxBorrowRate),
          utilization
        );
        
        // Supply APY is typically borrowAPY * utilization
        const supplyAPY = (borrowAPY * utilization) / 100;

        // Get amounts
        const availableAmount = reserveData.liquidity.availableAmount;
        const borrowedAmount = reserveData.liquidity.borrowedAmountWads;
        
        // Convert from wads (18 decimals)
        const borrowedAmountConverted = (BigInt(borrowedAmount) / BigInt(1e18)).toString();
        const totalSupply = (BigInt(availableAmount) + BigInt(borrowedAmountConverted)).toString();

        // Get asset config
        const assetConfig = findAsset(symbol, Protocol.SOLEND, Chain.SOLANA);
        if (!assetConfig) {
          console.warn(`⚠️  Asset config not found for ${symbol}`);
          continue;
        }

        // Format amounts
        const totalSupplyFormatted = DecoderUtils.number.formatUnits(
          totalSupply,
          assetConfig.decimals
        );
        const totalBorrowFormatted = DecoderUtils.number.formatUnits(
          borrowedAmountConverted,
          assetConfig.decimals
        );

        // Get price
        const priceUSD = getSolendMarketPrice(reserveData);
        const totalSupplyUSD = parseFloat(totalSupplyFormatted) * priceUSD;
        const totalBorrowUSD = parseFloat(totalBorrowFormatted) * priceUSD;

        const asset: Asset = {
          symbol: assetConfig.symbol,
          name: assetConfig.name,
          decimals: assetConfig.decimals,
          address: assetConfig.address,
          chain: Chain.SOLANA,
          logoURI: assetConfig.logoURI,
        };

        const rate: LendingRate = {
          asset,
          protocol: Protocol.SOLEND,
          chain: Chain.SOLANA,
          supplyAPY,
          borrowAPY,
          supplyAPR: supplyAPY, // Simplified - actual calculation more complex
          borrowAPR: borrowAPY,
          utilizationRate: utilization,
          totalSupply,
          totalBorrow: borrowedAmountConverted,
          totalSupplyUSD,
          totalBorrowUSD,
          timestamp: Date.now(),
          totalBurrowUSD: 0
        };

        rates.push(rate);
      }

      console.log(`✓ Fetched ${rates.length} Solend rates`);
      return rates;

    } catch (error) {
      console.error('❌ Failed to fetch Solend rates:', error);
      throw error;
    }
  }

  /**
   * Find best rates across all protocols
   */
  async getBestRates(
    type: 'supply' | 'borrow',
    asset: string,
    amount?: number
  ) {
    try {
      console.log(`🏆 Finding best ${type} rates for ${asset}...`);

      const { rates } = await this.getAggregatedRates({ asset });

      if (rates.length === 0) {
        throw new LendingAnalyticsError(
          `No rates found for asset: ${asset}`,
          ErrorCode.QUERY_FAILED,
          404
        );
      }

      // Sort by rate (descending for supply, ascending for borrow)
      const sorted = rates.sort((a, b) => {
        const aRate = type === 'supply' ? a.supplyAPY : a.borrowAPY;
        const bRate = type === 'supply' ? b.supplyAPY : b.borrowAPY;
        return type === 'supply' ? bRate - aRate : aRate - bRate;
      });

      return {
        type,
        asset,
        amount,
        bestRate: sorted[0],
        alternatives: sorted.slice(1, 5),
        timestamp: Date.now(),
      };

    } catch (error) {
      console.error('❌ Failed to get best rates:', error);
      throw error;
    }
  }

  /**
   * Get aggregated liquidity data
   */
  async getAggregatedLiquidity(options: QueryOptions = {}): Promise<AggregatedLiquidity> {
    try {
      console.log('💧 Fetching aggregated liquidity...', options);

      // Get rates which contain liquidity info
      const { rates } = await this.getAggregatedRates(options);

      const liquidity: Liquidity[] = rates.map(rate => ({
        asset: rate.asset,
        protocol: rate.protocol,
        chain: rate.chain,
        availableLiquidity: (
          BigInt(rate.totalSupply) - BigInt(rate.totalBorrow)
        ).toString(),
        availableLiquidityUSD: rate.totalSupplyUSD - rate.totalBorrowUSD,
        totalLiquidity: rate.totalSupply,
        totalLiquidityUSD: rate.totalSupplyUSD,
        utilizationRate: rate.utilizationRate,
        timestamp: rate.timestamp,
      }));

      const totalLiquidityUSD = liquidity.reduce(
        (sum, l) => sum + l.totalLiquidityUSD,
        0
      );

      return {
        liquidity,
        totalLiquidityUSD,
        chains: [...new Set(liquidity.map(l => l.chain))],
        protocols: [...new Set(liquidity.map(l => l.protocol))],
        lastUpdated: Date.now(),
      };

    } catch (error) {
      console.error('❌ Failed to get aggregated liquidity:', error);
      throw error;
    }
  }

  /**
   * Get utilization rates
   */
  async getUtilizationRates(options: QueryOptions = {}) {
    try {
      console.log('📈 Calculating utilization rates...', options);

      const { liquidity } = await this.getAggregatedLiquidity(options);

      const utilizationRates = liquidity.map(l => ({
        asset: l.asset.symbol,
        protocol: l.protocol,
        chain: l.chain,
        utilizationRate: l.utilizationRate,
        timestamp: l.timestamp,
      }));

      const averageUtilization = 
        utilizationRates.reduce((sum, u) => sum + u.utilizationRate, 0) / 
        utilizationRates.length;

      return {
        utilizationRates,
        averageUtilization,
        timestamp: Date.now(),
      };

    } catch (error) {
      console.error('❌ Failed to get utilization rates:', error);
      throw error;
    }
  }

  /**
   * Get user positions across all protocols
   */
  async getUserPositions(
    walletAddress: string,
    options: QueryOptions = {}
  ): Promise<UserPositions> {
    try {
      console.log(`👤 Fetching positions for ${walletAddress}...`, options);

      const {
        chains = [Chain.ETHEREUM, Chain.POLYGON, Chain.ARBITRUM],
        protocols = [Protocol.AAVE],
      } = options;

      const supplyPositions: UserSupplyPosition[] = [];
      const borrowPositions: UserBorrowPosition[] = [];
      const fetchPromises: Promise<void>[] = [];

      // Fetch from Aave
      for (const chain of chains) {
        if (protocols.includes(Protocol.AAVE) && isProtocolSupported(Protocol.AAVE, chain)) {
          fetchPromises.push(
            this.fetchAaveUserPositions(walletAddress, chain, supplyPositions, borrowPositions)
          );
        }
      }

      // Execute all fetches
      await Promise.allSettled(fetchPromises);

      // Calculate totals
      const totalSuppliedUSD = supplyPositions.reduce((sum, p) => sum + p.suppliedAmountUSD, 0);
      const totalBorrowedUSD = borrowPositions.reduce((sum, p) => sum + p.borrowedAmountUSD, 0);

      // Calculate net APY (weighted average)
      const totalSupplyInterest = supplyPositions.reduce(
        (sum, p) => sum + (p.suppliedAmountUSD * p.currentAPY / 100),
        0
      );
      const totalBorrowInterest = borrowPositions.reduce(
        (sum, p) => sum + (p.borrowedAmountUSD * p.currentAPY / 100),
        0
      );
      const netAPY = totalSuppliedUSD > 0
        ? ((totalSupplyInterest - totalBorrowInterest) / totalSuppliedUSD) * 100
        : 0;

      // Get overall health factor (from first position if available)
      const healthFactor = borrowPositions[0]?.healthFactor;

      return {
        walletAddress,
        supplyPositions,
        borrowPositions,
        totalSuppliedUSD,
        totalBorrowedUSD,
        netAPY,
        healthFactor,
        timestamp: Date.now(),
      };

    } catch (error) {
      console.error('❌ Failed to get user positions:', error);
      throw error;
    }
  }

  /**
   * Fetch Aave user positions
   */
  private async fetchAaveUserPositions(
    walletAddress: string,
    chain: Chain,
    supplyPositions: UserSupplyPosition[],
    borrowPositions: UserBorrowPosition[]
  ): Promise<void> {
    try {
      console.log(`🔹 Fetching Aave positions on ${chain}...`);

      const { accountData, positions } = await getAaveUserPositions(chain, walletAddress);
      const assets = getProtocolAssets(Protocol.AAVE, chain);

      // Calculate health factor
      const healthFactor = DecoderUtils.aave.calculateHealthFactor(
        accountData.totalCollateralETH,
        accountData.totalDebtETH,
        Number(accountData.currentLiquidationThreshold) / 100
      );

      for (const [symbol, userReserveData] of positions.entries()) {
        const assetConfig = assets.find(a => a.symbol === symbol);
        if (!assetConfig) continue;

        const asset: Asset = {
          symbol: assetConfig.symbol,
          name: assetConfig.name,
          decimals: assetConfig.decimals,
          address: assetConfig.address,
          chain,
        };

        const mockPrice = this.getMockPrice(symbol);

        // Supply position
        if (userReserveData.currentATokenBalance > 0n) {
          const suppliedAmount = userReserveData.currentATokenBalance.toString();
          const suppliedFormatted = DecoderUtils.number.formatUnits(
            suppliedAmount,
            assetConfig.decimals
          );
          const suppliedAmountUSD = parseFloat(suppliedFormatted) * mockPrice;

          // Calculate accrued interest (simplified)
          const supplyRate = formatAaveRate(userReserveData.liquidityRate.toString());
          const accruedInterest = '0'; // TODO: Calculate actual accrued interest
          const accruedInterestUSD = 0;

          supplyPositions.push({
            asset,
            protocol: Protocol.AAVE,
            chain,
            suppliedAmount,
            suppliedAmountUSD,
            currentAPY: supplyRate.apy,
            AccuredInterest: accruedInterest,
            AccuredInterestUSD:accruedInterestUSD,
          });
        }

        // Borrow position
        const totalDebt = userReserveData.currentVariableDebt + userReserveData.currentStableDebt;
        if (totalDebt > 0n) {
          const borrowedAmount = totalDebt.toString();
          const borrowedFormatted = DecoderUtils.number.formatUnits(
            borrowedAmount,
            assetConfig.decimals
          );
          const borrowedAmountUSD = parseFloat(borrowedFormatted) * mockPrice;

          // Use variable borrow rate
          const borrowRate = formatAaveRate(userReserveData.stableBorrowRate.toString());
          const accruedInterest = '0'; // TODO: Calculate actual accrued interest
          const accruedInterestUSD = 0;

          borrowPositions.push({
            asset,
            protocol: Protocol.AAVE,
            chain,
            borrowedAmount,
            borrowedAmountUSD,
            currentAPY: borrowRate.apy,
            accruedInterest,
            accruedInterestUSD,
            healthFactor,
          });
        }
      }

    } catch (error) {
      console.error(`Failed to fetch Aave positions on ${chain}:`, error);
      // Don't throw - allow other chains to succeed
    }
  }

  /**
   * Get user health factor
   */
  async getUserHealthFactor(walletAddress: string) {
    try {
      console.log(`🏥 Calculating health factor for ${walletAddress}...`);

      const positions = await this.getUserPositions(walletAddress);

      const healthFactor = positions.healthFactor || Infinity;
      
      let riskLevel: 'safe' | 'moderate' | 'risky' | 'danger';
      if (healthFactor >= 2.0) riskLevel = 'safe';
      else if (healthFactor >= 1.5) riskLevel = 'moderate';
      else if (healthFactor >= 1.1) riskLevel = 'risky';
      else riskLevel = 'danger';

      return {
        walletAddress,
        healthFactor,
        liquidationThreshold: 1.0,
        riskLevel,
        collateralUSD: positions.totalSuppliedUSD,
        debtUSD: positions.totalBorrowedUSD,
        availableToBorrowUSD: positions.totalSuppliedUSD * 0.8 - positions.totalBorrowedUSD,
        timestamp: Date.now(),
      };

    } catch (error) {
      console.error('❌ Failed to calculate health factor:', error);
      throw error;
    }
  }

  /**
   * Get market overview
   */
  async getMarketOverview() {
    try {
      console.log('🌍 Generating market overview...');

      const { rates } = await this.getAggregatedRates();

      // Calculate totals
      const totalValueLockedUSD = rates.reduce((sum, r) => sum + r.totalSupplyUSD, 0);
      const totalBorrowedUSD = rates.reduce((sum, r) => sum + r.totalBorrowUSD, 0);

      // Calculate average APYs
      const avgSupplyAPY = rates.reduce((sum, r) => sum + r.supplyAPY, 0) / rates.length;
      const avgBorrowAPY = rates.reduce((sum, r) => sum + r.borrowAPY, 0) / rates.length;

      // Group by protocol
      const protocolTVL = new Map<Protocol, { tvl: number; chains: Set<Chain> }>();
      for (const rate of rates) {
        const existing = protocolTVL.get(rate.protocol);
        if (existing) {
          existing.tvl += rate.totalSupplyUSD;
          existing.chains.add(rate.chain);
        } else {
          protocolTVL.set(rate.protocol, {
            tvl: rate.totalSupplyUSD,
            chains: new Set([rate.chain]),
          });
        }
      }

      const topProtocols = Array.from(protocolTVL.entries())
        .map(([protocol, data]) => ({
          protocol,
          tvlUSD: data.tvl,
          chains: Array.from(data.chains),
        }))
        .sort((a, b) => b.tvlUSD - a.tvlUSD);

      // Group by asset
      const assetTVL = new Map<string, { tvl: number; apy: number }>();
      for (const rate of rates) {
        const existing = assetTVL.get(rate.asset.symbol);
        if (existing) {
          existing.tvl += rate.totalSupplyUSD;
          existing.apy = (existing.apy + rate.supplyAPY) / 2;
        } else {
          assetTVL.set(rate.asset.symbol, {
            tvl: rate.totalSupplyUSD,
            apy: rate.supplyAPY,
          });
        }
      }

      const topAssets = Array.from(assetTVL.entries())
        .map(([symbol, data]) => ({
          symbol,
          tvlUSD: data.tvl,
          supplyAPY: data.apy,
        }))
        .sort((a, b) => b.tvlUSD - a.tvlUSD)
        .slice(0, 10);

      return {
        totalValueLockedUSD,
        totalBorrowedUSD,
        averageSupplyAPY: avgSupplyAPY,
        averageBorrowAPY: avgBorrowAPY,
        topProtocols,
        topAssets,
        timestamp: Date.now(),
      };

    } catch (error) {
      console.error('❌ Failed to generate market overview:', error);
      throw error;
    }
  }

  /**
   * Compare rates across protocols/chains
   */
  async compareRates(
    asset: string,
    chains?: Chain[],
    protocols?: Protocol[]
  ) {
    try {
      console.log(`⚖️  Comparing rates for ${asset}...`);

      const { rates } = await this.getAggregatedRates({ asset, chains, protocols });

      if (rates.length === 0) {
        throw new LendingAnalyticsError(
          `No rates found for comparison: ${asset}`,
          ErrorCode.QUERY_FAILED,
          404
        );
      }

      const comparison = rates.map(r => ({
        protocol: r.protocol,
        chain: r.chain,
        supplyAPY: r.supplyAPY,
        borrowAPY: r.borrowAPY,
        utilizationRate: r.utilizationRate,
        availableLiquidityUSD: r.totalSupplyUSD - r.totalBorrowUSD,
      }));

      const bestSupply = rates.reduce((best, r) =>
        r.supplyAPY > best.supplyAPY ? r : best
      );

      const bestBorrow = rates.reduce((best, r) =>
        r.borrowAPY < best.borrowAPY ? r : best
      );

      return {
        asset,
        comparison,
        bestSupply,
        bestBorrow,
        timestamp: Date.now(),
      };

    } catch (error) {
      console.error('❌ Failed to compare rates:', error);
      throw error;
    }
  }

  /**
   * Mock price function (replace with real price oracle)
   */
  private getMockPrice(symbol: string): number {
    const prices: Record<string, number> = {
      ETH: 2250,
      WETH: 2250,
      USDC: 1.0,
      USDT: 1.0,
      DAI: 1.0,
      WBTC: 42000,
      MATIC: 0.85,
      ARB: 1.2,
      SOL: 90,
    };
    return prices[symbol.toUpperCase()] || 1.0;
  }
}