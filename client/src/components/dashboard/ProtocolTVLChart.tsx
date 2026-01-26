// src/components/dashboard/ProtocolTVLChart.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Protocol, PROTOCOL_INFO } from '@types';
import { formatCompactUSD } from '@utils/formatters';

interface ProtocolTVLChartProps {
  protocols: Array<{
    protocol: Protocol;
    tvlUSD: number;
    chains: string[];
  }>;
}

export function ProtocolTVLChart({ protocols }: ProtocolTVLChartProps) {
  const chartData = protocols.map((p) => ({
    name: PROTOCOL_INFO[p.protocol].name,
    tvl: p.tvlUSD,
    chains: p.chains.length,
    color: PROTOCOL_INFO[p.protocol].color,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-wh-bg-card border border-gray-700 rounded-wh p-3 shadow-lg">
          <p className="text-wh-text-primary font-semibold">{payload[0].payload.name}</p>
          <p className="text-wh-text-secondary text-sm">
            TVL: {formatCompactUSD(payload[0].value)}
          </p>
          <p className="text-wh-text-muted text-xs">
            {payload[0].payload.chains} chains
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          dataKey="name"
          stroke="#9CA3AF"
          tick={{ fill: '#9CA3AF' }}
        />
        <YAxis
          stroke="#9CA3AF"
          tick={{ fill: '#9CA3AF' }}
          tickFormatter={(value) => formatCompactUSD(value)}
        />
        <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(111, 79, 242, 0.1)' }} />
        <Bar dataKey="tvl" radius={[8, 8, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}