import { motion } from 'framer-motion';
import { ConversionFunnel as ConversionFunnelType, formatNumber } from '@/hooks/useDashboardData';
import { chartTheme } from '@/lib/chartTheme';
import {
  Eye,
  MousePointerClick,
  FormInput,
  Send,
  Download,
  Share2,
  ChevronRight,
} from 'lucide-react';

type ConversionFunnelProps = {
  data: ConversionFunnelType;
};

export function ConversionFunnel({ data }: ConversionFunnelProps) {
  const funnelSteps = [
    {
      label: 'CTA Views',
      value: data.cta_views,
      icon: Eye,
      color: chartTheme.colors.primary,
    },
    {
      label: 'CTA Clicks',
      value: data.cta_clicks,
      icon: MousePointerClick,
      color: chartTheme.colors.accent,
    },
    {
      label: 'Form Starts',
      value: data.form_starts,
      icon: FormInput,
      color: chartTheme.colors.highlight,
    },
    {
      label: 'Submissions',
      value: data.form_submissions,
      icon: Send,
      color: chartTheme.colors.success,
    },
  ];

  const maxValue = Math.max(...funnelSteps.map((s) => s.value));

  // Calculate conversion rates
  const ctaClickRate = data.cta_views > 0 ? (data.cta_clicks / data.cta_views) * 100 : 0;
  const formStartRate = data.cta_clicks > 0 ? (data.form_starts / data.cta_clicks) * 100 : 0;
  const formCompletionRate = data.form_starts > 0 ? (data.form_submissions / data.form_starts) * 100 : 0;
  const overallConversionRate = data.cta_views > 0 ? (data.form_submissions / data.cta_views) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Funnel Visualization */}
      <div className="space-y-3">
        {funnelSteps.map((step, index) => {
          const width = maxValue > 0 ? (step.value / maxValue) * 100 : 0;
          const nextStep = funnelSteps[index + 1];
          const dropOff = nextStep ? step.value - nextStep.value : 0;
          const dropOffRate = step.value > 0 && nextStep ? ((dropOff / step.value) * 100).toFixed(1) : null;

          return (
            <div key={step.label}>
              <motion.div
                className="relative"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Bar */}
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${step.color}20` }}
                  >
                    <step.icon size={18} style={{ color: step.color }} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-black dark:text-white">{step.label}</span>
                      <span className="text-sm font-bold text-black dark:text-white">
                        {formatNumber(step.value)}
                      </span>
                    </div>
                    <div className="h-8 bg-white/10 rounded-lg overflow-hidden">
                      <motion.div
                        className="h-full rounded-lg flex items-center justify-end pr-3"
                        style={{ backgroundColor: step.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${width}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                      >
                        {width > 20 && (
                          <span className="text-xs font-medium text-black dark:text-white">
                            {width.toFixed(0)}%
                          </span>
                        )}
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Drop-off indicator */}
                {dropOffRate && parseFloat(dropOffRate) > 0 && (
                  <div className="ml-14 mt-1 flex items-center gap-2 text-xs text-red-400">
                    <ChevronRight size={12} className="rotate-90" />
                    <span>-{dropOff} ({dropOffRate}% drop-off)</span>
                  </div>
                )}
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Conversion Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-white/5 text-center">
          <p className="text-xs text-muted-foreground mb-1">CTA Click Rate</p>
          <p className="text-lg font-bold text-tech-neon">{ctaClickRate.toFixed(1)}%</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5 text-center">
          <p className="text-xs text-muted-foreground mb-1">Form Start Rate</p>
          <p className="text-lg font-bold text-tech-accent">{formStartRate.toFixed(1)}%</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5 text-center">
          <p className="text-xs text-muted-foreground mb-1">Form Completion</p>
          <p className="text-lg font-bold text-tech-highlight">{formCompletionRate.toFixed(1)}%</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5 text-center">
          <p className="text-xs text-muted-foreground mb-1">Overall Conversion</p>
          <p className="text-lg font-bold text-green-400">{overallConversionRate.toFixed(2)}%</p>
        </div>
      </div>

      {/* Other Conversions */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
            <Download size={20} className="text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-black dark:text-white">{data.resume_downloads}</p>
            <p className="text-sm text-muted-foreground">Resume Downloads</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Share2 size={20} className="text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-black dark:text-white">{data.social_clicks}</p>
            <p className="text-sm text-muted-foreground">Social Clicks</p>
          </div>
        </div>
      </div>
    </div>
  );
}
