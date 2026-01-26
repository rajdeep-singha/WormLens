// src/components/wallet/ChainBreakdown.tsx
import { UserPositions, CHAIN_INFO } from '@types';
import { Card } from '@components/ui/Card';
import { ChainBadge } from '@components/ui/Badge';
import { formatUSD } from '@utils/formatters';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ChainBreakdownProps {
  positions: UserPositions;
}

export function ChainBreakdown({ positions }: ChainBreakdownProps) {
  // Aggregate by chain
  const chainData = positions.supplyPositions.reduce((acc, pos) => {
    const existing = acc.find((item) => item.chain === pos.chain);
    if (existing) {
      existing.value += pos.suppliedAmountUSD;
    } else {
      acc.push({
        chain: pos.chain,
        name: CHAIN_INFO[pos.chain].name,
        value: pos.suppliedAmountUSD,
        color: CHAIN_INFO[pos.chain].color,
      });
    }
    return acc;
  }, [] as Array<{ chain: string; name: string; value: number; color: string }>);

  if (chainData.length === 0) return null;

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6">Positions by Chain</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chainData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {chainData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        <div className="space-y-3">
          {chainData.map((item) => (
            <div
              key={item.chain}
              className="flex items-center justify-between p-3 bg-wh-bg-card rounded-wh"
            >
              <ChainBadge chain={item.chain as any} />
              <span className="font-semibold">{formatUSD(item.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}