import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Clock,
  Calendar,
  TrendingUp,
  Zap,
} from 'lucide-react';

// Types
interface DayDistribution {
  day_number: number;
  day_name: string;
  sessions: number;
  visitors: number;
}

interface HourDistribution {
  hour: number;
  sessions: number;
  visitors: number;
}

interface TemporalData {
  dayOfWeekDistribution: DayDistribution[];
  hourlyDistribution: HourDistribution[];
}

interface ActivityPatternsCardProps {
  temporal: TemporalData;
}

// Tooltip style
const tooltipStyle = {
  contentStyle: {
    backgroundColor: 'rgba(17, 17, 27, 0.95)',
    border: '1px solid rgba(123, 66, 246, 0.3)',
    borderRadius: '8px',
    fontSize: '12px',
  },
  labelStyle: { color: '#fff', fontWeight: 600 },
};

export function ActivityPatternsCard({ temporal }: ActivityPatternsCardProps) {
  const { dayOfWeekDistribution, hourlyDistribution } = temporal;

  // Calculate peak insights
  const insights = useMemo(() => {
    const peakDay = dayOfWeekDistribution?.length > 0
      ? [...dayOfWeekDistribution].sort((a, b) => b.sessions - a.sessions)[0]
      : null;

    const peakHour = hourlyDistribution?.length > 0
      ? [...hourlyDistribution].sort((a, b) => b.sessions - a.sessions)[0]
      : null;

    const weekendSessions = dayOfWeekDistribution?.filter(d =>
      d.day_name?.toLowerCase() === 'saturday' || d.day_name?.toLowerCase() === 'sunday'
    ).reduce((sum, d) => sum + d.sessions, 0) || 0;

    const weekdaySessions = dayOfWeekDistribution?.filter(d =>
      d.day_name?.toLowerCase() !== 'saturday' && d.day_name?.toLowerCase() !== 'sunday'
    ).reduce((sum, d) => sum + d.sessions, 0) || 0;

    const morningHours = hourlyDistribution?.filter(h => h.hour >= 6 && h.hour < 12)
      .reduce((sum, h) => sum + h.sessions, 0) || 0;

    const afternoonHours = hourlyDistribution?.filter(h => h.hour >= 12 && h.hour < 18)
      .reduce((sum, h) => sum + h.sessions, 0) || 0;

    const eveningHours = hourlyDistribution?.filter(h => h.hour >= 18 && h.hour < 24)
      .reduce((sum, h) => sum + h.sessions, 0) || 0;

    return {
      peakDay,
      peakHour,
      weekendSessions,
      weekdaySessions,
      morningHours,
      afternoonHours,
      eveningHours,
    };
  }, [dayOfWeekDistribution, hourlyDistribution]);

  const hasDayData = dayOfWeekDistribution && dayOfWeekDistribution.length > 0;
  const hasHourData = hourlyDistribution && hourlyDistribution.length > 0;

  if (!hasDayData && !hasHourData) {
    return (
      <motion.div
        className="rounded-2xl bg-white/70 dark:bg-tech-glass backdrop-blur-xl border border-black/5 dark:border-white/10 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center text-muted-foreground py-8">
          <Clock size={32} className="mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-sm">No temporal data available yet</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="rounded-2xl bg-white/70 dark:bg-tech-glass backdrop-blur-xl border border-black/5 dark:border-white/10 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        {/* Peak Insights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-2">
          {insights.peakDay && (
            <div className="p-2 sm:p-3 rounded-lg bg-gradient-to-br from-tech-neon/10 to-tech-neon/5 border border-tech-neon/20">
              <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5 sm:mb-1">
                <Calendar size={10} className="text-tech-neon sm:hidden" />
                <Calendar size={12} className="text-tech-neon hidden sm:block" />
                <span className="text-[9px] sm:text-[10px] text-muted-foreground">Peak Day</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-foreground">{insights.peakDay.day_name}</div>
              <div className="text-[10px] sm:text-xs text-tech-neon">{insights.peakDay.sessions} sessions</div>
            </div>
          )}
          {insights.peakHour && (
            <div className="p-2 sm:p-3 rounded-lg bg-gradient-to-br from-tech-accent/10 to-tech-accent/5 border border-tech-accent/20">
              <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5 sm:mb-1">
                <Clock size={10} className="text-tech-accent sm:hidden" />
                <Clock size={12} className="text-tech-accent hidden sm:block" />
                <span className="text-[9px] sm:text-[10px] text-muted-foreground">Peak Hour</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-foreground">{insights.peakHour.hour}:00</div>
              <div className="text-[10px] sm:text-xs text-tech-accent">{insights.peakHour.sessions} sessions</div>
            </div>
          )}
          <div className="p-2 sm:p-3 rounded-lg bg-gray-50 dark:bg-white/5">
            <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5 sm:mb-1">
              <TrendingUp size={10} className="text-emerald-400 sm:hidden" />
              <TrendingUp size={12} className="text-emerald-400 hidden sm:block" />
              <span className="text-[9px] sm:text-[10px] text-muted-foreground">Weekdays</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-foreground">{insights.weekdaySessions}</div>
            <div className="text-[10px] sm:text-xs text-emerald-400">sessions</div>
          </div>
          <div className="p-2 sm:p-3 rounded-lg bg-gray-50 dark:bg-white/5">
            <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5 sm:mb-1">
              <Zap size={10} className="text-amber-400 sm:hidden" />
              <Zap size={12} className="text-amber-400 hidden sm:block" />
              <span className="text-[9px] sm:text-[10px] text-muted-foreground">Weekend</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-foreground">{insights.weekendSessions}</div>
            <div className="text-[10px] sm:text-xs text-amber-400">sessions</div>
          </div>
        </div>

        {/* Daily Distribution */}
        {hasDayData && (
          <div>
            <h4 className="text-[11px] sm:text-xs font-semibold text-foreground mb-1.5 sm:mb-2 flex items-center gap-1 sm:gap-1.5">
              <Calendar size={10} className="text-tech-neon sm:hidden" />
              <Calendar size={12} className="text-tech-neon hidden sm:block" />
              Daily Traffic
            </h4>
            <div className="space-y-1 sm:space-y-1.5">
              {dayOfWeekDistribution.map((day, index) => {
                const maxSessions = Math.max(...dayOfWeekDistribution.map(d => d.sessions));
                const width = maxSessions > 0 ? (day.sessions / maxSessions) * 100 : 0;
                const isPeak = day.sessions === maxSessions && maxSessions > 0;

                return (
                  <motion.div
                    key={index}
                    className="flex items-center gap-1.5 sm:gap-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <span className={`text-[10px] sm:text-xs w-10 sm:w-14 ${isPeak ? 'font-bold text-tech-neon' : 'text-muted-foreground'}`}>
                      {day.day_name?.slice(0, 3) || `D${day.day_number}`}
                    </span>
                    <div className="flex-1 h-3 sm:h-4 bg-muted/20 rounded overflow-hidden relative">
                      <motion.div
                        className={`h-full rounded ${isPeak ? 'bg-gradient-to-r from-tech-neon to-tech-accent' : 'bg-tech-neon/60'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${width}%` }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                      />
                    </div>
                    <span className={`text-[10px] sm:text-xs w-6 sm:w-8 text-right ${isPeak ? 'font-bold text-tech-neon' : 'text-foreground'}`}>
                      {day.sessions}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Hourly Distribution */}
        {hasHourData && (
          <div>
            <h4 className="text-[11px] sm:text-xs font-semibold text-foreground mb-1.5 sm:mb-2 flex items-center gap-1 sm:gap-1.5">
              <Clock size={10} className="text-tech-accent sm:hidden" />
              <Clock size={12} className="text-tech-accent hidden sm:block" />
              Hourly Traffic
            </h4>
            <div className="h-[110px] sm:h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={hourlyDistribution.filter((_, i) => i % 2 === 0).map(h => ({
                    hour: `${h.hour}:00`,
                    Sessions: h.sessions,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="hour"
                    tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                    width={20}
                  />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="Sessions" fill="#00E0FF" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Time of Day Summary */}
        {hasHourData && (
          <div className="grid grid-cols-3 gap-1 sm:gap-2 pt-2 sm:pt-3 border-t border-muted/20">
            <div className="p-1.5 sm:p-2 rounded-lg bg-amber-500/10 text-center">
              <div className="text-xs sm:text-sm font-bold text-amber-400">{insights.morningHours}</div>
              <div className="text-[8px] sm:text-[10px] text-muted-foreground">Morning (6-12)</div>
            </div>
            <div className="p-1.5 sm:p-2 rounded-lg bg-tech-neon/10 text-center">
              <div className="text-xs sm:text-sm font-bold text-tech-neon">{insights.afternoonHours}</div>
              <div className="text-[8px] sm:text-[10px] text-muted-foreground">Afternoon (12-18)</div>
            </div>
            <div className="p-1.5 sm:p-2 rounded-lg bg-tech-accent/10 text-center">
              <div className="text-xs sm:text-sm font-bold text-tech-accent">{insights.eveningHours}</div>
              <div className="text-[8px] sm:text-[10px] text-muted-foreground">Evening (18-24)</div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
