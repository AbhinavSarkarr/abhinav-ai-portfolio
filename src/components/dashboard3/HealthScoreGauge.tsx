import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { Activity, TrendingUp, Clock, Target } from 'lucide-react';

interface HealthScoreGaugeProps {
  score: number; // 0-100
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

// Compact gauge for inline use
export function HealthScoreGauge({ score, label = 'Portfolio Health', size = 'md' }: HealthScoreGaugeProps) {
  const dimensions = {
    sm: { size: 70, stroke: 5, fontSize: 'text-sm' },
    md: { size: 90, stroke: 6, fontSize: 'text-lg' },
    lg: { size: 110, stroke: 8, fontSize: 'text-xl' },
  };

  const { size: gaugeSize, stroke, fontSize } = dimensions[size];
  const radius = (gaugeSize - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const healthTier = useMemo(() => {
    if (score >= 80) return { label: 'Excellent', color: '#10b981', gradient: ['#10b981', '#34d399'] };
    if (score >= 60) return { label: 'Good', color: '#3b82f6', gradient: ['#3b82f6', '#60a5fa'] };
    if (score >= 40) return { label: 'Fair', color: '#f59e0b', gradient: ['#f59e0b', '#fbbf24'] };
    return { label: 'Needs Improvement', color: '#ef4444', gradient: ['#ef4444', '#f87171'] };
  }, [score]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: gaugeSize, height: gaugeSize }}>
        <svg className="transform -rotate-90" width={gaugeSize} height={gaugeSize}>
          <defs>
            <linearGradient id={`gauge-gradient-${score}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={healthTier.gradient[0]} />
              <stop offset="100%" stopColor={healthTier.gradient[1]} />
            </linearGradient>
          </defs>
          <circle
            cx={gaugeSize / 2}
            cy={gaugeSize / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={stroke}
            fill="none"
            className="text-muted/20"
          />
          <motion.circle
            cx={gaugeSize / 2}
            cy={gaugeSize / 2}
            r={radius}
            stroke={`url(#gauge-gradient-${score})`}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            className={`${fontSize} font-bold`}
            style={{ color: healthTier.color }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {Math.round(score)}
          </motion.div>
        </div>
      </div>
      <div
        className="text-xs font-medium px-2 py-0.5 rounded-full mt-1"
        style={{
          backgroundColor: `${healthTier.color}20`,
          color: healthTier.color,
        }}
      >
        {healthTier.label}
      </div>
    </div>
  );
}

// Full Health Score Card with gauge + metrics side-by-side
interface HealthScoreCardProps {
  score: number;
  engagementRate: number;
  bounceRate: number;
  totalConversions: number;
  avgSessionDuration: number;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

export function HealthScoreCard({ score, engagementRate, bounceRate, totalConversions, avgSessionDuration }: HealthScoreCardProps) {
  const metrics = [
    { label: 'Engagement', value: `${engagementRate.toFixed(0)}%`, icon: Activity, color: '#22d3ee', max: 100, current: engagementRate },
    { label: 'Retention', value: `${(100 - bounceRate).toFixed(0)}%`, icon: TrendingUp, color: '#a855f7', max: 100, current: 100 - bounceRate },
    { label: 'Conversions', value: totalConversions, icon: Target, color: '#fbbf24', max: 20, current: Math.min(totalConversions, 20) },
    { label: 'Avg Time', value: formatDuration(avgSessionDuration), icon: Clock, color: '#34d399', max: 600, current: Math.min(avgSessionDuration, 600) },
  ];

  return (
    <div className="flex items-center gap-6 p-4">
      {/* Gauge on left */}
      <div className="flex-shrink-0">
        <HealthScoreGauge score={score} size="lg" />
      </div>

      {/* Metrics on right */}
      <div className="flex-1 space-y-3">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const percentage = (metric.current / metric.max) * 100;
          return (
            <motion.div
              key={metric.label}
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Icon size={18} style={{ color: metric.color }} className="flex-shrink-0" />
              <span className="text-sm text-muted-foreground w-24 flex-shrink-0">{metric.label}</span>
              <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: metric.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                />
              </div>
              <span className="text-sm font-semibold text-foreground w-14 text-right flex-shrink-0">{metric.value}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
