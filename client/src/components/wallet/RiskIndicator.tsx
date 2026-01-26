// src/components/wallet/RiskIndicator.tsx
import { AlertTriangle, Shield, AlertCircle } from 'lucide-react';
import { Card } from '@components/ui/Card';
import { Badge } from '@components/ui/Badge';
import { HealthFactor, RISK_COLORS } from '@types';
import { formatUSD, formatPercentage } from '@utils/formatters';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface RiskIndicatorProps {
  health: HealthFactor;
}

export function RiskIndicator({ health }: RiskIndicatorProps) {
  const riskConfig = {
    safe: {
      icon: <Shield size={24} />,
      title: 'Safe',
      description: 'Your position is well-collateralized',
      color: RISK_COLORS.safe,
    },
    moderate: {
      icon: <AlertCircle size={24} />,
      title: 'Moderate Risk',
      description: 'Consider adding collateral',
      color: RISK_COLORS.moderate,
    },
    risky: {
      icon: <AlertTriangle size={24} />,
      title: 'Risky',
      description: 'Close to liquidation threshold',
      color: RISK_COLORS.risky,
    },
    danger: {
      icon: <AlertTriangle size={24} />,
      title: 'Danger',
      description: 'High liquidation risk',
      color: RISK_COLORS.danger,
    },
  };

  const config = riskConfig[health.riskLevel];
  const percentage = Math.min((health.healthFactor / 3) * 100, 100);

  return (
    <Card variant="glass" className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="p-3 rounded-xl"
            style={{ backgroundColor: `${config.color}20` }}
          >
            <div style={{ color: config.color }}>{config.icon}</div>
          </div>
          <div>
            <h3 className="text-xl font-semibold">{config.title}</h3>
            <p className="text-sm text-wh-text-muted">{config.description}</p>
          </div>
        </div>
        <Badge
          variant={
            health.riskLevel === 'safe'
              ? 'success'
              : health.riskLevel === 'danger'
              ? 'danger'
              : 'warning'
          }
        >
          Health: {health.healthFactor.toFixed(2)}
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-wh-text-secondary">Health Factor</span>
          <span className="font-medium">{health.healthFactor.toFixed(2)}</span>
        </div>
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${RISK_COLORS.danger} 0%, ${RISK_COLORS.warning} 50%, ${RISK_COLORS.safe} 100%)`,
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-wh-text-muted mt-1">
          <span>Danger (&lt;1.1)</span>
          <span>Safe (&gt;2.0)</span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-3 bg-wh-bg-card rounded-wh">
          <p className="text-xs text-wh-text-muted mb-1">Total Collateral</p>
          <p className="text-lg font-semibold">{formatUSD(health.collateralUSD)}</p>
        </div>
        <div className="p-3 bg-wh-bg-card rounded-wh">
          <p className="text-xs text-wh-text-muted mb-1">Total Debt</p>
          <p className="text-lg font-semibold">{formatUSD(health.debtUSD)}</p>
        </div>
        <div className="p-3 bg-wh-bg-card rounded-wh">
          <p className="text-xs text-wh-text-muted mb-1">Available to Borrow</p>
          <p className="text-lg font-semibold text-success">
            {formatUSD(health.availableToBorrowUSD)}
          </p>
        </div>
      </div>

      {/* Warning Message */}
      {health.riskLevel === 'danger' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-danger/10 border border-danger/30 rounded-wh"
        >
          <p className="text-sm text-danger flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>
              <strong>Warning:</strong> Your health factor is critically low. Add
              collateral or repay debt to avoid liquidation.
            </span>
          </p>
        </motion.div>
      )}
    </Card>
  );
}