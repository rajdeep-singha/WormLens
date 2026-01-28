// src/services/api.ts
import axios, { AxiosError } from 'axios';
import type {
  ApiResponse,
  AggregatedRates,
  AggregatedLiquidity,
  UserPositions,
  HealthFactor,
  MarketOverview,
  RateComparison,
  BestRates,
  UtilizationRates,
  SupportedResponse,
  Chain,
  Protocol,
} from '@types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://worm-lens-api.onrender.com/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<never>>) => {
    const message =
      error.response?.data?.error?.message ||
      error.message ||
      'An unexpected error occurred';
    
    console.error('API Error:', message);
    return Promise.reject(new Error(message));
  }
);

// ==================== Rates API ====================

export async function getRates(params?: {
  chain?: Chain;
  protocol?: Protocol;
  asset?: string;
}): Promise<AggregatedRates> {
  const { data } = await api.get<ApiResponse<AggregatedRates>>('/rates', {
    params,
  });
  
  if (!data.success || !data.data) {
    throw new Error('Failed to fetch rates');
  }
  
  return data.data;
}

export async function getBestRates(params: {
  type: 'supply' | 'borrow';
  asset: string;
  amount?: number;
}): Promise<BestRates> {
  const { data } = await api.get<ApiResponse<BestRates>>('/rates/best', {
    params,
  });
  
  if (!data.success || !data.data) {
    throw new Error('Failed to fetch best rates');
  }
  
  return data.data;
}

// ==================== Liquidity API ====================

export async function getLiquidity(params?: {
  chain?: Chain;
  protocol?: Protocol;
  asset?: string;
}): Promise<AggregatedLiquidity> {
  const { data } = await api.get<ApiResponse<AggregatedLiquidity>>(
    '/liquidity',
    { params }
  );
  
  if (!data.success || !data.data) {
    throw new Error('Failed to fetch liquidity');
  }
  
  return data.data;
}

export async function getUtilizationRates(params?: {
  chain?: Chain;
  protocol?: Protocol;
}): Promise<UtilizationRates> {
  const { data } = await api.get<ApiResponse<UtilizationRates>>(
    '/liquidity/utilization',
    { params }
  );
  
  if (!data.success || !data.data) {
    throw new Error('Failed to fetch utilization rates');
  }
  
  return data.data;
}

// ==================== User Positions API ====================

export async function getUserPositions(
  wallet: string,
  params?: {
    chain?: Chain;
    protocol?: Protocol;
  }
): Promise<UserPositions> {
  const { data } = await api.get<ApiResponse<UserPositions>>(
    `/user/${wallet}`,
    { params }
  );
  
  if (!data.success || !data.data) {
    throw new Error('Failed to fetch user positions');
  }
  
  return data.data;
}

export async function getUserHealthFactor(wallet: string): Promise<HealthFactor> {
  const { data } = await api.get<ApiResponse<HealthFactor>>(
    `/user/${wallet}/health`
  );
  
  if (!data.success || !data.data) {
    throw new Error('Failed to fetch health factor');
  }
  
  return data.data;
}

// ==================== Analytics API ====================

export async function getMarketOverview(): Promise<MarketOverview> {
  const { data } = await api.get<ApiResponse<MarketOverview>>(
    '/analytics/overview'
  );
  
  if (!data.success || !data.data) {
    throw new Error('Failed to fetch market overview');
  }
  
  return data.data;
}

export async function compareRates(params: {
  asset: string;
  chains?: string;
  protocols?: string;
}): Promise<RateComparison> {
  const { data } = await api.get<ApiResponse<RateComparison>>(
    '/analytics/compare',
    { params }
  );
  
  if (!data.success || !data.data) {
    throw new Error('Failed to compare rates');
  }
  
  return data.data;
}

// ==================== Metadata API ====================

export async function getSupportedChainsAndProtocols(): Promise<SupportedResponse> {
  const { data } = await api.get<ApiResponse<SupportedResponse>>('/supported');
  
  if (!data.success || !data.data) {
    throw new Error('Failed to fetch supported chains/protocols');
  }
  
  return data.data;
}

// ==================== Health Check ====================

export async function healthCheck(): Promise<{ status: string; timestamp: number }> {
  const { data } = await api.get('/health');
  return data;
}

export default api;