import { QueryProxyQueryResponse, QueryRequest, signaturesToEvmStruct,QueryResponse } from '@wormhole-foundation/wormhole-query-sdk';
import { ethers } from 'ethers';
import { LendingAnalyticsError, ErrorCode, Chain } from '../types';

// Wormhole Chain IDs mapping
export const WORMHOLE_CHAIN_IDS = {
  [Chain.ETHEREUM]: 2,
  [Chain.SOLANA]: 1,
//   [Chain.POLYGON]: 5,
//   [Chain.ARBITRUM]: 23,
} as const;

// RPC Provider mapping
const RPC_URLS: Partial<Record<Chain, string>> = {
  [Chain.ETHEREUM]: process.env.ETHEREUM_RPC_URL || '',
  [Chain.SOLANA]: process.env.SOLANA_RPC_URL || '',
//   [Chain.POLYGON]: process.env.POLYGON_RPC_URL || '',
//   [Chain.ARBITRUM]: process.env.ARBITRUM_RPC_URL || '',
};

export class WormholeClient {
  private apiKey: string;
  private environment: 'mainnet' | 'testnet';
  private baseUrl: string;
  private providers: Map<Chain, ethers.JsonRpcProvider>;

  constructor() {
    this.apiKey = process.env.WORMHOLE_API_KEY || '';
    this.environment = (process.env.WORMHOLE_ENVIRONMENT as 'mainnet' | 'testnet') || 'mainnet';
    this.baseUrl = this.environment === 'testnet' 
      ? 'https://query-testnet.wormhole.com'
      : 'https://query-mainnet.wormhole.com';
    
    this.providers = new Map();
    
    if (!this.apiKey) {
      console.warn('⚠️  WORMHOLE_API_KEY not set. Some queries may fail.');
    }

    this.initializeProviders();
  }

  /**
   * Initialize ethers providers for each supported chain
   */
  private initializeProviders(): void {
    for (const [chain, rpcUrl] of Object.entries(RPC_URLS)) {
      if (rpcUrl) {
        this.providers.set(
          chain as Chain,
          new ethers.JsonRpcProvider(rpcUrl)
        );
        console.log(`✓ Initialized provider for ${chain}`);
      } else {
        console.warn(`⚠️  No RPC URL configured for ${chain}`);
      }
    }
  }

  /**
   * Get ethers provider for a specific chain
   */
  public getProvider(chain: Chain): ethers.JsonRpcProvider {
    const provider = this.providers.get(chain);
    if (!provider) {
      throw new LendingAnalyticsError(
        `No provider configured for chain: ${chain}`,
        ErrorCode.INVALID_CHAIN,
        500
      );
    }
    return provider;
  }

  /**
   * Execute a Wormhole Query request
   * This is the main method to fetch cross-chain data
   */
  public async executeQuery(
    request: QueryRequest
  ): Promise<QueryProxyQueryResponse> {
    try {
      console.log('🌐 Executing Wormhole Query...', {
        requests: request.requests.length,
      });

      const serialized = request.serialize();
      
      const response = await fetch(`${this.baseUrl}/v1/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify({
          bytes: Buffer.from(serialized).toString('base64'),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Wormhole Query failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json() as { bytes: string; signatures: string[] };
      
      // Parse the response
      const queryResponse = QueryResponse.from(
        Buffer.from(data.bytes, 'base64')
      );

      console.log('✓ Wormhole Query completed successfully');
      return {
        ...queryResponse,
        signatures: data.signatures,
        bytes: data.bytes,
      } as QueryProxyQueryResponse;// normal returning queryResponse won't have signatures and bytes

    } catch (error) {
      console.error('❌ Wormhole Query failed:', error);
      throw new LendingAnalyticsError(
        `Wormhole query execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ErrorCode.WORMHOLE_ERROR,
        500
      );
    }
  }

