import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface HealthScoreGaugeProps {
  score: number; // 0-100
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function HealthScoreGauge({ score, label = 'Portfolio Health', size = 'md' }: HealthScoreGaugeProps) {
  const dimensions = {
    sm: { size: 120, stroke: 8, fontSize: 'text-lg' },
    md: { size: 180, stroke: 12, fontSize: 'text-3xl' },
    lg: { size: 240, stroke: 16, fontSize: 'text-4xl' },
  };

  const { size: gaugeSize, stroke, fontSize } = dimensions[size];
  const radius = (gaugeSize - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  // Health tier based on score
  const healthTier = useMemo(() => {
    if (score >= 80) return { label: 'Excellent', color: '#10b981', gradient: ['#10b981', '#34d399'] };
    if (score >= 60) return { label: 'Good', color: '#3b82f6', gradient: ['#3b82f6', '#60a5fa'] };
    if (score >= 40) return { label: 'Fair', color: '#f59e0b', gradient: ['#f59e0b', '#fbbf24'] };
    return { label: 'Needs Improvement', color: '#ef4444', gradient: ['#ef4444', '#f87171'] };
  }, [score]);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative" style={{ width: gaugeSize, height: gaugeSize }}>
        {/* Background circle */}
        <svg className="transform -rotate-90" width={gaugeSize} height={gaugeSize}>
          <defs>
            <linearGradient id={`gauge-gradient-${score}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={healthTier.gradient[0]} />
              <stop offset="100%" stopColor={healthTier.gradient[1]} />
            </linearGradient>
          </defs>
          {/* Background track */}
          <circle
            cx={gaugeSize / 2}
            cy={gaugeSize / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={stroke}
            fill="none"
            className="text-muted/20"
          />
          {/* Progress circle */}
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

        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            className={`${fontSize} font-bold bg-gradient-to-r from-tech-neon to-tech-accent bg-clip-text text-transparent`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {Math.round(score)}
          </motion.div>
          <div className="text-xs text-muted-foreground">out of 100</div>
        </div>
      </div>

      {/* Label and tier */}
      <div className="text-center">
        <div className="text-sm font-medium text-foreground mb-1">{label}</div>
        <div
          className="text-xs font-medium px-3 py-1 rounded-full inline-block"
          style={{
            backgroundColor: `${healthTier.color}20`,
            color: healthTier.color,
          }}
        >
          {healthTier.label}
        </div>
      </div>
    </div>
  );
}
