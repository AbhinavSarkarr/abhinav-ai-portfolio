import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface DomainRanking {
  domain: string;
  total_explicit_interest: number;
  total_implicit_interest: number;
  total_interactions: number;
  total_unique_users: number;
  total_interest_score: number;
  interest_rank: number;
  interest_percentile: number;
  demand_tier: string;
  portfolio_recommendation: string;
}

interface DomainInterestProps {
  data: DomainRanking[];
}

// Get tier color
function getTierColor(tier: string): string {
  switch (tier) {
    case 'high_demand': return '#10B981';
    case 'moderate_demand': return '#3B82F6';
    case 'emerging': return '#F59E0B';
    default: return '#6B7280';
  }
}

// Format domain name
function formatDomain(domain: string): string {
  return domain
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function DomainInterest({ data }: DomainInterestProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-6">
        <p className="text-sm">No domain data available</p>
      </div>
    );
  }

  // Prepare radar chart data
  const radarData = data.slice(0, 6).map(d => ({
    domain: formatDomain(d.domain).slice(0, 12),
    interest: d.total_interest_score,
    explicit: d.total_explicit_interest,
    implicit: d.total_implicit_interest,
  }));

  const maxInterest = Math.max(...data.map(d => d.total_interest_score));

  const topDomain = data[0];

  return (
    <div className="space-y-3">
      {/* Radar Chart */}
      <div className="h-[180px] md:h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis
              dataKey="domain"
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10 }}
            />
            <Radar
              name="Interest"
              dataKey="interest"
              stroke="#7B42F6"
              fill="#7B42F6"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(17, 17, 27, 0.95)',
                border: '1px solid rgba(123, 66, 246, 0.3)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Domain List */}
      <div className="space-y-1.5">
        {data.slice(0, 4).map((domain, index) => {
          const tierColor = getTierColor(domain.demand_tier);
          const barWidth = (domain.total_interest_score / maxInterest) * 100;

          return (
            <motion.div
              key={domain.domain}
              className="flex items-center gap-2 md:gap-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <span className="text-xs md:text-sm text-muted-foreground w-4 md:w-5">{index + 1}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs md:text-sm font-medium text-foreground truncate">
                    {formatDomain(domain.domain)}
                  </span>
                  <span className="text-xs md:text-sm font-bold" style={{ color: tierColor }}>
                    {domain.total_interest_score}
                  </span>
                </div>
                <div className="h-1.5 md:h-2 bg-muted/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: tierColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Most Interest Badge */}
      {topDomain && (
        <div className="flex flex-wrap items-center gap-1 md:gap-2 pt-2 border-t border-muted/20">
          <TrendingUp size={14} className="text-emerald-400" />
          <span className="text-xs md:text-sm text-muted-foreground">Most Interest:</span>
          <span className="text-xs md:text-sm font-semibold text-foreground">{formatDomain(topDomain.domain)}</span>
          <span className="text-xs md:text-sm font-bold text-emerald-400">({topDomain.total_interest_score})</span>
        </div>
      )}
    </div>
  );
}

// Compact horizontal bar version
export function DomainInterestBars({ data }: DomainInterestProps) {
  if (!data || data.length === 0) return null;

  const maxScore = Math.max(...data.map(d => d.total_interest_score));

  return (
    <div className="space-y-3">
      {data.slice(0, 4).map((domain, index) => {
        const tierColor = getTierColor(domain.demand_tier);
        const barWidth = (domain.total_interest_score / maxScore) * 100;

        return (
          <div key={domain.domain} className="flex items-center gap-3">
            <span className="text-sm text-foreground w-24 truncate">{formatDomain(domain.domain)}</span>
            <div className="flex-1 h-5 bg-muted/20 rounded overflow-hidden">
              <motion.div
                className="h-full rounded flex items-center justify-end pr-2"
                style={{ backgroundColor: tierColor }}
                initial={{ width: 0 }}
                animate={{ width: `${barWidth}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {barWidth > 30 && (
                  <span className="text-xs font-bold text-white">{domain.total_interest_score}</span>
                )}
              </motion.div>
            </div>
            {barWidth <= 30 && (
              <span className="text-sm font-bold" style={{ color: tierColor }}>{domain.total_interest_score}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
