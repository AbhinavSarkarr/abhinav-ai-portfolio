import { ReactNode } from 'react';
import { motion } from 'framer-motion';

type GlassCardProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
  hover?: boolean;
};

export function GlassCard({
  title,
  subtitle,
  children,
  className = '',
  noPadding = false,
  hover = true,
}: GlassCardProps) {
  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-2xl
        bg-white/70 dark:bg-tech-glass
        backdrop-blur-xl
        border border-black/5 dark:border-white/10
        shadow-lg shadow-black/5 dark:shadow-none
        transition-all duration-300
        ${hover ? 'group hover:border-tech-accent/30 dark:hover:border-tech-accent/40' : ''}
        ${className}
      `}
      whileHover={hover ? { y: -4, transition: { duration: 0.3 } } : undefined}
    >
      {/* Hover Glow Effect - Dark Mode Only */}
      {hover && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0 hidden dark:block"
          style={{
            background: 'radial-gradient(600px circle at 50% 50%, rgba(0, 224, 255, 0.08), transparent 60%)',
          }}
        />
      )}

      <div className={`relative z-10 ${noPadding ? '' : 'p-3'}`}>
        {/* Header */}
        {(title || subtitle) && (
          <div className={noPadding ? 'px-3 pt-3' : 'mb-2'}>
            {title && (
              <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
            )}
            {subtitle && (
              <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
            )}
          </div>
        )}

        {/* Content */}
        {children}
      </div>
    </motion.div>
  );
}

// Status badge component for health indicators
type StatusBadgeProps = {
  status: 'excellent' | 'good' | 'needs_attention' | 'critical' | string;
  label?: string;
  size?: 'sm' | 'md';
};

export function StatusBadge({ status, label, size = 'md' }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'excellent':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30';
      case 'good':
        return 'bg-blue-100 text-blue-700 dark:bg-tech-neon/20 dark:text-tech-neon border-blue-200 dark:border-tech-neon/30';
      case 'needs_attention':
      case 'needs_improvement':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30';
      case 'critical':
      case 'underperforming':
        return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400 border-gray-200 dark:border-gray-500/30';
    }
  };

  const getStatusLabel = () => {
    if (label) return label;
    switch (status) {
      case 'excellent':
        return 'Excellent';
      case 'good':
        return 'Good';
      case 'needs_attention':
      case 'needs_improvement':
        return 'Needs Attention';
      case 'critical':
      case 'underperforming':
        return 'Critical';
      default:
        return status;
    }
  };

  const getDotColor = () => {
    switch (status) {
      case 'excellent':
        return 'bg-emerald-500';
      case 'good':
        return 'bg-tech-neon';
      case 'needs_attention':
      case 'needs_improvement':
        return 'bg-amber-500';
      case 'critical':
      case 'underperforming':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${sizeClasses} rounded-full font-medium border ${getStatusStyles()}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${getDotColor()}`} />
      {getStatusLabel()}
    </span>
  );
}

// Progress ring component for health scores
type ProgressRingProps = {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
};

export function ProgressRing({
  value,
  max = 100,
  size = 80,
  strokeWidth = 6,
  color,
  label,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min(value / max, 1);
  const offset = circumference - percentage * circumference;

  const getColor = () => {
    if (color) return color;
    if (percentage >= 0.8) return '#10B981';
    if (percentage >= 0.6) return '#7B42F6';
    if (percentage >= 0.4) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          className="stroke-gray-200 dark:stroke-white/10"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
          style={{
            filter: `drop-shadow(0 0 6px ${getColor()}50)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-gray-900 dark:text-white">{Math.round(value)}</span>
        {label && (
          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
