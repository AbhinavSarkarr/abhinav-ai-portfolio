import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { portfolioData } from '@/data/portfolioData';
import { trackSkillClick, trackCTAClick } from '@/hooks/useAnalytics';
import {
  staggerContainer,
  staggerItem,
  sectionHeading,
  sectionSubheading,
  scaleIn,
  buttonHover,
  buttonTap,
} from '@/lib/animations';

export function SkillsSection() {
  const { skills } = portfolioData;

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
    <section id="skills" className="relative py-24" ref={sectionRef}>
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
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <motion.h2 variants={sectionHeading} className="section-heading">
            Technical Skills
          </motion.h2>
          <motion.p variants={sectionSubheading} className="text-lg text-muted-foreground mt-6">
            My technical toolkit for building AI and ML solutions
          </motion.p>
        </motion.div>

        {skills && skills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {skills.map((category, index) => (
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
                    className="text-xl font-bold mb-4 flex items-center gap-2"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.span
                      className="w-2 h-2 rounded-full bg-tech-accent"
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
                    className="grid grid-cols-1 gap-2"
                    variants={staggerContainer}
                    initial="hidden"
                    animate={isInView ? 'visible' : 'hidden'}
                  >
                    {category.skills.map((skill, idx) => (
                      <motion.div
                        key={idx}
                        variants={skillItemVariants}
                        className="flex items-center gap-2 group/skill cursor-pointer"
                        whileHover={{ x: 8, transition: { duration: 0.2 } }}
                        onClick={() => trackSkillClick(skill, category.name)}
                      >
                        <motion.div
                          className="w-1.5 h-1.5 rounded-full bg-tech-accent/60 group-hover/skill:bg-tech-accent transition-colors duration-300"
                          whileHover={{ scale: 1.5 }}
                        />
                        <span className="text-sm group-hover/skill:text-tech-accent transition-colors duration-300">
                          {skill}
                        </span>
                      </motion.div>
                    ))}
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

        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mt-16 p-8 glass rounded-2xl max-w-3xl mx-auto text-center relative overflow-hidden"
        >
          {/* Animated border glow */}
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(123, 66, 246, 0.3), transparent)',
              backgroundSize: '200% 100%',
            }}
            animate={{
              backgroundPosition: ['200% 0', '-200% 0'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          <div className="relative z-10">
            <motion.h3
              className="text-2xl font-bold mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <span className="bg-gradient-tech bg-clip-text text-transparent">
                Looking to collaborate?
              </span>
            </motion.h3>
            <motion.p
              className="text-muted-foreground mb-6"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              I'm always interested in challenging AI projects and opportunities to expand my skills.
            </motion.p>
            <motion.a
              href="#contact"
              className="tech-btn inline-block"
              whileHover={buttonHover}
              whileTap={buttonTap}
              onClick={() => trackCTAClick('Get in touch', 'Skills Section')}
            >
              Get in touch
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
