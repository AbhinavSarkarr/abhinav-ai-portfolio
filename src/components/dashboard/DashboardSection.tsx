import { useRef, ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const headingVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

type DashboardSectionProps = {
  id: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

export function DashboardSection({
  id,
  title,
  subtitle,
  children,
  className = '',
}: DashboardSectionProps) {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, {
    once: true,
    margin: '-50px',
  });

  return (
    <section
      id={id}
      ref={sectionRef}
      className={`relative py-12 md:py-16 ${className}`}
    >
      {/* Animated background glow */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 w-64 h-64 bg-tech-neon/5 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="container relative z-10">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {/* Section Header */}
          <motion.div variants={headingVariants} className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {title}
            </h2>
            {subtitle && (
              <p className="text-muted-foreground text-sm md:text-base">
                {subtitle}
              </p>
            )}
            {/* Gradient underline */}
            <div className="mt-3 h-1 w-16 bg-gradient-to-r from-tech-neon to-tech-accent rounded-full" />
          </motion.div>

          {/* Section Content */}
          <motion.div variants={headingVariants}>{children}</motion.div>
        </motion.div>
      </div>
    </section>
  );
}
