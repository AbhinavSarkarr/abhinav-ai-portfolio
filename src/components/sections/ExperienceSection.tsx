
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Briefcase, Calendar, Link, Circle } from 'lucide-react';
import { portfolioData, DescriptionItem } from '@/data/portfolioData';

export function ExperienceSection() {
  const { experiences } = portfolioData;

  // For performance optimization
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, {
    once: true,
    margin: "0px 0px -10% 0px"
  });

  return (
    <section id="experience" className="relative py-24" ref={sectionRef}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="section-heading">Work Experience</h2>
          <p className="text-lg text-muted-foreground mt-6">
            My professional journey in AI and machine learning
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {experiences.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="relative pl-8 pb-12 last:pb-0"
            >
              {/* Timeline line */}
              <div className="absolute left-0 top-0 bottom-0 w-px bg-tech-neon/30" />

              {/* Timeline dot */}
              <div className={`absolute left-0 top-1 w-5 h-5 rounded-full -translate-x-1/2 border-2 ${
                exp.current ? 'bg-tech-neon border-tech-neon animate-pulse-soft' : 'bg-background border-tech-neon/50'
              }`} />

              {/* Content */}
              <div className="glass-card">
                <div className="flex flex-wrap gap-4 items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold">{exp.title}</h3>
                      {exp.certificateLink && (
                        <a
                          href={exp.certificateLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-tech-accent hover:text-tech-neon transition-colors"
                          title="View Certificate"
                        >
                          <Link size={16} />
                        </a>
                      )}
                    </div>
                    <p className="text-tech-accent">{exp.company}</p>
                  </div>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-tech-glass text-sm font-medium">
                    <Calendar size={14} />
                    {exp.period}
                    {exp.current && (
                      <span className="w-2 h-2 rounded-full bg-tech-accent animate-pulse-soft" />
                    )}
                  </span>
                </div>

                <ul className="space-y-3">
                  {exp.description.map((item: DescriptionItem, idx: number) => (
                    <li key={idx}>
                      {/* Main bullet point */}
                      <div className="flex items-start gap-2">
                        <Briefcase size={16} className="mt-1 flex-shrink-0 text-tech-accent" />
                        <span className="text-muted-foreground">{item.main}</span>
                      </div>
                      {/* Sub-bullet points */}
                      {item.subPoints && item.subPoints.length > 0 && (
                        <ul className="ml-6 mt-2 space-y-2">
                          {item.subPoints.map((subItem, subIdx) => (
                            <li key={subIdx} className="flex items-start gap-2">
                              <Circle size={8} className="mt-2 flex-shrink-0 text-tech-accent/60" />
                              <span className="text-muted-foreground text-sm">{subItem}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
