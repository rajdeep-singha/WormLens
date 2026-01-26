// src/components/comparison/ComparisonView.tsx
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { RateComparison } from '@types';
import { Card } from '@components/ui/Card';
import { RateComparisonCard } from './RateComparisonCard';
import { OpportunityHighlight } from './OpportunityHighlight';
import { EmptyState } from '@components/ui/GradientText';

interface ComparisonViewProps {
  data: RateComparison;
}

export function ComparisonView({ data }: ComparisonViewProps) {
  if (!data || data.comparison.length === 0) {
    return (
      <EmptyState
        icon={<BarChart3 size={48} />}
        title="No comparison data"
        description="No rates available for comparison with the selected filters."
      />
    );
  }

  const sortedBySupply = [...data.comparison].sort(
    (a, b) => b.supplyAPY - a.supplyAPY
  );
  const sortedByBorrow = [...data.comparison].sort(
    (a, b) => a.borrowAPY - b.borrowAPY
  );

  // Calculate savings percentages
  const avgSupply =
    data.comparison.reduce((sum, r) => sum + r.supplyAPY, 0) /
    data.comparison.length;
  const avgBorrow =
    data.comparison.reduce((sum, r) => sum + r.borrowAPY, 0) /
    data.comparison.length;

  const supplySavings =
    avgSupply > 0 ? ((data.bestSupply.supplyAPY - avgSupply) / avgSupply) * 100 : 0;
  const borrowSavings =
    avgBorrow > 0 ? ((avgBorrow - data.bestBorrow.borrowAPY) / avgBorrow) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Opportunity Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <OpportunityHighlight
          type="supply"
          title="Best Supply Rate"
          rate={data.bestSupply}
          savingsPercent={supplySavings}
          delay={0.1}
        />
        <OpportunityHighlight
          type="borrow"
          title="Best Borrow Rate"
          rate={data.bestBorrow}
          savingsPercent={borrowSavings}
          delay={0.2}
        />
      </div>

      {/* Supply Rates Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="text-success" size={24} />
              Supply APY Comparison
            </h2>
            <span className="text-sm text-wh-text-muted">Higher is better</span>
          </div>
          <div className="space-y-3">
            {sortedBySupply.map((item, index) => (
              <RateComparisonCard
                key={`supply-${item.protocol}-${item.chain}`}
                item={item}
                type="supply"
                rank={index + 1}
                isBest={index === 0}
                delay={0.3 + index * 0.05}
              />
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Borrow Rates Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <TrendingDown className="text-info" size={24} />
              Borrow APY Comparison
            </h2>
            <span className="text-sm text-wh-text-muted">Lower is better</span>
          </div>
          <div className="space-y-3">
            {sortedByBorrow.map((item, index) => (
              <RateComparisonCard
                key={`borrow-${item.protocol}-${item.chain}`}
                item={item}
                type="borrow"
                rank={index + 1}
                isBest={index === 0}
                delay={0.4 + index * 0.05}
              />
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

