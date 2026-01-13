import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, TrendingDown, Info, CheckCircle } from 'lucide-react';

export interface Alert {
  type: 'warning' | 'info' | 'success' | 'critical';
  title: string;
  message: string;
  metric?: string;
  change?: number;
}

interface AlertBannerProps {
  alerts: Alert[];
}

export function AlertBanner({ alerts }: AlertBannerProps) {
  if (alerts.length === 0) {
    return (
      <motion.div
        className="p-3 rounded-lg bg-green-500/10 border-l-3 border-green-500"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
          <span className="text-sm font-medium text-foreground">All systems nominal</span>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert, index) => {
        const config = {
          warning: {
            icon: AlertTriangle,
            color: 'text-amber-500',
            borderColor: 'border-amber-500',
            bgColor: 'bg-amber-500/10',
          },
          critical: {
            icon: AlertTriangle,
            color: 'text-red-500',
            borderColor: 'border-red-500',
            bgColor: 'bg-red-500/10',
          },
          info: {
            icon: Info,
            color: 'text-blue-500',
            borderColor: 'border-blue-500',
            bgColor: 'bg-blue-500/10',
          },
          success: {
            icon: TrendingUp,
            color: 'text-green-500',
            borderColor: 'border-green-500',
            bgColor: 'bg-green-500/10',
          },
        }[alert.type];

        const Icon = config.icon;

        return (
          <motion.div
            key={index}
            className={`p-3 rounded-lg ${config.bgColor} border-l-3 ${config.borderColor}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex items-start gap-3">
              <Icon size={16} className={`${config.color} flex-shrink-0 mt-0.5`} />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-foreground">{alert.title}</h4>
                <p className="text-sm text-muted-foreground">{alert.message}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
