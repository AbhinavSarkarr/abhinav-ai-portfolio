import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Database,
  GitBranch,
  BarChart3,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Layers,
  RefreshCw,
  Zap,
  Brain,
} from 'lucide-react';
import {
  staggerContainer,
  sectionHeading,
  sectionSubheading,
} from '@/lib/animations';

const pipelineSteps = [
  {
    id: 1,
    title: 'Event Capture',
    description: 'Google Analytics 4 tracks user interactions, clicks, scroll depth, and engagement patterns in real-time',
    icon: Zap,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 2,
    title: 'Data Lake',
    description: 'Raw events flow into Google BigQuery for storage and SQL-based analysis',
    icon: Database,
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 3,
    title: 'SQL Views',
    description: '27+ layered views transform raw data into sessions, rankings, and insights',
    icon: Layers,
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 4,
    title: 'Materialization',
    description: 'GitHub Actions runs daily to materialize views and compute fresh rankings',
    icon: GitBranch,
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 5,
    title: 'Data Export',
    description: 'Processed data exports to multiple GitHub Gists as JSON for frontend consumption',
    icon: RefreshCw,
    color: 'from-yellow-500 to-orange-500',
  },
  {
    id: 6,
    title: 'Recommendation Engine',
    description: 'Combines data  with feature engineering to suggest relevant projects and case studies',
    icon: Brain,
    color: 'from-pink-500 to-rose-500',
  },
  {
    id: 7,
    title: 'Dynamic UI',
    description: 'Portfolio fetches rankings to reorder content and show personalized recommendations',
    icon: Sparkles,
    color: 'from-tech-neon to-tech-accent',
  },
];

export function DataPipelineSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, {
    once: true,
    margin: '-300px',
  });

  return (
    <section id="data-pipeline" className="relative pt-24 pb-12 overflow-hidden" ref={sectionRef}>
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
          className="max-w-4xl mx-auto text-center mb-6"
        >
          <motion.h2 variants={sectionHeading} className="section-heading">
            Built on Real Analytics
          </motion.h2>

          <motion.p variants={sectionSubheading} className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto text-center">
            This portfolio isn't just a static showcase. It's a living, data-driven system.
            Every interaction feeds into a complete analytics pipeline that dynamically optimizes
            content ordering, powers a recommendation engine, and provides real-time insights
            through a dedicated analytics dashboard.
          </motion.p>
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

          {/* Desktop Flowchart */}
          <div className="hidden lg:block">
            <div className="relative space-y-3">
              {/* First Row - Steps 1-4 */}
              <div className="grid grid-cols-4 gap-4">
                {pipelineSteps.slice(0, 4).map((step, index) => (
                  <motion.div
                    key={step.id}
                    className="relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                  >
                    {/* Connector Arrow */}
                    {index < 3 && (
                      <motion.div
                        className="absolute top-1/2 -right-2 transform -translate-y-1/2 z-10"
                        initial={{ opacity: 0, x: -10 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                        transition={{ duration: 0.3, delay: 0.2 + 0.1 * index }}
                      >
                        <ArrowRight size={16} className="text-tech-accent/50" />
                      </motion.div>
                    )}

                    {/* Step Card */}
                    <motion.div
                      className="glass-card h-full flex flex-col items-center text-center p-4 group"
                      whileHover={{ scale: 1.03, y: -4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-3 shadow-lg`}
                        whileHover={{ rotate: 10, scale: 1.1 }}
                      >
                        <step.icon size={24} className="text-white" />
                      </motion.div>
                      <div className="text-xs font-bold text-tech-accent mb-1">
                        Step {step.id}
                      </div>
                      <h4 className="font-semibold text-sm mb-2 group-hover:text-tech-accent transition-colors">
                        {step.title}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </motion.div>
                  </motion.div>
                ))}
              </div>

              {/* Second Row - Steps 5-7 (centered) */}
              <div className="flex justify-center">
                <div className="grid grid-cols-3 gap-4 w-3/4">
                  {pipelineSteps.slice(4).map((step, index) => (
                    <motion.div
                      key={step.id}
                      className="relative"
                      initial={{ opacity: 0, y: 20 }}
                      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ duration: 0.5, delay: 0.1 * (index + 4) }}
                    >
                      {/* Connector Arrow */}
                      {index < 2 && (
                        <motion.div
                          className="absolute top-1/2 -right-2 transform -translate-y-1/2 z-10"
                          initial={{ opacity: 0, x: -10 }}
                          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                          transition={{ duration: 0.3, delay: 0.2 + 0.1 * (index + 4) }}
                        >
                          <ArrowRight size={16} className="text-tech-accent/50" />
                        </motion.div>
                      )}

                      {/* Step Card */}
                      <motion.div
                        className="glass-card h-full flex flex-col items-center text-center p-4 group"
                        whileHover={{ scale: 1.03, y: -4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-3 shadow-lg`}
                          whileHover={{ rotate: 10, scale: 1.1 }}
                        >
                          <step.icon size={24} className="text-white" />
                        </motion.div>
                        <div className="text-xs font-bold text-tech-accent mb-1">
                          Step {step.id}
                        </div>
                        <h4 className="font-semibold text-sm mb-2 group-hover:text-tech-accent transition-colors">
                          {step.title}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile/Tablet Flowchart */}
          <div className="lg:hidden">
            <div className="space-y-4">
              {pipelineSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  className="relative"
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  {/* Vertical Connector */}
                  {index < pipelineSteps.length - 1 && (
                    <div className="absolute left-6 top-full w-0.5 h-4 bg-gradient-to-b from-tech-accent/50 to-transparent" />
                  )}

                  <motion.div
                    className="glass-card flex items-start gap-4 group"
                    whileHover={{ scale: 1.01, x: 4 }}
                  >
                    <motion.div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0 shadow-lg`}
                      whileHover={{ rotate: 10 }}
                    >
                      <step.icon size={24} className="text-white" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-tech-accent">Step {step.id}</span>
                        <h4 className="font-semibold text-sm group-hover:text-tech-accent transition-colors">
                          {step.title}
                        </h4>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Analytics Dashboard CTA */}
        <motion.div
          className="mt-6 flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <motion.a
            href="https://analytics.abhinavbuilds.in"
            target="_blank"
            rel="noopener noreferrer"
            className="gradient-cta"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <BarChart3 size={20} />
            View Live Analytics Dashboard
            <ExternalLink size={16} />
          </motion.a>
          <p className="text-xs text-tech-accent/70 mt-2 font-mono">
            analytics.abhinavbuilds.in
          </p>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Explore real-time metrics, engagement data, and content performance
          </p>
        </motion.div>
      </div>
    </section>
  );
}
