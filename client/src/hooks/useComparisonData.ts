// src/hooks/useComparisonData.ts
import { useQuery } from '@tanstack/react-query';
import { compareRates, getBestRates } from '@services/api';
import type { Chain, Protocol } from '@types';

export function useComparisonData(
  asset: string,
  chains?: Chain[],
  protocols?: Protocol[]
) {
  const chainsParam = chains?.join(',');
  const protocolsParam = protocols?.join(',');

  return useQuery({
    queryKey: ['comparison', asset, chainsParam, protocolsParam],
    queryFn: () =>
      compareRates({
        asset,
        chains: chainsParam,
        protocols: protocolsParam,
      }),
    enabled: !!asset,
    staleTime: 60 * 1000,
  });
}

export function useBestRate(
  type: 'supply' | 'borrow',
  asset: string,
  amount?: number
) {
  return useQuery({
    queryKey: ['best-rate', type, asset, amount],
    queryFn: () => getBestRates({ type, asset, amount }),
    enabled: !!asset,
    staleTime: 60 * 1000,
  });
}

