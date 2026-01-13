import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Info,
  ArrowRight
} from 'lucide-react';

type InsightType = 'positive' | 'negative' | 'neutral' | 'warning' | 'action';

interface InsightCardProps {
  type: InsightType;
  title: string;
  description: string;
  metric?: string | number;
  metricLabel?: string;
  action?: string;
  className?: string;
}

const insightConfig: Record<InsightType, {
  icon: typeof Lightbulb;
  bgGradient: string;
  borderColor: string;
  iconColor: string;
  titleColor: string;
}> = {
  positive: {
    icon: CheckCircle2,
    bgGradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
    borderColor: 'border-emerald-500/30',
    iconColor: 'text-emerald-400',
    titleColor: 'text-emerald-400',
  },
  negative: {
    icon: TrendingDown,
    bgGradient: 'from-red-500/10 via-red-500/5 to-transparent',
    borderColor: 'border-red-500/30',
    iconColor: 'text-red-400',
    titleColor: 'text-red-400',
  },
  neutral: {
    icon: Info,
    bgGradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
    borderColor: 'border-blue-500/30',
    iconColor: 'text-blue-400',
    titleColor: 'text-blue-400',
  },
  warning: {
    icon: AlertTriangle,
    bgGradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
    borderColor: 'border-amber-500/30',
    iconColor: 'text-amber-400',
    titleColor: 'text-amber-400',
  },
  action: {
    icon: Lightbulb,
    bgGradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
    borderColor: 'border-purple-500/30',
    iconColor: 'text-purple-400',
    titleColor: 'text-purple-400',
  },
};

export function InsightCard({
  type,
  title,
  description,
  metric,
  metricLabel,
  action,
  className = '',
}: InsightCardProps) {
  const config = insightConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-xl p-4
        bg-gradient-to-r ${config.bgGradient}
        border ${config.borderColor}
        backdrop-blur-sm
        ${className}
      `}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg bg-white/5 ${config.iconColor}`}>
          <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-semibold ${config.titleColor} mb-1`}>
            {title}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
          {metric !== undefined && (
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-lg font-bold text-foreground">{metric}</span>
              {metricLabel && (
                <span className="text-xs text-muted-foreground">{metricLabel}</span>
              )}
            </div>
          )}
          {action && (
            <div className="mt-2 flex items-center gap-1 text-xs font-medium text-tech-accent">
              <span>{action}</span>
              <ArrowRight size={12} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Section Conclusion component for summarizing each dashboard section
interface SectionConclusionProps {
  insights: Array<{
    type: InsightType;
    text: string;
  }>;
  className?: string;
}

export function SectionConclusion({ insights, className = '' }: SectionConclusionProps) {
  if (insights.length === 0) return null;

  return (
    <motion.div
      className={`
        mt-6 p-4 rounded-xl
        bg-gradient-to-r from-tech-neon/5 via-tech-accent/5 to-transparent
        border border-tech-accent/20
        ${className}
      `}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb size={16} className="text-tech-accent" />
        <span className="text-sm font-semibold text-foreground">Key Takeaways</span>
      </div>
      <div className="space-y-2">
        {insights.map((insight, index) => {
          const config = insightConfig[insight.type];
          return (
            <div key={index} className="flex items-start gap-2">
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${config.iconColor.replace('text-', 'bg-')}`} />
              <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                {insight.text}
              </p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
