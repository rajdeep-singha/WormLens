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
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
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
    staleTime: 2 * 60 * 1000, // 2 minutes
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
    enabled: !!asset, // Only fetch if asset is provided
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

// src/hooks/useWalletData.ts
import { useQuery } from '@tanstack/react-query';
import { getUserPositions, getUserHealthFactor } from '@services/api';
import { validateWalletAddress } from '@types';

export function useWalletPositions(
  wallet: string,
  params?: {
    chain?: Chain;
    protocol?: Protocol;
  }
) {
  const validation = validateWalletAddress(wallet);

  return useQuery({
    queryKey: ['wallet-positions', wallet, params],
    queryFn: () => getUserPositions(wallet, params),
    enabled: validation.isValid, // Only fetch if address is valid
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  });
}

export function useHealthFactor(wallet: string) {
  const validation = validateWalletAddress(wallet);

  return useQuery({
    queryKey: ['health-factor', wallet],
    queryFn: () => getUserHealthFactor(wallet),
    enabled: validation.isValid,
    staleTime: 30 * 1000,
    retry: 2,
  });
}

// src/hooks/useDebounce.ts
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// src/hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  };

  return [storedValue, setValue];
}