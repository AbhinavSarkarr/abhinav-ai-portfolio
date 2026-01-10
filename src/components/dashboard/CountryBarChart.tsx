import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { CountryData } from '@/hooks/useDashboardData';
import { chartTheme, tooltipStyle, axisStyle, chartColorPalette } from '@/lib/chartTheme';

type CountryBarChartProps = {
  data: CountryData[];
  height?: number;
};

// Country flag emoji mapping (common countries)
const COUNTRY_FLAGS: Record<string, string> = {
  'United States': '🇺🇸',
  'India': '🇮🇳',
  'France': '🇫🇷',
  'Germany': '🇩🇪',
  'Ireland': '🇮🇪',
  'Canada': '🇨🇦',
  'United Kingdom': '🇬🇧',
  'Australia': '🇦🇺',
  'Netherlands': '🇳🇱',
  'Singapore': '🇸🇬',
  'Brazil': '🇧🇷',
  'Spain': '🇪🇸',
  'Italy': '🇮🇹',
  'Japan': '🇯🇵',
  'South Korea': '🇰🇷',
  'China': '🇨🇳',
};

export function CountryBarChart({ data, height = 250 }: CountryBarChartProps) {
  const total = data.reduce((sum, d) => sum + d.visitors, 0);

  const chartData = data.map((d, i) => ({
    ...d,
    flag: COUNTRY_FLAGS[d.country] || '🌍',
    percentage: ((d.visitors / total) * 100).toFixed(1),
    fill: chartColorPalette[i % chartColorPalette.length],
  }));

  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <XAxis
            type="number"
            tick={axisStyle.tick}
            axisLine={axisStyle.axisLine}
            tickLine={axisStyle.tickLine}
          />
          <YAxis
            type="category"
            dataKey="country"
            tick={axisStyle.tick}
            axisLine={false}
            tickLine={false}
            width={100}
            tickFormatter={(value) => {
              const item = chartData.find((d) => d.country === value);
              return `${item?.flag || ''} ${value.length > 10 ? value.slice(0, 10) + '...' : value}`;
            }}
          />
          <Tooltip
            contentStyle={tooltipStyle.contentStyle}
            labelStyle={tooltipStyle.labelStyle}
            formatter={(value: number) => [`${value} visitors`, 'Visitors']}
          />
          <Bar dataKey="visitors" radius={[0, 4, 4, 0]} maxBarSize={20}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.fill}
                style={{
                  filter: `drop-shadow(0 0 4px ${entry.fill}40)`,
                }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Country list with percentages */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {chartData.map((country, i) => (
          <div
            key={country.country}
            className="flex items-center justify-between text-sm px-2 py-1 rounded-lg bg-white/5"
          >
            <div className="flex items-center gap-2">
              <span>{country.flag}</span>
              <span className="text-muted-foreground truncate max-w-[80px]">
                {country.country}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-black dark:text-white font-medium">{country.visitors}</span>
              <span className="text-xs text-muted-foreground">
                ({country.percentage}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
