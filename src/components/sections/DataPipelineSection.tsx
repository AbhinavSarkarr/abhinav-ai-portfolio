import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Database,
  GitBranch,
  BarChart3,
  Sparkles,
  ArrowRight,
  ArrowDown,
  ExternalLink,
  Layers,
  RefreshCw,
  Zap,
  TrendingUp,
  Server,
  FileJson,
  CloudCog,
} from 'lucide-react';
import {
  staggerContainer,
  sectionHeading,
} from '@/lib/animations';
import { trackAnalyticsDashboardClick } from '@/hooks/useAnalytics';

const pipelineSteps = [
  {
    id: 1,
    title: 'Event Capture',
    description: 'GA4 tracks 50+ event types with real-time engagement scoring',
    icon: Zap,
    color: 'from-blue-500 to-cyan-500',
    phase: 'collection',
  },
  {
    id: 2,
    title: 'Raw Data Lake',
    description: 'Events stream into BigQuery for durable, queryable storage',
    icon: Database,
    color: 'from-cyan-500 to-teal-500',
    phase: 'collection',
  },
  {
    id: 3,
    title: 'Base Views',
    description: 'Transforms raw events into sessions, pages & interactions',
    icon: Layers,
    color: 'from-purple-500 to-violet-500',
    phase: 'processing',
  },
  {
    id: 4,
    title: 'Aggregations',
    description: 'Daily metrics, traffic stats & conversion funnels aggregated',
    icon: BarChart3,
    color: 'from-orange-500 to-amber-500',
    phase: 'processing',
  },
  {
    id: 5,
    title: 'Rankings Layer',
    description: 'Derives project rankings, visitor insights & tech demand',
    icon: TrendingUp,
    color: 'from-red-500 to-pink-500',
    phase: 'processing',
  },
  {
    id: 6,
    title: 'Materialization',
    description: 'GitHub Actions materializes 31 tables daily via scheduled workflows',
    icon: GitBranch,
    color: 'from-green-500 to-emerald-500',
    phase: 'distribution',
  },
  {
    id: 7,
    title: 'Supabase Sync',
    description: 'Incremental sync with materialized tables',
    icon: CloudCog,
    color: 'from-emerald-500 to-teal-500',
    phase: 'distribution',
  },
  {
    id: 8,
    title: 'FastAPI Backend',
    description: '15 parallel workers serve dashboard data with low latency',
    icon: Server,
    color: 'from-indigo-500 to-purple-500',
    phase: 'serving',
  },
  {
    id: 9,
    title: 'Gist Caching',
    description: 'Pre-computed data for multiple common time spans',
    icon: FileJson,
    color: 'from-yellow-500 to-orange-500',
    phase: 'serving',
  },
  {
    id: 10,
    title: 'Live Dashboard',
    description: 'Frontend with in-memory caching for instant access',
    icon: Sparkles,
    color: 'from-tech-neon to-tech-accent',
    phase: 'serving',
  },
];

