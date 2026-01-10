import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

type MetricCardProps = {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label?: string;
  };
  suffix?: string;
  color?: 'default' | 'success' | 'warning' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg';
};

const colorClasses = {
  default: 'text-black dark:text-white',
  success: 'text-green-400',
  warning: 'text-amber-400',
  danger: 'text-red-400',
  accent: 'text-tech-accent',
};

const iconBgClasses = {
  default: 'bg-tech-neon/20',
  success: 'bg-green-500/20',
  warning: 'bg-amber-500/20',
  danger: 'bg-red-500/20',
  accent: 'bg-tech-accent/20',
};

const sizeClasses = {
  sm: {
    value: 'text-2xl md:text-3xl',
    label: 'text-xs',
    icon: 'w-8 h-8',
    iconSize: 16,
  },
  md: {
    value: 'text-3xl md:text-4xl',
    label: 'text-sm',
    icon: 'w-10 h-10',
    iconSize: 20,
  },
  lg: {
    value: 'text-4xl md:text-5xl',
    label: 'text-base',
    icon: 'w-12 h-12',
    iconSize: 24,
  },
};

export function MetricCard({
  label,
  value,
  icon: Icon,
  trend,
  suffix,
  color = 'default',
  size = 'md',
}: MetricCardProps) {
  const sizes = sizeClasses[size];

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return TrendingUp;
    if (trend.value < 0) return TrendingDown;
    return Minus;
  };

  const getTrendColor = () => {
    if (!trend) return '';
    if (trend.value > 0) return 'text-green-400';
    if (trend.value < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const TrendIcon = getTrendIcon();

  return (
    <motion.div
      className="glass-card group relative overflow-hidden"
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      {/* Hover glow effect */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            'radial-gradient(300px circle at 50% 50%, rgba(0, 224, 255, 0.1), transparent 60%)',
        }}
      />

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          {/* Label */}
          <p
            className={`${sizes.label} text-muted-foreground font-medium uppercase tracking-wider mb-2`}
          >
            {label}
          </p>

          {/* Value */}
          <div className="flex items-baseline gap-1">
            <span
              className={`${sizes.value} font-bold ${colorClasses[color]} tracking-tight`}
            >
              {value}
            </span>
            {suffix && (
              <span className="text-lg text-muted-foreground font-medium">
                {suffix}
              </span>
            )}
          </div>

          {/* Trend */}
          {trend && TrendIcon && (
            <div className={`flex items-center gap-1 mt-2 ${getTrendColor()}`}>
              <TrendIcon size={14} />
              <span className="text-xs font-medium">
                {trend.value > 0 ? '+' : ''}
                {trend.value}%
              </span>
              {trend.label && (
                <span className="text-xs text-muted-foreground ml-1">
                  {trend.label}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Icon */}
        {Icon && (
          <div
            className={`${sizes.icon} ${iconBgClasses[color]} rounded-xl flex items-center justify-center`}
          >
            <Icon size={sizes.iconSize} className={colorClasses[color]} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
