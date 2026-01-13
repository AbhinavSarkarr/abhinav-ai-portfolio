import { motion } from 'framer-motion';
import {
  User,
  Globe,
  Monitor,
  Smartphone,
  Clock,
  Eye,
  MousePointer,
  Download,
  MessageSquare,
  Star,
  TrendingUp,
  Zap
} from 'lucide-react';

interface TopVisitor {
  user_pseudo_id: string;
  total_sessions: number;
  visitor_tenure_days: number;
  total_page_views: number;
  avg_session_duration_sec: number;
  engagement_rate: number;
  primary_device: string;
  primary_country: string;
  primary_traffic_source: string;
  projects_viewed: number;
  cta_clicks: number;
  form_submissions: number;
  social_clicks: number;
  resume_downloads: number;
  visitor_value_score: number;
  visitor_segment: string;
  interest_profile: string;
}

interface TopVisitorsProps {
  data: TopVisitor[];
}

// Get segment color and icon
function getSegmentConfig(segment: string) {
  const configs: Record<string, { color: string; icon: typeof Star; label: string }> = {
    'converter': { color: '#10B981', icon: Star, label: 'Converter' },
    'high_intent': { color: '#F59E0B', icon: Zap, label: 'High Intent' },
    'engaged_explorer': { color: '#3B82F6', icon: TrendingUp, label: 'Explorer' },
    'returning_visitor': { color: '#8B5CF6', icon: User, label: 'Returning' },
    'casual_browser': { color: '#6B7280', icon: Eye, label: 'Casual' },
  };
  return configs[segment] || configs['casual_browser'];
}

// Format duration
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

// Anonymize visitor ID
function anonymizeId(id: string): string {
  if (!id || id.length < 8) return 'Visitor';
  return `Visitor ${id.slice(-4).toUpperCase()}`;
}

export function TopVisitors({ data }: TopVisitorsProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-6">
        <p className="text-sm">No visitor data available</p>
      </div>
    );
  }

  // Sort by value score and take top 5
  const topVisitors = [...data]
    .sort((a, b) => b.visitor_value_score - a.visitor_value_score)
    .slice(0, 5);

  const maxScore = Math.max(...topVisitors.map(v => v.visitor_value_score));

  return (
    <div className="space-y-2">
      {topVisitors.map((visitor, index) => {
        const segmentConfig = getSegmentConfig(visitor.visitor_segment);
        const SegmentIcon = segmentConfig.icon;
        const scoreWidth = (visitor.visitor_value_score / maxScore) * 100;

        return (
          <motion.div
            key={visitor.user_pseudo_id}
            className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex items-center gap-3">
              {/* Rank */}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: `${segmentConfig.color}20`, color: segmentConfig.color }}
              >
                {index + 1}
              </div>

              {/* Visitor Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {anonymizeId(visitor.user_pseudo_id)}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{ backgroundColor: `${segmentConfig.color}20`, color: segmentConfig.color }}
                    >
                      {segmentConfig.label}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-tech-accent">
                    {visitor.visitor_value_score}
                  </span>
                </div>

                {/* Score bar */}
                <div className="h-1.5 bg-muted/20 rounded-full overflow-hidden mb-2">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: segmentConfig.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${scoreWidth}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  />
                </div>

                {/* Compact metrics row */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye size={12} />
                    {visitor.total_page_views} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {formatDuration(visitor.avg_session_duration_sec)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe size={12} />
                    {visitor.primary_country}
                  </span>
                  {visitor.resume_downloads > 0 && (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Download size={12} />
                      {visitor.resume_downloads}
                    </span>
                  )}
                  {visitor.form_submissions > 0 && (
                    <span className="flex items-center gap-1 text-blue-400">
                      <MessageSquare size={12} />
                      {visitor.form_submissions}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-muted/20">
        <div className="text-center p-2 rounded-lg bg-white/5">
          <div className="text-xl font-bold text-tech-neon">
            {data.filter(v => v.visitor_segment === 'converter').length}
          </div>
          <div className="text-xs text-muted-foreground">Converters</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-white/5">
          <div className="text-xl font-bold text-tech-accent">
            {data.filter(v => v.visitor_segment === 'high_intent').length}
          </div>
          <div className="text-xs text-muted-foreground">High Intent</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-white/5">
          <div className="text-xl font-bold text-tech-highlight">
            {Math.round(data.reduce((s, v) => s + v.visitor_value_score, 0) / data.length)}
          </div>
          <div className="text-xs text-muted-foreground">Avg Score</div>
        </div>
      </div>
    </div>
  );
}

// Compact version showing just key stats
export function TopVisitorsSummary({ data }: TopVisitorsProps) {
  if (!data || data.length === 0) return null;

  const converters = data.filter(v => v.visitor_segment === 'converter').length;
  const highIntent = data.filter(v => v.visitor_segment === 'high_intent').length;
  const totalDownloads = data.reduce((s, v) => s + v.resume_downloads, 0);
  const totalSubmissions = data.reduce((s, v) => s + v.form_submissions, 0);

  return (
    <div className="grid grid-cols-4 gap-2">
      <div className="p-3 rounded-lg bg-emerald-500/10 text-center">
        <div className="text-lg font-bold text-emerald-400">{converters}</div>
        <div className="text-xs text-muted-foreground">Converters</div>
      </div>
      <div className="p-3 rounded-lg bg-amber-500/10 text-center">
        <div className="text-lg font-bold text-amber-400">{highIntent}</div>
        <div className="text-xs text-muted-foreground">High Intent</div>
      </div>
      <div className="p-3 rounded-lg bg-blue-500/10 text-center">
        <div className="text-lg font-bold text-blue-400">{totalDownloads}</div>
        <div className="text-xs text-muted-foreground">Downloads</div>
      </div>
      <div className="p-3 rounded-lg bg-purple-500/10 text-center">
        <div className="text-lg font-bold text-purple-400">{totalSubmissions}</div>
        <div className="text-xs text-muted-foreground">Contacts</div>
      </div>
    </div>
  );
}
