import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  useDashboardData,
  formatNumber,
  formatPercentage,
  formatDuration,
} from '@/hooks/useDashboardData';
import {
  DashboardSection,
  MetricCard,
  GlassCard,
  TrafficTrendChart,
  DevicePieChart,
  SourceBarChart,
  CountryBarChart,
  VisitorSegmentChart,
  ProjectRankingList,
  SkillDemandChart,
  SectionHealthCards,
  ClientRankingList,
  ConversionFunnel,
  RecommendationHealth,
} from '@/components/dashboard';
import {
  Users,
  TrendingUp,
  TrendingDown,
  Timer,
  Target,
  Download,
  RefreshCw,
  AlertCircle,
  BarChart3,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Dashboard() {
  const { data, isLoading, isUsingMockData } = useDashboardData();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Calculate device totals from daily metrics
  const deviceTotals = useMemo(() => {
    if (!data?.dailyMetrics) return { desktop: 0, mobile: 0, tablet: 0 };
    return data.dailyMetrics.reduce(
      (acc, day) => ({
        desktop: acc.desktop + day.desktop,
        mobile: acc.mobile + day.mobile,
        tablet: acc.tablet + day.tablet,
      }),
      { desktop: 0, mobile: 0, tablet: 0 }
    );
  }, [data?.dailyMetrics]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <RefreshCw size={32} className="text-tech-neon animate-spin" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </motion.div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <p className="text-white text-lg">Failed to load dashboard data</p>
          <Link
            to="/"
            className="text-tech-accent hover:underline mt-4 inline-block"
          >
            Back to Portfolio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-white/5"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container py-5 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-tech-neon via-tech-accent to-tech-highlight bg-clip-text text-transparent">
            Portfolio Analytics
          </h1>

          <div className="flex items-center gap-4">
            {isUsingMockData && (
              <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Sample Data
              </span>
            )}
            <div className="text-xs text-muted-foreground hidden sm:block">
              Updated: {format(new Date(data.updated_at), 'MMM d, yyyy HH:mm')}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="pt-20">
        {/* Overview Section */}
        <DashboardSection
          id="overview"
          title="Overview"
          subtitle="Key metrics from the last 7 days"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <MetricCard
              label="Visitors"
              value={formatNumber(data.overview.total_visitors_7d)}
              icon={Users}
              color="accent"
            />
            <MetricCard
              label="Sessions"
              value={formatNumber(data.overview.total_sessions_7d)}
              icon={BarChart3}
            />
            <MetricCard
              label="Engagement"
              value={formatPercentage(data.overview.engagement_rate)}
              icon={TrendingUp}
              color="success"
            />
            <MetricCard
              label="Bounce Rate"
              value={formatPercentage(data.overview.bounce_rate)}
              icon={TrendingDown}
              color={data.overview.bounce_rate > 30 ? 'warning' : 'default'}
            />
            <MetricCard
              label="Conversions"
              value={data.overview.total_conversions}
              icon={Target}
              color="success"
            />
            <MetricCard
              label="Resume DL"
              value={data.overview.resume_downloads}
              icon={Download}
              color="accent"
            />
          </div>

          {/* Session Duration */}
          <div className="mt-4 p-4 rounded-xl bg-white/5 flex items-center gap-4">
            <Timer size={20} className="text-tech-neon" />
            <div>
              <span className="text-muted-foreground text-sm">Avg Session Duration: </span>
              <span className="text-white font-semibold">
                {formatDuration(data.overview.avg_session_duration_sec)}
              </span>
            </div>
          </div>
        </DashboardSection>

        {/* Traffic & Visitors Section */}
        <DashboardSection
          id="traffic"
          title="Traffic & Visitors"
          subtitle="Where your visitors come from and how they behave"
          className="bg-white/[0.02]"
        >
          {/* Traffic Trend */}
          <GlassCard title="Traffic Trend" subtitle="Daily visitors and sessions" className="mb-6">
            <div className="mt-4">
              <TrafficTrendChart data={data.dailyMetrics} height={280} />
            </div>
          </GlassCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Traffic Sources */}
            <GlassCard title="Traffic Sources" subtitle="Where visitors come from">
              <div className="mt-4">
                <SourceBarChart data={data.trafficSources} height={220} />
              </div>
            </GlassCard>

            {/* Top Countries */}
            <GlassCard title="Top Countries" subtitle="Geographic distribution">
              <div className="mt-4">
                <CountryBarChart data={data.topCountries} height={220} />
              </div>
            </GlassCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Device Distribution */}
            <GlassCard title="Device Distribution" subtitle="Desktop vs Mobile vs Tablet">
              <div className="mt-4">
                <DevicePieChart data={deviceTotals} height={220} />
              </div>
            </GlassCard>

            {/* Visitor Segments */}
            <GlassCard title="Visitor Segments" subtitle="How visitors are classified">
              <div className="mt-4">
                <VisitorSegmentChart data={data.visitorSegments} height={250} />
              </div>
            </GlassCard>
          </div>
        </DashboardSection>

        {/* Project Rankings Section */}
        <DashboardSection
          id="projects"
          title="Project Rankings"
          subtitle="Data-driven project ordering based on visitor engagement"
        >
          <ProjectRankingList data={data.projects} />
        </DashboardSection>

        {/* Skills & Tech Demand Section */}
        <DashboardSection
          id="skills"
          title="Skills & Tech Demand"
          subtitle="Which technologies visitors are interested in"
          className="bg-white/[0.02]"
        >
          <SkillDemandChart data={data.skills} height={320} />
        </DashboardSection>

        {/* Section Health Section */}
        <DashboardSection
          id="sections"
          title="Section Health"
          subtitle="Performance and optimization insights for each section"
        >
          <SectionHealthCards data={data.sections} />
        </DashboardSection>

        {/* Client & Experience Section */}
        <DashboardSection
          id="clients"
          title="Client Work & Industry Interest"
          subtitle="Which client projects and industries attract the most attention"
          className="bg-white/[0.02]"
        >
          <ClientRankingList clients={data.clients} domains={data.domains} />
        </DashboardSection>

        {/* Conversions Section */}
        <DashboardSection
          id="conversions"
          title="Conversions"
          subtitle="Track how visitors convert through CTAs and forms"
        >
          <ConversionFunnel data={data.conversionFunnel} />
        </DashboardSection>

        {/* Recommendations Section */}
        <DashboardSection
          id="recommendations"
          title="Recommendation System"
          subtitle="Performance of the project recommendation engine"
          className="bg-white/[0.02]"
        >
          <RecommendationHealth data={data.recommendations} />
        </DashboardSection>

        {/* Footer */}
        <footer className="py-12 border-t border-white/5">
          <div className="container text-center">
            <p className="text-muted-foreground text-sm">
              Portfolio Analytics Dashboard
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Data refreshed daily at 2:00 PM IST
            </p>
          </div>
        </footer>
      </main>

      {/* Floating background effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 -left-20 w-96 h-96 bg-tech-neon/5 rounded-full blur-[150px]"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-20 w-96 h-96 bg-tech-accent/5 rounded-full blur-[150px]"
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Theme Toggle */}
      <ThemeToggle />
    </div>
  );
}
