import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Briefcase, Calendar, Link, Circle } from 'lucide-react';
import { portfolioData, DescriptionItem } from '@/data/portfolioData';
import {
  staggerContainer,
  sectionHeading,
  sectionSubheading,
} from '@/lib/animations';

export function ExperienceSection() {
  const { experiences } = portfolioData;

  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, {
    once: true,
    margin: '-100px',
  });

  const timelineVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        delay: i * 0.2,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
  };

  const dotVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (i: number) => ({
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.4,
        delay: i * 0.2 + 0.1,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
  };

  return (
    <section id="experience" className="relative py-24" ref={sectionRef}>
      {/* Animated background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-80 h-80 bg-tech-neon/10 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 45, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-0 w-72 h-72 bg-tech-accent/10 rounded-full blur-[80px]"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 3,
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
          <motion.h2 variants={sectionHeading} className="section-heading">
            Work Experience
          </motion.h2>
          <motion.p variants={sectionSubheading} className="text-lg text-muted-foreground mt-6">
            My professional journey in AI and machine learning
          </motion.p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {experiences.map((exp, index) => (
            <motion.div
              key={exp.id}
              custom={index}
              variants={timelineVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="relative pl-8 pb-12 last:pb-0"
            >
              {/* Timeline line */}
              <motion.div
                className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-tech-neon/50 via-tech-accent/30 to-transparent"
                initial={{ scaleY: 0 }}
                animate={isInView ? { scaleY: 1 } : { scaleY: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2, ease: 'easeOut' }}
                style={{ originY: 0 }}
              />

              {/* Timeline dot */}
              <motion.div
                custom={index}
                variants={dotVariants}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
                className={`absolute left-0 top-1 w-5 h-5 rounded-full -translate-x-1/2 border-2 ${
                  exp.current
                    ? 'bg-tech-neon border-tech-neon'
                    : 'bg-background border-tech-neon/50'
                }`}
              >
                {exp.current && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-tech-neon"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [1, 0, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}
              </motion.div>

              {/* Content */}
              <motion.div
                className="glass-card group relative overflow-hidden"
                whileHover={{
                  scale: 1.01,
                  y: -3,
                  transition: { duration: 0.3 },
                }}
              >
                {/* Hover gradient */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-tech-neon/5 to-tech-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  initial={false}
                />

                <div className="relative z-10">
                  <div className="flex flex-wrap gap-4 items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <motion.h3
                          className="text-xl font-bold group-hover:text-tech-accent transition-colors duration-300"
                          whileHover={{ x: 3 }}
                        >
                          {exp.title}
                        </motion.h3>
                        {exp.certificateLink && (
                          <motion.a
                            href={exp.certificateLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-tech-accent hover:text-tech-neon transition-colors"
                            title="View Certificate"
                            whileHover={{ scale: 1.2, rotate: 10 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Link size={16} />
                          </motion.a>
                        )}
                      </div>
                      <p className="text-tech-accent">{exp.company}</p>
                    </div>
                    <motion.span
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-tech-glass text-sm font-medium border border-tech-neon/20"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Calendar size={14} />
                      {exp.period}
                      {exp.current && (
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
                      )}
                    </motion.span>
                  </div>

                  <ul className="space-y-3">
                    {exp.description.map((item: DescriptionItem, idx: number) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                        transition={{ duration: 0.4, delay: index * 0.2 + idx * 0.1 }}
                      >
                        {/* Main bullet point */}
                        <motion.div
                          className="flex items-start gap-2 group/item"
                          whileHover={{ x: 5, transition: { duration: 0.2 } }}
                        >
                          <motion.div
                            whileHover={{ scale: 1.2, rotate: 10 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Briefcase size={16} className="mt-1 flex-shrink-0 text-tech-accent" />
                          </motion.div>
                          <span className="text-muted-foreground group-hover/item:text-foreground transition-colors duration-300">
                            {item.main}
                          </span>
                        </motion.div>
                        {/* Sub-bullet points */}
                        {item.subPoints && item.subPoints.length > 0 && (
                          <ul className="ml-6 mt-2 space-y-2">
                            {item.subPoints.map((subItem, subIdx) => (
                              <motion.li
                                key={subIdx}
                                className="flex items-start gap-2 group/subitem"
                                initial={{ opacity: 0, x: -5 }}
                                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -5 }}
                                transition={{ duration: 0.3, delay: index * 0.2 + idx * 0.1 + subIdx * 0.05 }}
                                whileHover={{ x: 5, transition: { duration: 0.2 } }}
                              >
                                <Circle size={8} className="mt-2 flex-shrink-0 text-tech-accent/60 group-hover/subitem:text-tech-accent transition-colors duration-300" />
                                <span className="text-muted-foreground text-sm group-hover/subitem:text-foreground transition-colors duration-300">
                                  {subItem}
                                </span>
                              </motion.li>
                            ))}
                          </ul>
                        )}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
