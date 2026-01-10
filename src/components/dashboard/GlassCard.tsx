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
      className={`glass border border-white/10 rounded-2xl overflow-hidden ${
        hover ? 'group' : ''
      } ${className}`}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
    >
      {/* Hover glow effect */}
      {hover && (
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
          style={{
            background:
              'radial-gradient(400px circle at 50% 50%, rgba(123, 66, 246, 0.08), transparent 60%)',
          }}
        />
      )}

      <div className={`relative z-10 ${noPadding ? '' : 'p-6'}`}>
        {/* Header */}
        {(title || subtitle) && (
          <div className={noPadding ? 'px-6 pt-6' : 'mb-4'}>
            {title && (
              <h3 className="text-lg font-semibold text-white">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
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
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'good':
        return 'bg-tech-neon/20 text-tech-neon border-tech-neon/30';
      case 'needs_attention':
      case 'needs_improvement':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'critical':
      case 'underperforming':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
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

  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${sizeClasses} rounded-full font-medium border ${getStatusStyles()}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === 'excellent'
            ? 'bg-green-400'
            : status === 'good'
            ? 'bg-tech-neon'
            : status === 'needs_attention' || status === 'needs_improvement'
            ? 'bg-amber-400'
            : 'bg-red-400'
        }`}
      />
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
    if (percentage >= 0.8) return '#10B981'; // green
    if (percentage >= 0.6) return '#7B42F6'; // purple
    if (percentage >= 0.4) return '#F59E0B'; // amber
    return '#EF4444'; // red
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
          stroke="rgba(255, 255, 255, 0.1)"
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
        <span className="text-lg font-bold text-white">{Math.round(value)}</span>
        {label && (
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
