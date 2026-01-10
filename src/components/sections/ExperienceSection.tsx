import { useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Briefcase, Calendar, Link, Circle, Building2, ArrowRight, Eye, TrendingUp } from 'lucide-react';
import { portfolioData, DescriptionItem } from '@/data/portfolioData';
import {
  staggerContainer,
  sectionHeading,
  sectionSubheading,
} from '@/lib/animations';
import { useAnalyticsContext } from '@/context/AnalyticsContext';
import {
  useAnalyticsRankings,
  sortClientsByEngagement,
  getClientBadge,
} from '@/hooks/useAnalyticsRankings';

export function ExperienceSection() {
  const { experiences } = portfolioData;
  const { clientRankings } = useAnalyticsRankings();
  const navigate = useNavigate();
  const analytics = useAnalyticsContext();

  // Sort clients within each experience by engagement ranking
  const sortedExperiences = useMemo(() => {
    if (clientRankings.size === 0) return experiences;

    return experiences.map((exp) => ({
      ...exp,
      clients: exp.clients
        ? sortClientsByEngagement(exp.clients, clientRankings)
        : exp.clients,
    }));
  }, [experiences, clientRankings]);

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
    <section id="experience" className="relative py-8 sm:py-24" ref={sectionRef}>
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
          className="max-w-3xl mx-auto text-center mb-6 sm:mb-16"
        >
          <motion.h2 variants={sectionHeading} className="section-heading">
            Work Experience
          </motion.h2>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {sortedExperiences.map((exp, index) => (
            <motion.div
              key={exp.id}
              custom={index}
              variants={timelineVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="relative pl-6 sm:pl-8 pb-6 sm:pb-12 last:pb-0"
            >
              {/* Timeline line */}
              <motion.div
                className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-purple-400 dark:from-tech-neon/50 via-purple-200 dark:via-tech-accent/30 to-transparent"
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
                    ? 'bg-purple-500 dark:bg-tech-neon border-purple-500 dark:border-tech-neon'
                    : 'bg-white dark:bg-background border-purple-300 dark:border-tech-neon/50'
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
                  <div className="flex flex-wrap gap-2 sm:gap-4 items-start justify-between mb-3 sm:mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <motion.h3
                          className="text-base sm:text-xl font-bold group-hover:text-tech-accent transition-colors duration-300"
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
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-tech-glass text-sm font-medium border border-purple-200 dark:border-tech-neon/20 text-gray-700 dark:text-foreground"
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

                  {/* Render clients if available, otherwise render description */}
                  {exp.clients && exp.clients.length > 0 ? (
                    <div className="grid gap-3">
                      {exp.clients.map((client, idx) => {
                        const badge = getClientBadge(client.name, clientRankings);

                        return (
                        <motion.div
                          key={client.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                          transition={{ duration: 0.4, delay: index * 0.2 + idx * 0.1 }}
                          className="group/client cursor-pointer"
                          onClick={() => {
                            analytics.trackClientClick(client.id, client.name, client.domain, exp.id);
                            analytics.trackDomainInterest(client.domain, client.id, client.name);
                            navigate(`/client/${exp.id}/${client.id}`);
                          }}
                        >
                          <motion.div
                            className="p-3 sm:p-4 rounded-lg bg-white/50 dark:bg-tech-glass/50 border border-purple-200 dark:border-tech-accent/10 hover:border-purple-400 dark:hover:border-tech-accent/30 transition-all duration-300 shadow-sm"
                            whileHover={{ x: 5 }}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 flex-wrap">
                                  <Building2 size={14} className="text-tech-accent flex-shrink-0 sm:w-4 sm:h-4" />
                                  <h4 className="font-semibold text-sm sm:text-base text-foreground group-hover/client:text-tech-accent transition-colors duration-300">
                                    {client.name}
                                  </h4>
                                  {/* Client Badge - inline with name */}
                                  {badge.type && (
                                    <motion.span
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                                        badge.type === 'popular'
                                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                          : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                      }`}
                                    >
                                      {badge.type === 'popular' ? (
                                        <Eye size={10} />
                                      ) : (
                                        <TrendingUp size={10} />
                                      )}
                                      {badge.label}
                                    </motion.span>
                                  )}
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                                  {client.shortDescription}
                                </p>
                                <span className="inline-block px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-full bg-purple-100 dark:bg-white/5 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-400/30">
                                  {client.domain}
                                </span>
                              </div>
                              <motion.div
                                className="flex-shrink-0 mt-1"
                                whileHover={{ x: 3 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ArrowRight size={18} className="text-muted-foreground group-hover/client:text-tech-accent transition-colors duration-300" />
                              </motion.div>
                            </div>
                          </motion.div>
                        </motion.div>
                      )})}
                    </div>
                  ) : exp.description ? (
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
                  ) : null}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
