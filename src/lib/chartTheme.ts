// Recharts theme configuration to match portfolio styling

export const chartTheme = {
  colors: {
    primary: '#7B42F6',      // tech-neon
    accent: '#00E0FF',       // tech-accent
    highlight: '#FF3DDB',    // tech-highlight
    glow: '#9D41FB',         // tech-glow
    success: '#10B981',      // green
    warning: '#F59E0B',      // amber
    danger: '#EF4444',       // red
    info: '#3B82F6',         // blue
  },
  background: 'transparent',
  cardBackground: 'rgba(44, 31, 97, 0.35)',
  grid: 'rgba(255, 255, 255, 0.05)',
  text: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.5)',
};

// Color palette for charts with multiple series
export const chartColorPalette = [
  '#7B42F6',  // purple
  '#00E0FF',  // cyan
  '#FF3DDB',  // pink
  '#10B981',  // green
  '#F59E0B',  // amber
  '#3B82F6',  // blue
  '#EF4444',  // red
  '#8B5CF6',  // violet
];

// Gradient definitions for area charts
export const gradientDefs = {
  primary: {
    id: 'primaryGradient',
    startColor: '#7B42F6',
    endColor: 'rgba(123, 66, 246, 0.1)',
  },
  accent: {
    id: 'accentGradient',
    startColor: '#00E0FF',
    endColor: 'rgba(0, 224, 255, 0.1)',
  },
  highlight: {
    id: 'highlightGradient',
    startColor: '#FF3DDB',
    endColor: 'rgba(255, 61, 219, 0.1)',
  },
};

// Common chart props
export const commonChartProps = {
  style: {
    fontSize: 12,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
};

// Tooltip styles
export const tooltipStyle = {
  contentStyle: {
    backgroundColor: 'rgba(10, 4, 38, 0.95)',
    border: '1px solid rgba(123, 66, 246, 0.3)',
    borderRadius: '12px',
    padding: '12px 16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  },
  labelStyle: {
    color: '#fff',
    fontWeight: 600,
    marginBottom: '4px',
  },
  itemStyle: {
    color: 'rgba(255, 255, 255, 0.8)',
    padding: '2px 0',
  },
};

// Axis styles
export const axisStyle = {
  tick: {
    fill: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
  },
  axisLine: {
    stroke: 'rgba(255, 255, 255, 0.1)',
  },
  tickLine: {
    stroke: 'rgba(255, 255, 255, 0.1)',
  },
};

// Legend styles
export const legendStyle = {
  wrapperStyle: {
    paddingTop: '20px',
  },
  iconSize: 10,
  iconType: 'circle' as const,
};

// Grid styles
export const gridStyle = {
  strokeDasharray: '3 3',
  stroke: 'rgba(255, 255, 255, 0.05)',
  vertical: false,
};
