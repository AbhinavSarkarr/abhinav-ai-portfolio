import { useRef, ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';
import { LucideIcon, HelpCircle } from 'lucide-react';

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
  description?: string; // Extended description for non-technical users
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
  priority?: 'high' | 'medium' | 'low'; // Visual indicator of section importance
};

export function DashboardSection({
  id,
  title,
  subtitle,
  description,
  icon: Icon,
  children,
  className = '',
  priority,
}: DashboardSectionProps) {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, {
    once: true,
    margin: '-50px',
  });

  const priorityColors = {
    high: 'from-emerald-500 to-green-400',
    medium: 'from-tech-neon to-tech-accent',
    low: 'from-gray-400 to-gray-500',
  };

  return (
    <section
      id={id}
      ref={sectionRef}
      className={`relative py-3 md:py-4 ${className}`}
    >
      <div className="container relative z-10">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {/* Section Header */}
          <motion.div variants={headingVariants} className="mb-4">
            <div className="flex items-center gap-3">
              {/* Icon container */}
              {Icon && (
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-tech-neon/20 to-tech-accent/20 flex items-center justify-center">
                  <Icon size={24} className="text-tech-accent" />
                </div>
              )}

              <div className="flex-1">
                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {title}
                </h2>

                {/* Subtitle - technical description */}
                {subtitle && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Section Content */}
          <motion.div variants={headingVariants}>{children}</motion.div>
        </motion.div>
      </div>
    </section>
  );
}
