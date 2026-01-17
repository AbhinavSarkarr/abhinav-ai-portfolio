import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { Users, Activity, Clock, Target, TrendingDown, FileStack } from 'lucide-react';

interface ExecutiveSummaryCardProps {
  uniqueVisitors: number;
  totalSessions: number;
  engagementRate: number;
  bounceRate: number;
  avgSessionDuration: number;
  avgPagesPerSession: number;
  totalConversions: number;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function ExecutiveSummaryCard({
  uniqueVisitors,
  totalSessions,
  engagementRate,
  bounceRate,
  avgSessionDuration,
  avgPagesPerSession,
  totalConversions,
}: ExecutiveSummaryCardProps) {
  // Calculate health score
  const healthScore = useMemo(() => {
    const engagementScore = Math.min(100, engagementRate * 1.2);
    const bounceScore = Math.max(0, 100 - bounceRate * 1.2);
    const conversionScore = Math.min(100, totalConversions * 15);
    const sessionScore = Math.min(100, totalSessions * 0.5);
    return Math.round(
      engagementScore * 0.35 +
      bounceScore * 0.25 +
      conversionScore * 0.25 +
      sessionScore * 0.15
    );
  }, [engagementRate, bounceRate, totalConversions, totalSessions]);

  const healthTier = useMemo(() => {
    if (healthScore >= 80) return { label: 'Excellent', color: '#10b981', gradient: ['#10b981', '#34d399'] };
    if (healthScore >= 60) return { label: 'Good', color: '#3b82f6', gradient: ['#3b82f6', '#60a5fa'] };
    if (healthScore >= 40) return { label: 'Fair', color: '#f59e0b', gradient: ['#f59e0b', '#fbbf24'] };
    return { label: 'Needs Work', color: '#ef4444', gradient: ['#ef4444', '#f87171'] };
  }, [healthScore]);

  // Gauge dimensions - responsive
  const gaugeSizeMobile = 100;
  const gaugeSizeDesktop = 140;
  const strokeMobile = 8;
  const strokeDesktop = 10;
  const radiusMobile = (gaugeSizeMobile - strokeMobile) / 2;
  const radiusDesktop = (gaugeSizeDesktop - strokeDesktop) / 2;
  const circumferenceMobile = radiusMobile * 2 * Math.PI;
  const circumferenceDesktop = radiusDesktop * 2 * Math.PI;
  const offsetMobile = circumferenceMobile - (healthScore / 100) * circumferenceMobile;
  const offsetDesktop = circumferenceDesktop - (healthScore / 100) * circumferenceDesktop;

  // Metrics data
  const metrics = [
    {
      label: 'Visitors',
      value: formatNumber(uniqueVisitors),
      subtitle: `${formatNumber(totalSessions)} sessions`,
      icon: Users,
      color: '#7B42F6' // tech-neon purple
    },
    {
      label: 'Engagement',
      value: `${engagementRate.toFixed(1)}%`,
      subtitle: 'interaction rate',
      icon: Activity,
      color: '#00E0FF' // tech-accent cyan
    },
    {
      label: 'Bounce Rate',
      value: `${bounceRate.toFixed(1)}%`,
      subtitle: 'left immediately',
      icon: TrendingDown,
      color: bounceRate > 50 ? '#ef4444' : '#f59e0b'
    },
    {
      label: 'Avg. Time',
      value: formatDuration(avgSessionDuration),
      subtitle: `${avgPagesPerSession.toFixed(1)} pages/visit`,
      icon: Clock,
      color: '#10B981' // emerald
    },
    {
      label: 'Pages/Session',
      value: avgPagesPerSession.toFixed(1),
      subtitle: 'depth of exploration',
      icon: FileStack,
      color: '#9D41FB' // tech-glow
    },
    {
      label: 'Conversions',
      value: totalConversions.toString(),
      subtitle: 'key actions taken',
      icon: Target,
      color: '#FF3DDB' // tech-highlight pink
    },
  ];

  return (
    <motion.div
      className="
        relative overflow-hidden rounded-2xl
        bg-white/70 dark:bg-tech-glass
        backdrop-blur-xl
        border border-black/5 dark:border-white/10
        shadow-lg shadow-black/5 dark:shadow-none
        transition-all duration-300
        group hover:border-tech-accent/30 dark:hover:border-tech-accent/40
        p-4 md:p-6
      "
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4, transition: { duration: 0.3 } }}
    >
      {/* Hover Glow Effect - Dark Mode Only */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0 hidden dark:block"
        style={{
          background: 'radial-gradient(600px circle at 50% 50%, rgba(0, 224, 255, 0.08), transparent 60%)',
        }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-4 sm:gap-6 lg:gap-10">
        {/* Health Score Gauge - Left/Top */}
        <div className="flex-shrink-0 flex flex-col items-center">
          {/* Mobile Gauge */}
          <div className="relative sm:hidden" style={{ width: gaugeSizeMobile, height: gaugeSizeMobile }}>
            <svg className="transform -rotate-90" width={gaugeSizeMobile} height={gaugeSizeMobile}>
              <defs>
                <linearGradient id="exec-gauge-gradient-mobile" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={healthTier.gradient[0]} />
                  <stop offset="100%" stopColor={healthTier.gradient[1]} />
                </linearGradient>
                <filter id="glow-mobile">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <circle
                cx={gaugeSizeMobile / 2}
                cy={gaugeSizeMobile / 2}
                r={radiusMobile}
                stroke="currentColor"
                strokeWidth={strokeMobile}
                fill="none"
                className="text-gray-200 dark:text-white/10"
              />
              <motion.circle
                cx={gaugeSizeMobile / 2}
                cy={gaugeSizeMobile / 2}
                r={radiusMobile}
                stroke="url(#exec-gauge-gradient-mobile)"
                strokeWidth={strokeMobile}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumferenceMobile}
                initial={{ strokeDashoffset: circumferenceMobile }}
                animate={{ strokeDashoffset: offsetMobile }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                filter="url(#glow-mobile)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                className="text-2xl font-bold"
                style={{ color: healthTier.color }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                {healthScore}
              </motion.div>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Health</span>
            </div>
          </div>
          {/* Desktop Gauge */}
          <div className="relative hidden sm:block" style={{ width: gaugeSizeDesktop, height: gaugeSizeDesktop }}>
            <svg className="transform -rotate-90" width={gaugeSizeDesktop} height={gaugeSizeDesktop}>
              <defs>
                <linearGradient id="exec-gauge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={healthTier.gradient[0]} />
                  <stop offset="100%" stopColor={healthTier.gradient[1]} />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <circle
                cx={gaugeSizeDesktop / 2}
                cy={gaugeSizeDesktop / 2}
                r={radiusDesktop}
                stroke="currentColor"
                strokeWidth={strokeDesktop}
                fill="none"
                className="text-gray-200 dark:text-white/10"
              />
              <motion.circle
                cx={gaugeSizeDesktop / 2}
                cy={gaugeSizeDesktop / 2}
                r={radiusDesktop}
                stroke="url(#exec-gauge-gradient)"
                strokeWidth={strokeDesktop}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumferenceDesktop}
                initial={{ strokeDashoffset: circumferenceDesktop }}
                animate={{ strokeDashoffset: offsetDesktop }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                filter="url(#glow)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                className="text-4xl font-bold text-gray-900 dark:text-white"
                style={{ color: healthTier.color }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                {healthScore}
              </motion.div>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Health Score</span>
            </div>
          </div>
          {/* Health tier badge */}
          <motion.div
            className="text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full mt-1.5 sm:mt-2"
            style={{
              backgroundColor: `${healthTier.color}20`,
              color: healthTier.color,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {healthTier.label}
          </motion.div>
        </div>

        {/* Metrics Grid - Right/Bottom */}
        <div className="flex-1 w-full">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <motion.div
                  key={metric.label}
                  className="
                    relative p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl
                    bg-gray-50/50 dark:bg-white/5
                    border border-gray-100 dark:border-white/10
                    hover:bg-gray-100/50 dark:hover:bg-white/10
                    hover:border-tech-accent/20 dark:hover:border-tech-accent/30
                    transition-all duration-200
                  "
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.08 }}
                  whileHover={{ scale: 1.02 }}
                >
                  {/* Icon */}
                  <div
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg flex items-center justify-center mb-1 sm:mb-2"
                    style={{ backgroundColor: `${metric.color}15` }}
                  >
                    <Icon size={12} className="sm:hidden" style={{ color: metric.color }} />
                    <Icon size={16} className="hidden sm:block" style={{ color: metric.color }} />
                  </div>
                  {/* Value */}
                  <div className="text-base sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                    {metric.value}
                  </div>
                  {/* Label */}
                  <div className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300">
                    {metric.label}
                  </div>
                  {/* Subtitle */}
                  <div className="text-[8px] sm:text-[10px] md:text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1">
                    {metric.subtitle}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
