// src/components/charts/AreaChart.tsx
import {
  AreaChart as RechartsArea,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCompactUSD } from '@utils/formatters';

interface DataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface AreaChartProps {
  data: DataPoint[];
  dataKey?: string;
  color?: string;
  gradientId?: string;
  height?: number;
  showGrid?: boolean;
  showAxis?: boolean;
  formatTooltip?: (value: number) => string;
}

export function AreaChart({
  data,
  dataKey = 'value',
  color = '#6F4FF2',
  gradientId = 'colorValue',
  height = 300,
  showGrid = true,
  showAxis = true,
  formatTooltip = formatCompactUSD,
}: AreaChartProps) {
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
      <RechartsArea data={data}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
        )}
        {showAxis && (
          <>
            <XAxis
              dataKey="name"
              stroke="#6B7280"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#6B7280"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCompactUSD(value)}
            />
          </>
        )}
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fillOpacity={1}
          fill={`url(#${gradientId})`}
        />
      </RechartsArea>
    </ResponsiveContainer>
  );
}

