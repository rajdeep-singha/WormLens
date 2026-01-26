// src/hooks/useWalletData.ts
import { useQuery } from '@tanstack/react-query';
import { getUserPositions, getUserHealthFactor } from '@services/api';
import { validateWalletAddress, Chain, Protocol } from '@types';

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
    enabled: validation.isValid,
    staleTime: 30 * 1000,
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