export function DataPipelineSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, {
    once: true,
    margin: '-300px',
  });

  return (
    <section id="data-pipeline" className="relative py-8 sm:py-24 overflow-hidden" ref={sectionRef}>
      {/* Animated background */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute top-1/3 left-1/4 w-96 h-96 bg-tech-neon/5 rounded-full blur-[150px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-tech-accent/5 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
      </div>

      <div className="container relative z-10">
        {/* Section Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="max-w-4xl mx-auto text-center mb-6 sm:mb-16"
        >
          <motion.h2 variants={sectionHeading} className="section-heading">
            How This Portfolio Is Different
          </motion.h2>
        </motion.div>

        {/* Pipeline Flowchart */}
        <motion.div
          className="relative"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="text-xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-tech-neon to-tech-accent bg-clip-text text-transparent">
              The Data Pipeline
            </span>
          </h3>

          {/* Desktop Flowchart - 5+5 Grid Layout */}
          <div className="hidden lg:block">
            <div className="relative space-y-4">
              {/* First Row - Steps 1-5 (Collection & Processing) */}
              <div className="grid grid-cols-5 gap-3">
                {pipelineSteps.slice(0, 5).map((step, index) => (
                  <motion.div
                    key={step.id}
                    className="relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.5, delay: 0.08 * index }}
                  >
                    {/* Connector Arrow */}
                    {index < 4 && (
                      <motion.div
                        className="absolute top-1/2 -right-1.5 transform -translate-y-1/2 z-10"
                        initial={{ opacity: 0, x: -10 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                        transition={{ duration: 0.3, delay: 0.15 + 0.08 * index }}
                      >
                        <ArrowRight size={14} className="text-tech-accent/60" />
                      </motion.div>
                    )}

                    {/* Step Card */}
                    <motion.div
                      className="glass-card h-full flex flex-col items-center text-center p-3 group"
                      whileHover={{ scale: 1.03, y: -4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-2 shadow-lg`}
                        whileHover={{ rotate: 10, scale: 1.1 }}
                      >
                        <step.icon size={20} className="text-white" />
                      </motion.div>
                      <div className="text-[10px] font-bold text-tech-accent mb-0.5">
                        Step {step.id}
                      </div>
                      <h4 className="font-semibold text-xs mb-1.5 group-hover:text-tech-accent transition-colors leading-tight">
                        {step.title}
                      </h4>
                      <p className="text-[10px] text-muted-foreground leading-relaxed text-center">
                        {step.description}
                      </p>
                    </motion.div>
                  </motion.div>
                ))}
              </div>

              {/* Row Connector - Arrow from Step 5 down to Step 6 */}
              <div className="flex justify-end pr-[9%]">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="flex items-center gap-1"
                >
                  <ArrowDown size={16} className="text-tech-accent/60" />
                </motion.div>
              </div>

              {/* Second Row - Steps 6-10 (Distribution & Serving) - Reversed for right-to-left flow */}
              <div className="grid grid-cols-5 gap-3">
                {pipelineSteps.slice(5).reverse().map((step, index) => {
                  const originalIndex = 4 - index; // Map back to original order for animation timing
                  return (
                    <motion.div
                      key={step.id}
                      className="relative"
                      initial={{ opacity: 0, y: 20 }}
                      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ duration: 0.5, delay: 0.08 * (originalIndex + 5) }}
                    >
                      {/* Connector Arrow - Points left (except for step 6 which is rightmost) */}
                      {index > 0 && (
                        <motion.div
                          className="absolute top-1/2 -right-1.5 transform -translate-y-1/2 z-10 rotate-180"
                          initial={{ opacity: 0, x: 10 }}
                          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }}
                          transition={{ duration: 0.3, delay: 0.15 + 0.08 * (originalIndex + 5) }}
                        >
                          <ArrowRight size={14} className="text-tech-accent/60" />
                        </motion.div>
                      )}

                      {/* Step Card */}
                      <motion.div
                        className="glass-card h-full flex flex-col items-center text-center p-3 group"
                        whileHover={{ scale: 1.03, y: -4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-2 shadow-lg`}
                          whileHover={{ rotate: 10, scale: 1.1 }}
                        >
                          <step.icon size={20} className="text-white" />
                        </motion.div>
                        <div className="text-[10px] font-bold text-tech-accent mb-0.5">
                          Step {step.id}
                        </div>
                        <h4 className="font-semibold text-xs mb-1.5 group-hover:text-tech-accent transition-colors leading-tight">
                          {step.title}
                        </h4>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mobile/Tablet Flowchart */}
          <div className="lg:hidden">
            <div className="relative">
              {/* Vertical flow line */}
              <div className="absolute left-[23px] sm:left-[27px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-tech-accent/30 via-tech-neon/20 to-tech-accent/30 rounded-full" />

              <div className="space-y-2">
                {pipelineSteps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    className="relative"
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, delay: 0.05 * index }}
                  >
                    <motion.div
                      className="glass-card flex items-center gap-3 p-2.5 sm:p-3 group relative"
                      whileHover={{ scale: 1.01, x: 4 }}
                    >
                      {/* Icon with glow effect */}
                      <motion.div
                        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0 shadow-lg relative z-10`}
                        whileHover={{ rotate: 10 }}
                      >
                        <step.icon size={20} className="text-white" />
                        {/* Subtle glow */}
                        <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${step.color} opacity-40 blur-md -z-10`} />
                      </motion.div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-tech-accent/80 bg-tech-accent/10 px-1.5 py-0.5 rounded">
                            {step.id}
                          </span>
                          <h4 className="font-semibold text-sm group-hover:text-tech-accent transition-colors">
                            {step.title}
                          </h4>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                          {step.description}
                        </p>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Analytics Dashboard CTA */}
        <motion.div
          className="mt-8 flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          <motion.a
            href="https://analytics.abhinavbuilds.in"
            target="_blank"
            rel="noopener noreferrer"
            className="gradient-cta"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={trackAnalyticsDashboardClick}
          >
            <BarChart3 size={20} />
            View Live Analytics Dashboard
            <ExternalLink size={16} />
          </motion.a>
          <p className="text-xs text-tech-accent/70 mt-2 font-mono">
            analytics.abhinavbuilds.in
          </p>
          <p className="text-sm text-muted-foreground mt-2 text-center max-w-md">
            Explore real-time metrics, engagement data, and content performance
          </p>
        </motion.div>
      </div>
    </section>
  );
}
