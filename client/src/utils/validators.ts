// src/utils/validators.ts
import { Chain } from '@types';

/**
 * Validates an Ethereum address
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validates a Solana address (base58, 32-44 chars)
 */
export function isValidSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

/**
 * Determines the chain type from an address
 */
export function getChainFromAddress(address: string): Chain | null {
  if (isValidEthereumAddress(address)) {
    return Chain.ETHEREUM;
  }
  if (isValidSolanaAddress(address)) {
    return Chain.SOLANA;
  }
  return null;
}

/**
 * Validates a transaction hash
 */
export function isValidTxHash(hash: string): boolean {
  // Ethereum tx hash
  if (/^0x[a-fA-F0-9]{64}$/.test(hash)) {
    return true;
  }
  // Solana signature (base58, 87-88 chars)
  if (/^[1-9A-HJ-NP-Za-km-z]{87,88}$/.test(hash)) {
    return true;
  }
  return false;
}

/**
 * Validates a numeric string (for amounts)
 */
export function isValidAmount(amount: string): boolean {
  const num = parseFloat(amount);
  return !isNaN(num) && num >= 0;
}

/**
 * Validates that a value is a positive number
 */
export function isPositiveNumber(value: number): boolean {
  return typeof value === 'number' && !isNaN(value) && value > 0;
}

/**
 * Validates APY value (should be between 0 and reasonable max)
 */
export function isValidAPY(apy: number): boolean {
  return typeof apy === 'number' && !isNaN(apy) && apy >= 0 && apy <= 10000;
}

