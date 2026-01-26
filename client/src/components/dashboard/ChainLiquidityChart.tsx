// src/components/dashboard/ChainLiquidityChart.tsx
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { LendingRate, CHAIN_INFO } from '@types';
import { formatCompactUSD } from '@utils/formatters';

interface ChainLiquidityChartProps {
  rates: LendingRate[];
}

export function ChainLiquidityChart({ rates }: ChainLiquidityChartProps) {
  // Aggregate liquidity by chain
  const chainData = rates.reduce((acc, rate) => {
    const existing = acc.find((item) => item.chain === rate.chain);
    if (existing) {
      existing.value += rate.totalSupplyUSD;
    } else {
      acc.push({
        chain: rate.chain,
        name: CHAIN_INFO[rate.chain].name,
        value: rate.totalSupplyUSD,
        color: CHAIN_INFO[rate.chain].color,
      });
    }
    return acc;
  }, [] as Array<{ chain: string; name: string; value: number; color: string }>);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-wh-bg-card border border-gray-700 rounded-wh p-3 shadow-lg">
          <p className="text-wh-text-primary font-semibold">{payload[0].name}</p>
          <p className="text-wh-text-secondary text-sm">
            {formatCompactUSD(payload[0].value)}
          </p>
          <p className="text-wh-text-muted text-xs">
            {((payload[0].value / chainData.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chainData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chainData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}