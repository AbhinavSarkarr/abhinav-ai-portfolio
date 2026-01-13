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
        className="glass-card p-4 border-l-4 border-green-500"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-sm text-foreground">All Systems Nominal</h4>
            <p className="text-xs text-muted-foreground">No anomalies detected in your analytics</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
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
        const TrendIcon = alert.change ? (alert.change > 0 ? TrendingUp : TrendingDown) : null;

        return (
          <motion.div
            key={index}
            className={`glass-card p-4 border-l-4 ${config.borderColor}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-start gap-3">
              <Icon size={20} className={`${config.color} flex-shrink-0 mt-0.5`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm text-foreground">{alert.title}</h4>
                  {alert.change !== undefined && TrendIcon && (
                    <span className={`flex items-center gap-1 text-xs ${alert.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      <TrendIcon size={12} />
                      {Math.abs(alert.change)}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{alert.message}</p>
                {alert.metric && (
                  <div className={`mt-2 inline-block px-2 py-1 rounded text-xs font-medium ${config.bgColor} ${config.color}`}>
                    {alert.metric}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