  /**
   * Query Ethereum contract storage slots
   * Used for reading Aave reserve data
   */
  public async queryEthStorage(
    chain: Chain,
    contractAddress: string,
    storageSlots: string[],
    blockNumber?: number
  ): Promise<string[]> {
    try {
      const provider = this.getProvider(chain);
      const results: string[] = [];

      for (const slot of storageSlots) {
        const value = await provider.getStorage(
          contractAddress,
          slot,
          blockNumber
        );
        results.push(value);
      }

      return results;
    } catch (error) {
      throw new LendingAnalyticsError(
        `Failed to query storage for ${chain}: ${error instanceof Error ? error.message : 'Unknown'}`,
        ErrorCode.QUERY_FAILED,
        500
      );
    }
  }

  /**
   * Call an Ethereum contract method (read-only)
   * Used for calling Aave contract view functions
   */
  public async callContract(
    chain: Chain,
    contractAddress: string,
    abi: ethers.InterfaceAbi,
    methodName: string,
    params: any[] = []
  ): Promise<any> {
    try {
      const provider = this.getProvider(chain);
      const contract = new ethers.Contract(contractAddress, abi, provider);

      console.log(`📞 Calling ${methodName} on ${contractAddress.slice(0, 10)}...`);
      const result = await contract[methodName](...params);
      
      return result;
    } catch (error) {
      throw new LendingAnalyticsError(
        `Contract call failed for ${chain}.${methodName}: ${error instanceof Error ? error.message : 'Unknown'}`,
        ErrorCode.QUERY_FAILED,
        500
      );
    }
  }

  /**
   * Get current block number for a chain
   */
  public async getBlockNumber(chain: Chain): Promise<number> {
    try {
      const provider = this.getProvider(chain);
      return await provider.getBlockNumber();
    } catch (error) {
      throw new LendingAnalyticsError(
        `Failed to get block number for ${chain}`,
        ErrorCode.QUERY_FAILED,
        500
      );
    }
  }

  /**
   * Batch multiple contract calls into a single request
   * More efficient than individual calls
   */
  public async batchCallContracts(
    chain: Chain,
    calls: Array<{
      contractAddress: string;
      abi: ethers.InterfaceAbi;
      methodName: string;
      params?: any[];
    }>
  ): Promise<any[]> {
    try {
      const provider = this.getProvider(chain);
      const promises = calls.map(call => {
        const contract = new ethers.Contract(call.contractAddress, call.abi, provider);
        return contract[call.methodName](...(call.params || []));
      });

      console.log(`📦 Executing ${calls.length} batched calls on ${chain}...`);
      const results = await Promise.all(promises);
      
      return results;
    } catch (error) {
      throw new LendingAnalyticsError(
        `Batch contract calls failed for ${chain}: ${error instanceof Error ? error.message : 'Unknown'}`,
        ErrorCode.QUERY_FAILED,
        500
      );
    }
  }

  /**
   * Get Wormhole chain ID for a given chain
   */
  public getWormholeChainId(chain: Chain): number {
    const chainId = WORMHOLE_CHAIN_IDS[chain as keyof typeof WORMHOLE_CHAIN_IDS];
    if (!chainId) {
      throw new LendingAnalyticsError(
        `No Wormhole chain ID for: ${chain}`,
        ErrorCode.INVALID_CHAIN,
        400
      );
    }
    return chainId;
  }

  /**
   * Check if a chain is supported
   */
  public isChainSupported(chain: Chain): boolean {
    return this.providers.has(chain);
  }

  /**
   * Get all supported chains
   */
  public getSupportedChains(): Chain[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Get configuration status
   */
  public getStatus(): {
    configured: boolean;
    environment: string;
    supportedChains: Chain[];
    apiKeySet: boolean;
  } {
    return {
      configured: this.providers.size > 0,
      environment: this.environment,
      supportedChains: this.getSupportedChains(),
      apiKeySet: !!this.apiKey,
    };
  }
}

// Singleton instance
let wormholeClientInstance: WormholeClient | null = null;

/**
 * Get or create the Wormhole client instance
 */
export function getWormholeClient(): WormholeClient {
  if (!wormholeClientInstance) {
    wormholeClientInstance = new WormholeClient();
    console.log('🌐 Wormhole Client initialized');
    console.log(wormholeClientInstance.getStatus());
  }
  return wormholeClientInstance;
}

/**
 * Reset the client instance (useful for testing)
 */
export function resetWormholeClient(): void {
  wormholeClientInstance = null;
}

export default getWormholeClient;