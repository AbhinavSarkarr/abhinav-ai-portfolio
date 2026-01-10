import { useRef, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { portfolioData } from '@/data/portfolioData';
import { trackSkillClick } from '@/hooks/useAnalytics';
import {
  useAnalyticsRankings,
  sortSkillsByRanking,
  isHighDemandSkill,
  getSkillDemandTier,
} from '@/hooks/useAnalyticsRankings';
import {
  staggerContainer,
  staggerItem,
  sectionHeading,
  sectionSubheading,
} from '@/lib/animations';

export function SkillsSection() {
  const { skills } = portfolioData;
  const { skillRankings } = useAnalyticsRankings();

  // Sort skills within each category by demand ranking
  const sortedSkills = useMemo(() => {
    if (!skills || skillRankings.size === 0) return skills;

    return skills.map((category) => ({
      ...category,
      skills: sortSkillsByRanking(category.skills, skillRankings),
    }));
  }, [skills, skillRankings]);

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
        delay: i * 0.1,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
  };

  const skillItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  return (
    <section id="skills" className="relative py-8 sm:py-24" ref={sectionRef}>
      {/* Animated background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          className="absolute top-1/3 right-1/4 w-72 h-72 bg-tech-neon/10 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-tech-accent/10 rounded-full blur-[80px]"
          animate={{
            scale: [1, 1.3, 1],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
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
            Technical Skills
          </motion.h2>
        </motion.div>

        {sortedSkills && sortedSkills.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8">
            {sortedSkills.map((category, index) => (
              <motion.div
                key={category.id}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
                whileHover={{
                  scale: 1.03,
                  y: -5,
                  transition: { duration: 0.3 },
                }}
                className="glass-card group relative overflow-hidden"
              >
                {/* Hover gradient effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-tech-neon/10 to-tech-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  initial={false}
                />

                <div className="relative z-10">
                  <motion.h3
                    className="text-sm sm:text-xl font-bold mb-2 sm:mb-4 flex items-center gap-1.5 sm:gap-2"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.span
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-tech-accent"
                      animate={{
                        scale: [1, 1.3, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: index * 0.2,
                      }}
                    />
                    {category.name}
                  </motion.h3>

                  <motion.div
                    className="grid grid-cols-1 gap-1.5 sm:gap-2"
                    variants={staggerContainer}
                    initial="hidden"
                    animate={isInView ? 'visible' : 'hidden'}
                  >
                    {category.skills.map((skill, idx) => {
                      const highDemand = isHighDemandSkill(skill, skillRankings);
                      const demandTier = getSkillDemandTier(skill, skillRankings);

                      return (
                        <motion.div
                          key={idx}
                          variants={skillItemVariants}
                          className={`flex items-center gap-1.5 sm:gap-2 group/skill cursor-pointer ${
                            highDemand ? 'relative' : ''
                          }`}
                          whileHover={{ x: 8, transition: { duration: 0.2 } }}
                          onClick={() => trackSkillClick(skill, category.name)}
                        >
                          <motion.div
                            className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full transition-colors duration-300 flex-shrink-0 ${
                              highDemand
                                ? 'bg-green-400 group-hover/skill:bg-green-300'
                                : 'bg-tech-accent/60 group-hover/skill:bg-tech-accent'
                            }`}
                            whileHover={{ scale: 1.5 }}
                            animate={
                              highDemand
                                ? {
                                    scale: [1, 1.3, 1],
                                    opacity: [1, 0.8, 1],
                                  }
                                : {}
                            }
                            transition={
                              highDemand
                                ? {
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                  }
                                : {}
                            }
                          />
                          <span
                            className={`text-xs sm:text-sm transition-colors duration-300 ${
                              highDemand
                                ? 'text-green-400 font-medium group-hover/skill:text-green-300'
                                : 'group-hover/skill:text-tech-accent'
                            }`}
                          >
                            {skill}
                          </span>
                          {/* Different badges based on demand tier - hidden on mobile */}
                          {demandTier === 'high_demand' && (
                            <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                              Hot
                            </span>
                          )}
                          {demandTier === 'moderate_demand' && (
                            <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                              Trending
                            </span>
                          )}
                          {demandTier === 'emerging' && (
                            <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                              Rising
                            </span>
                          )}
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass-card text-center py-8">
            <p className="text-muted-foreground">No skills added yet.</p>
          </div>
        )}

      </div>
    </section>
  );
}
