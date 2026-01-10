import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { BookOpen, ExternalLink, Clock } from 'lucide-react';
import { portfolioData } from '@/data/portfolioData';
import { trackPublicationClick } from '@/hooks/useAnalytics';
import {
  staggerContainer,
  sectionHeading,
  sectionSubheading,
} from '@/lib/animations';

export function PublicationsSection() {
  const { publications } = portfolioData;

  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, {
    once: true,
    margin: '-100px',
  });

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: i * 0.15,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
  };

  return (
    <section id="publications" className="relative py-24" ref={sectionRef}>
      {/* Animated background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          className="absolute bottom-1/3 right-0 w-64 h-64 bg-tech-neon/10 rounded-full blur-[80px]"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-1/4 left-1/4 w-56 h-56 bg-tech-accent/10 rounded-full blur-[70px]"
          animate={{
            scale: [1, 1.2, 1],
            y: [0, 20, 0],
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
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <motion.h2 variants={sectionHeading} className="section-heading">
            Publications
          </motion.h2>
          <motion.p variants={sectionSubheading} className="text-lg text-muted-foreground mt-6 text-center">
            Research papers and academic contributions
          </motion.p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {publications.map((pub, index) => (
            <motion.div
              key={pub.id}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              whileHover={{
                scale: 1.02,
                y: -5,
                transition: { duration: 0.3 },
              }}
              className="glass-card relative overflow-hidden mb-6 group"
            >
              {/* Animated left border */}
              <motion.div
                className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-tech-neon via-tech-accent to-tech-neon"
                initial={{ scaleY: 0 }}
                animate={isInView ? { scaleY: 1 } : { scaleY: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 + 0.2 }}
                style={{ originY: 0 }}
              />

              {/* Hover gradient */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-tech-neon/5 to-tech-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                initial={false}
              />

              <div className="flex items-start gap-4 relative z-10">
                <motion.div
                  className="p-3 rounded-full bg-tech-glass mt-1"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  animate={{
                    y: [0, -3, 0],
                  }}
                  transition={{
                    y: {
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                  }}
                >
                  <BookOpen className="text-tech-accent" size={24} />
                </motion.div>

                <div className="flex-1">
                  <div className="flex flex-wrap justify-between gap-4 mb-2">
                    <motion.h3
                      className="text-xl font-bold group-hover:text-tech-accent transition-colors duration-300"
                      whileHover={{ x: 3 }}
                    >
                      {pub.title}
                    </motion.h3>
                    <motion.div
                      className="flex items-center gap-1 text-sm text-muted-foreground px-3 py-1 rounded-full bg-tech-glass/50"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Clock size={14} />
                      <span>{pub.date}</span>
                    </motion.div>
                  </div>

                  <p className="text-sm text-tech-accent mb-2">{pub.publisher}</p>
                  <p className="text-muted-foreground mb-4 group-hover:text-foreground/80 transition-colors duration-300 text-left">
                    {pub.description || "A detailed publication in the field of AI and machine learning."}
                  </p>

                  {pub.link && (
                    <motion.a
                      href={pub.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-tech-accent hover:text-tech-neon transition-colors duration-300"
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => trackPublicationClick(pub.title)}
                    >
                      Read Publication
                      <motion.span
                        animate={{ x: [0, 3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <ExternalLink size={14} />
                      </motion.span>
                    </motion.a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
