import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Sparkles, Brain, TrendingUp, Lightbulb } from 'lucide-react';
import {
  staggerContainer,
  sectionHeading,
  sectionSubheading,
} from '@/lib/animations';

const currentItems = [
  {
    icon: TrendingUp,
    title: "MLOps Pipeline Architecture",
    description: "Building end-to-end ML pipelines with feature stores, model versioning, A/B testing, and automated retraining workflows.",
    status: "In Progress",
    progress: 70,
  },
  {
    icon: Brain,
    title: "Time Series Forecasting",
    description: "Implementing transformer-based models for multi-variate time series prediction with uncertainty quantification.",
    status: "Researching",
    progress: 45,
  },
  {
    icon: Lightbulb,
    title: "Model Optimization",
    description: "Exploring quantization, pruning, and distillation techniques for deploying large models on edge devices.",
    status: "Ongoing",
    progress: 60,
  },
];

export function CurrentlyWorkingSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, {
    once: true,
    margin: '-100px',
  });

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        delay: i * 0.15,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
  };

  return (
    <section id="currently-working" className="relative py-24" ref={sectionRef}>
      {/* Animated background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          className="absolute top-1/3 right-0 w-80 h-80 bg-tech-highlight/10 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, -30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-tech-neon/10 rounded-full blur-[80px]"
          animate={{
            scale: [1, 1.3, 1],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
      </div>

      <div className="container relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <motion.h2 variants={sectionHeading} className="section-heading block">
            Currently Working On
          </motion.h2>

          <div className="mt-8 flex justify-center">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tech-glass border border-tech-accent/30"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Sparkles className="text-tech-accent" size={18} />
              </motion.span>
              <span className="text-sm font-medium">Always Learning</span>
            </motion.div>
          </div>

          <motion.p variants={sectionSubheading} className="text-lg text-muted-foreground mt-6">
            What I'm exploring and building right now
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {currentItems.map((item, index) => (
            <motion.div
              key={item.title}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              whileHover={{
                scale: 1.03,
                y: -8,
                transition: { duration: 0.3 },
              }}
              className="glass-card group relative overflow-hidden"
            >
              {/* Animated gradient background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-tech-neon/10 via-transparent to-tech-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                initial={false}
              />

              <div className="relative z-10">
                {/* Icon */}
                <motion.div
                  className="w-14 h-14 rounded-2xl bg-tech-glass flex items-center justify-center mb-4 group-hover:bg-tech-accent/20 transition-colors duration-300"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <item.icon className="text-tech-accent" size={28} />
                </motion.div>

                {/* Status badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tech-accent/10 border border-tech-accent/30 text-xs font-medium mb-3">
                  <motion.span
                    className="w-2 h-2 rounded-full bg-tech-accent"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [1, 0.7, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  {item.status}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold mb-2 group-hover:text-tech-accent transition-colors duration-300">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {item.description}
                </p>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-tech-accent font-medium">{item.progress}%</span>
                  </div>
                  <div className="h-2 bg-tech-glass rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-tech-neon to-tech-accent rounded-full"
                      initial={{ width: 0 }}
                      animate={isInView ? { width: `${item.progress}%` } : { width: 0 }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.2, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
