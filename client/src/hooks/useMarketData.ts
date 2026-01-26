// src/hooks/useMarketData.ts
import { useQuery } from '@tanstack/react-query';
import {
  getRates,
  getLiquidity,
  getMarketOverview,
  compareRates,
  getBestRates,
} from '@services/api';
import type { Chain, Protocol } from '@types';

export function useMarketRates(params?: {
  chain?: Chain;
  protocol?: Protocol;
  asset?: string;
}) {
  return useQuery({
    queryKey: ['rates', params],
    queryFn: () => getRates(params),
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useLiquidity(params?: {
  chain?: Chain;
  protocol?: Protocol;
  asset?: string;
}) {
  return useQuery({
    queryKey: ['liquidity', params],
    queryFn: () => getLiquidity(params),
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useMarketOverview() {
  return useQuery({
    queryKey: ['market-overview'],
    queryFn: getMarketOverview,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useRateComparison(
  asset: string,
  chains?: string,
  protocols?: string
) {
  return useQuery({
    queryKey: ['rate-comparison', asset, chains, protocols],
    queryFn: () => compareRates({ asset, chains, protocols }),
    enabled: !!asset,
    staleTime: 60 * 1000,
  });
}

export function useBestRates(
  type: 'supply' | 'borrow',
  asset: string,
  amount?: number
) {
  return useQuery({
    queryKey: ['best-rates', type, asset, amount],
    queryFn: () => getBestRates({ type, asset, amount }),
    enabled: !!asset,
    staleTime: 60 * 1000,
  });
}
