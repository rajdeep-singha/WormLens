// src/components/wallet/WalletInput.tsx
import { useState } from 'react';
import { Search, Clock, Copy, Check } from 'lucide-react';
import { Card } from '@components/ui/Card';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import { formatAddress } from '@utils/formatters';

interface WalletInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (address: string) => void;
  validation: {
    isValid: boolean;
    chain?: string;
    error?: string;
  };
  recentAddresses: string[];
  exampleAddresses: Array<{
    label: string;
    address: string;
    chain: string;
  }>;
}

export function WalletInput({
  value,
  onChange,
  onSubmit,
  validation,
  recentAddresses,
  exampleAddresses,
}: WalletInputProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(address);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Main Input */}
        <div>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste wallet address (0x... or Solana address)"
            icon={<Search size={20} />}
            error={value && !validation.isValid ? validation.error : undefined}
            helperText={
              validation.isValid && validation.chain
                ? `Detected ${validation.chain} address`
                : undefined
            }
          />
          <div className="mt-3 flex justify-end">
            <Button
              variant="primary"
              onClick={() => onSubmit(value)}
              disabled={!validation.isValid}
            >
              Analyze Wallet
            </Button>
          </div>
        </div>

        {/* Recent Addresses */}
        {recentAddresses.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} className="text-wh-text-muted" />
              <span className="text-sm font-medium text-wh-text-secondary">
                Recent Addresses
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentAddresses.map((address) => (
                <motion.button
                  key={address}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => {
                    onChange(address);
                    onSubmit(address);
                  }}
                  className="group flex items-center gap-2 px-3 py-2 bg-wh-bg-input border border-gray-700 rounded-wh hover:border-wh-primary-start transition-all"
                >
                  <span className="text-sm font-mono text-wh-text-secondary group-hover:text-wh-text-primary">
                    {formatAddress(address)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(address);
                    }}
                    className="text-wh-text-muted hover:text-wh-primary-start transition-colors"
                  >
                    {copied === address ? (
                      <Check size={14} className="text-success" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Example Addresses */}
        <div>
          <span className="text-sm font-medium text-wh-text-secondary mb-3 block">
            Or try an example:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {exampleAddresses.map((example) => (
              <motion.button
                key={example.address}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => {
                  onChange(example.address);
                  onSubmit(example.address);
                }}
                className="flex items-center justify-between p-3 bg-wh-bg-card border border-gray-800 rounded-wh hover:border-wh-primary-start hover:bg-wh-bg-card-hover transition-all group"
              >
                <div className="text-left">
                  <p className="text-sm font-medium text-wh-text-primary group-hover:text-wh-primary-start">
                    {example.label}
                  </p>
                  <p className="text-xs font-mono text-wh-text-muted">
                    {formatAddress(example.address, 6)}
                  </p>
                </div>
                <Badge variant="info" size="sm">
                  {example.chain}
                </Badge>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}