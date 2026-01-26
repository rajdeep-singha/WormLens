// src/components/charts/BarChart.tsx
import {
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatCompactUSD } from '@utils/formatters';

interface DataPoint {
  name: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: DataPoint[];
  dataKey?: string;
  color?: string;
  height?: number;
  showGrid?: boolean;
  horizontal?: boolean;
  formatTooltip?: (value: number) => string;
}

export function BarChart({
  data,
  dataKey = 'value',
  color = '#6F4FF2',
  height = 300,
  showGrid = true,
  horizontal = false,
  formatTooltip = formatCompactUSD,
}: BarChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-wh-bg-card border border-gray-700 rounded-wh p-3 shadow-lg">
          <p className="text-wh-text-secondary text-sm">{label}</p>
          <p className="text-wh-text-primary font-semibold">
            {formatTooltip(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBar
        data={data}
        layout={horizontal ? 'vertical' : 'horizontal'}
      >
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        )}
        {horizontal ? (
          <>
            <XAxis
              type="number"
              stroke="#6B7280"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickFormatter={(value) => formatCompactUSD(value)}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#6B7280"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              width={100}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey="name"
              stroke="#6B7280"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
            />
            <YAxis
              stroke="#6B7280"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickFormatter={(value) => formatCompactUSD(value)}
            />
          </>
        )}
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(111, 79, 242, 0.1)' }} />
        <Bar dataKey={dataKey} radius={[8, 8, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || color} />
          ))}
        </Bar>
      </RechartsBar>
    </ResponsiveContainer>
  );
}

