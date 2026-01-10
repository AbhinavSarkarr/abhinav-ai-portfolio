import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useDashboardData } from '@/hooks/useDashboardData';
import {
  DashboardSection,
  GlassCard,
  TrafficTrendChart,
  CountryBarChart,
  VisitorSegmentChart,
  SkillDemandChart,
  ConversionFunnel,
  RecommendationHealth,
  EngagementTrendChart,
  SessionDurationChart,
  DeviceTrendChart,
  TrafficSourceAnalysis,
  SectionRadarChart,
  ProjectScatterPlot,
  SkillsCategoryChart,
  DomainInterestChart,
  ExperienceInterestChart,
  KeyInsightsPanel,
  EnhancedOverview,
} from '@/components/dashboard';
import {
  RefreshCw,
  AlertCircle,
  BarChart3,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { data, isLoading, isUsingMockData } = useDashboardData();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
          <p className="text-foreground text-lg">Failed to load dashboard data</p>
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
    <div className="min-h-screen bg-background relative">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 -left-32 w-96 h-96 bg-tech-neon/10 dark:bg-tech-neon/5 rounded-full blur-[120px]"
          animate={{
            x: [0, 60, 0],
            y: [0, 40, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/3 -right-32 w-96 h-96 bg-tech-accent/10 dark:bg-tech-accent/5 rounded-full blur-[120px]"
          animate={{
            x: [0, -60, 0],
            y: [0, -40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-2/3 left-1/3 w-64 h-64 bg-tech-highlight/10 dark:bg-tech-highlight/5 rounded-full blur-[100px]"
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Fixed Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-white/10 dark:border-white/5"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-tech-neon to-tech-accent flex items-center justify-center shadow-lg shadow-tech-neon/20 flex-shrink-0">
              <BarChart3 size={16} className="text-white sm:hidden" />
              <BarChart3 size={20} className="text-white hidden sm:block" />
            </div>
            <h1 className="text-base sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-tech-neon via-tech-accent to-tech-highlight bg-clip-text text-transparent">
              Portfolio Analytics
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {isUsingMockData && (
              <span className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium border border-amber-500/20">
                Sample
              </span>
            )}
            <div className="text-[10px] sm:text-xs text-muted-foreground hidden md:block px-3 py-1.5 rounded-full bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10">
              Updated: {format(new Date(data.updated_at), 'MMM d, yyyy HH:mm')}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="pt-16 sm:pt-20 md:pt-24 relative z-10">
        {/* Key Insights Section */}
        <DashboardSection
          id="insights"
          title="Key Insights"
          subtitle="Auto-generated insights based on your analytics data"
        >
          <KeyInsightsPanel data={data} />
        </DashboardSection>

        {/* Enhanced Overview Section */}
        <DashboardSection
          id="overview"
          title="Overview"
          subtitle="Key metrics from the last 7 days with trend analysis"
        >
          <EnhancedOverview data={data} />
        </DashboardSection>

        {/* Traffic & Visitors Section */}
        <DashboardSection
          id="traffic"
          title="Traffic & Visitors"
          subtitle="Comprehensive traffic analysis and visitor behavior"
        >
          <GlassCard title="Traffic Trend" subtitle="Daily visitors and sessions over time" className="mb-6">
            <div className="mt-4">
              <TrafficTrendChart data={data.dailyMetrics} height={300} />
            </div>
          </GlassCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <GlassCard title="Engagement vs Bounce Rate" subtitle="Daily quality metrics trend">
              <div className="mt-4">
                <EngagementTrendChart data={data.dailyMetrics} height={280} />
              </div>
            </GlassCard>

            <GlassCard title="Session Duration Analysis" subtitle="Time spent on site over time">
              <div className="mt-4">
                <SessionDurationChart data={data.dailyMetrics} height={280} />
              </div>
            </GlassCard>
          </div>

          <GlassCard title="Traffic Source Analysis" subtitle="Quality matrix and source breakdown" className="mb-6">
            <div className="mt-4">
              <TrafficSourceAnalysis data={data.trafficSources} height={300} />
            </div>
          </GlassCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <GlassCard title="Geographic Distribution" subtitle="Visitors by country">
              <div className="mt-4">
                <CountryBarChart data={data.topCountries} height={250} />
              </div>
            </GlassCard>

            <GlassCard title="Visitor Segments" subtitle="Audience classification breakdown">
              <div className="mt-4">
                <VisitorSegmentChart data={data.visitorSegments} height={280} />
              </div>
            </GlassCard>
          </div>

          <GlassCard title="Device Usage Trends" subtitle="Desktop vs Mobile vs Tablet over time">
            <div className="mt-4">
              <DeviceTrendChart data={data.dailyMetrics} height={280} />
            </div>
          </GlassCard>
        </DashboardSection>

        {/* Project Rankings Section */}
        <DashboardSection
          id="projects"
          title="Project Performance"
          subtitle="Data-driven project analysis with engagement metrics"
        >
          <ProjectScatterPlot data={data.projects} height={350} />
        </DashboardSection>

        {/* Skills & Tech Demand Section */}
        <DashboardSection
          id="skills"
          title="Skills & Tech Demand"
          subtitle="Comprehensive skills analysis by category and demand tier"
        >
          <GlassCard title="Skills Overview" subtitle="Demand ranking and click distribution" className="mb-6">
            <div className="mt-4">
              <SkillDemandChart data={data.skills} height={320} />
            </div>
          </GlassCard>

          <GlassCard title="Skills by Category" subtitle="Category breakdown and tier analysis">
            <div className="mt-4">
              <SkillsCategoryChart data={data.skills} height={300} />
            </div>
          </GlassCard>
        </DashboardSection>

        {/* Section Health Section */}
        <DashboardSection
          id="sections"
          title="Section Performance"
          subtitle="Health scores, engagement metrics, and optimization insights"
        >
          <SectionRadarChart data={data.sections} height={350} />
        </DashboardSection>

        {/* Domain & Experience Interest */}
        <DashboardSection
          id="interest"
          title="Industry & Experience Interest"
          subtitle="What domains and experiences attract the most attention"
        >
          <div className="space-y-6">
            <GlassCard title="Domain Interest Analysis" subtitle="Industry interest scores and recommendations">
              <div className="mt-4">
                <DomainInterestChart data={data.domains} height={280} />
              </div>
            </GlassCard>

            {data.experiences && data.experiences.length > 0 && (
              <GlassCard title="Experience Interest" subtitle="Role and company engagement ranking">
                <div className="mt-4">
                  <ExperienceInterestChart data={data.experiences} height={280} />
                </div>
              </GlassCard>
            )}
          </div>
        </DashboardSection>

        {/* Conversions Section */}
        <DashboardSection
          id="conversions"
          title="Conversion Funnel"
          subtitle="Track visitor journey from awareness to action"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard title="Conversion Journey" subtitle="Step-by-step funnel analysis">
              <div className="mt-4">
                <ConversionFunnel data={data.conversionFunnel} />
              </div>
            </GlassCard>

            <GlassCard title="Recommendation Engine" subtitle="System health and performance metrics">
              <div className="mt-4">
                <RecommendationHealth data={data.recommendations} />
              </div>
            </GlassCard>
          </div>
        </DashboardSection>

        {/* Footer */}
        <footer className="py-12 border-t border-white/10 dark:border-white/5 mt-8">
          <div className="container text-center">
            <p className="text-muted-foreground text-sm font-medium">
              Portfolio Analytics Dashboard
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Data refreshed daily at 2:00 PM IST
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-tech-accent hover:text-tech-neon transition-colors"
            >
              Back to Portfolio
            </Link>
          </div>
        </footer>
      </main>

      {/* Theme Toggle */}
      <ThemeToggle />
    </div>
  );
}
