import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Github, GitBranch, Star, GitFork } from 'lucide-react';
import {
  staggerContainer,
  sectionHeading,
  sectionSubheading,
} from '@/lib/animations';

export function GitHubSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, {
    once: true,
    margin: '-100px',
  });

  return (
    <section id="github" className="relative py-24" ref={sectionRef}>
      {/* Animated background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-tech-accent/10 rounded-full blur-[80px]"
          animate={{
            scale: [1, 1.3, 1],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="container relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="max-w-3xl mx-auto text-center mb-12"
        >
          <motion.h2 variants={sectionHeading} className="section-heading">
            GitHub Activity
          </motion.h2>
          <motion.p variants={sectionSubheading} className="text-lg text-muted-foreground mt-6 text-center">
            My open source contributions and coding activity
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          {/* GitHub Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              className="glass-card text-center group"
              whileHover={{ scale: 1.03, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="w-12 h-12 mx-auto mb-3 rounded-full bg-tech-glass flex items-center justify-center group-hover:bg-tech-accent/20 transition-colors duration-300"
                whileHover={{ rotate: 10 }}
              >
                <GitBranch className="text-tech-accent" size={24} />
              </motion.div>
              <p className="text-3xl font-bold text-tech-accent">50+</p>
              <p className="text-sm text-muted-foreground">Repositories</p>
            </motion.div>

            <motion.div
              className="glass-card text-center group"
              whileHover={{ scale: 1.03, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="w-12 h-12 mx-auto mb-3 rounded-full bg-tech-glass flex items-center justify-center group-hover:bg-tech-accent/20 transition-colors duration-300"
                whileHover={{ rotate: 10 }}
              >
                <Star className="text-tech-accent" size={24} />
              </motion.div>
              <p className="text-3xl font-bold text-tech-accent">100+</p>
              <p className="text-sm text-muted-foreground">Stars Earned</p>
            </motion.div>

            <motion.div
              className="glass-card text-center group"
              whileHover={{ scale: 1.03, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="w-12 h-12 mx-auto mb-3 rounded-full bg-tech-glass flex items-center justify-center group-hover:bg-tech-accent/20 transition-colors duration-300"
                whileHover={{ rotate: 10 }}
              >
                <GitFork className="text-tech-accent" size={24} />
              </motion.div>
              <p className="text-3xl font-bold text-tech-accent">30+</p>
              <p className="text-sm text-muted-foreground">Contributions</p>
            </motion.div>
          </div>

          {/* GitHub Contribution Graph */}
          <motion.div
            className="glass-card overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Github className="text-tech-accent" size={24} />
              <h3 className="font-semibold">Contribution Graph</h3>
            </div>
            <div className="bg-[#0d1117] rounded-lg p-4 overflow-x-auto">
              <img
                src="https://ghchart.rshah.org/7B42F6/AbhinavSarkarr"
                alt="GitHub Contribution Graph"
                className="w-full min-w-[700px]"
                loading="lazy"
              />
            </div>
            <div className="mt-4 flex justify-center">
              <motion.a
                href="https://github.com/AbhinavSarkarr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-tech-glass border border-tech-accent/30 text-sm font-medium hover:border-tech-accent hover:bg-tech-accent/10 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Github size={18} />
                View GitHub Profile
              </motion.a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
