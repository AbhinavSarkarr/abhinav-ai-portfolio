import { motion } from 'framer-motion';
import { ClientRanking, DomainRanking, formatNumber } from '@/hooks/useDashboardData';
import { chartTheme, chartColorPalette } from '@/lib/chartTheme';
import {
  Building2,
  Eye,
  MousePointerClick,
  TrendingUp,
  Briefcase,
  Heart,
  DollarSign,
  ShoppingCart,
  Stethoscope,
} from 'lucide-react';

type ClientRankingListProps = {
  clients: ClientRanking[];
  domains: DomainRanking[];
};

const DOMAIN_ICONS: Record<string, typeof Building2> = {
  Healthcare: Stethoscope,
  Fintech: DollarSign,
  'E-commerce': ShoppingCart,
  'HR Tech': Briefcase,
  Trading: TrendingUp,
};

export function ClientRankingList({ clients, domains }: ClientRankingListProps) {
  const sortedClients = [...clients].sort((a, b) => a.engagement_rank - b.engagement_rank);
  const sortedDomains = [...domains].sort((a, b) => a.interest_rank - b.interest_rank);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Client Rankings */}
      <div>
        <h4 className="text-lg font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
          <Building2 size={18} className="text-tech-accent" />
          Client Work Rankings
        </h4>

        <div className="space-y-3">
          {sortedClients.map((client, index) => {
            const DomainIcon = DOMAIN_ICONS[client.domain] || Building2;

            return (
              <motion.div
                key={client.client_id}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-black dark:text-white font-bold text-sm"
                      style={{
                        backgroundColor: chartColorPalette[index % chartColorPalette.length],
                      }}
                    >
                      #{client.engagement_rank}
                    </div>
                    <div>
                      <h5 className="font-medium text-black dark:text-white">{client.client_name}</h5>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <DomainIcon size={10} />
                        {client.domain}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5">
                    <Eye size={12} className="text-tech-neon" />
                    <span className="text-sm text-black dark:text-white">{formatNumber(client.total_views)}</span>
                    <span className="text-xs text-muted-foreground">views</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MousePointerClick size={12} className="text-tech-accent" />
                    <span className="text-sm text-black dark:text-white">{formatNumber(client.total_clicks)}</span>
                    <span className="text-xs text-muted-foreground">clicks</span>
                  </div>
                  {client.total_views > 0 && (
                    <div className="flex items-center gap-1.5">
                      <TrendingUp size={12} className="text-green-400" />
                      <span className="text-sm text-black dark:text-white">
                        {((client.total_clicks / client.total_views) * 100).toFixed(1)}%
                      </span>
                      <span className="text-xs text-muted-foreground">CTR</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Domain Interest */}
      <div>
        <h4 className="text-lg font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
          <Heart size={18} className="text-tech-highlight" />
          Industry Interest
        </h4>

        <div className="space-y-3">
          {sortedDomains.map((domain, index) => {
            const DomainIcon = DOMAIN_ICONS[domain.domain] || Building2;
            const maxScore = Math.max(...domains.map((d) => d.total_interest_score));
            const percentage = (domain.total_interest_score / maxScore) * 100;

            return (
              <motion.div
                key={domain.domain}
                className="p-4 rounded-xl bg-white/5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: `${chartColorPalette[index % chartColorPalette.length]}20`,
                      }}
                    >
                      <DomainIcon
                        size={18}
                        style={{ color: chartColorPalette[index % chartColorPalette.length] }}
                      />
                    </div>
                    <div>
                      <h5 className="font-medium text-black dark:text-white">{domain.domain}</h5>
                      <span className="text-xs text-muted-foreground">
                        Rank #{domain.interest_rank}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      domain.demand_tier === 'high_demand'
                        ? 'bg-green-500/20 text-green-400'
                        : domain.demand_tier === 'moderate_demand'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {domain.demand_tier.replace('_', ' ')}
                  </span>
                </div>

                {/* Interest bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Interest Score</span>
                    <span className="text-black dark:text-white">{domain.total_interest_score}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: chartColorPalette[index % chartColorPalette.length],
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                    />
                  </div>
                </div>

                {/* Recommendation */}
                <p className="text-xs text-muted-foreground mt-2 italic">
                  {domain.portfolio_recommendation === 'primary_strength'
                    ? 'This is your primary strength - feature prominently'
                    : domain.portfolio_recommendation === 'showcase_more'
                    ? 'Consider showcasing more work in this domain'
                    : 'Consider expanding into this area'}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
