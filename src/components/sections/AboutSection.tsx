import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Award, GraduationCap, Mail, Phone, MapPin } from 'lucide-react';
import { portfolioData } from '@/data/portfolioData';
import {
  fadeInUp,
  fadeInLeft,
  fadeInRight,
  staggerContainer,
  staggerItem,
  scaleIn,
  sectionHeading,
  sectionSubheading,
} from '@/lib/animations';

export function AboutSection() {
  const { hero, certifications } = portfolioData;

  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, {
    once: true,
    margin: '-300px',
  });

  return (
    <section id="about" className="relative py-8 sm:py-24" ref={sectionRef}>
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 right-0 w-64 h-64 bg-tech-neon/10 rounded-full blur-[80px]"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-0 w-48 h-48 bg-tech-accent/10 rounded-full blur-[60px]"
          animate={{
            scale: [1, 1.3, 1],
            y: [0, -20, 0],
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
          className="max-w-3xl mx-auto text-center mb-6 sm:mb-16"
        >
          <motion.h2 variants={sectionHeading} className="section-heading">
            About Me
          </motion.h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 items-center">
          <motion.div
            variants={fadeInLeft}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="space-y-3 sm:space-y-6"
          >
            {/* Name - hidden on mobile since it's in hero */}
            <motion.h3
              className="hidden sm:block text-3xl font-bold"
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {hero.name}
            </motion.h3>
            <motion.p
              className="text-sm sm:text-base text-muted-foreground leading-relaxed text-center sm:text-left"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {hero.description}
            </motion.p>

            {/* Mobile: Compact inline contact info */}
            <motion.div
              className="flex flex-wrap justify-center gap-2 pt-2 sm:hidden"
              variants={staggerContainer}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
            >
              <motion.a
                href="mailto:abhinavsarkar53@gmail.com"
                variants={staggerItem}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-tech-glass/50 border border-tech-accent/20 text-xs hover:border-tech-accent/50 transition-colors"
              >
                <Mail size={12} className="text-tech-accent" />
                <span className="text-muted-foreground">Email</span>
              </motion.a>
              <motion.a
                href="tel:+919812047920"
                variants={staggerItem}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-tech-glass/50 border border-tech-accent/20 text-xs hover:border-tech-accent/50 transition-colors"
              >
                <Phone size={12} className="text-tech-accent" />
                <span className="text-muted-foreground">Call</span>
              </motion.a>
              <motion.span
                variants={staggerItem}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-tech-glass/50 border border-tech-accent/20 text-xs"
              >
                <MapPin size={12} className="text-tech-accent" />
                <span className="text-muted-foreground">Gurugram</span>
              </motion.span>
            </motion.div>

            {/* Desktop: Card-based contact info */}
            <motion.div
              className="hidden sm:grid grid-cols-2 gap-4 pt-4"
              variants={staggerContainer}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
            >
              <motion.div
                variants={staggerItem}
                whileHover={{ scale: 1.02, y: -2 }}
                className="glass-card group cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-2">
                  <motion.div
                    className="p-2 rounded-full bg-tech-glass group-hover:bg-tech-accent/20 transition-colors duration-300"
                    whileHover={{ rotate: 10 }}
                  >
                    <Mail size={18} className="text-tech-accent" />
                  </motion.div>
                  <h4 className="font-semibold">Email</h4>
                </div>
                <a
                  href="mailto:abhinavsarkar53@gmail.com"
                  className="text-sm text-muted-foreground hover:text-tech-accent transition-colors duration-300"
                >
                  abhinavsarkar53@gmail.com
                </a>
              </motion.div>

              <motion.div
                variants={staggerItem}
                whileHover={{ scale: 1.02, y: -2 }}
                className="glass-card group cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-2">
                  <motion.div
                    className="p-2 rounded-full bg-tech-glass group-hover:bg-tech-accent/20 transition-colors duration-300"
                    whileHover={{ rotate: 10 }}
                  >
                    <Phone size={18} className="text-tech-accent" />
                  </motion.div>
                  <h4 className="font-semibold">Phone</h4>
                </div>
                <a
                  href="tel:+919812047920"
                  className="text-sm text-muted-foreground hover:text-tech-accent transition-colors duration-300"
                >
                  +91-9812047920
                </a>
              </motion.div>

              <motion.div
                variants={staggerItem}
                whileHover={{ scale: 1.02, y: -2 }}
                className="glass-card group cursor-pointer col-span-2"
              >
                <div className="flex items-center gap-3 mb-2">
                  <motion.div
                    className="p-2 rounded-full bg-tech-glass group-hover:bg-tech-accent/20 transition-colors duration-300"
                    whileHover={{ rotate: 10 }}
                  >
                    <MapPin size={18} className="text-tech-accent" />
                  </motion.div>
                  <h4 className="font-semibold">Location</h4>
                </div>
                <span className="text-sm text-muted-foreground">
                  Gurugram, Haryana, India
                </span>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            variants={fadeInRight}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="space-y-3 sm:space-y-8"
          >
            {/* Mobile: Simple highlight badges */}
            <div className="sm:hidden flex flex-wrap justify-center gap-3 pt-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-tech-glass/30 border border-white/10">
                <GraduationCap size={14} className="text-tech-accent" />
                <span className="text-xs text-muted-foreground">B.Tech AI & ML</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-tech-glass/30 border border-white/10">
                <Award size={14} className="text-tech-accent" />
                <span className="text-xs text-muted-foreground">{certifications.length}+ Certifications</span>
              </div>
            </div>

            {/* Desktop: Full cards with timeline */}
            <motion.div
              className="hidden sm:block glass-card overflow-hidden"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <motion.div
                  className="p-2 rounded-full bg-tech-glass"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <GraduationCap size={20} className="text-tech-accent" />
                </motion.div>
                <h4 className="font-bold">Education</h4>
              </div>

              <motion.div
                className="pl-12 border-l-2 border-tech-neon/30 hover:border-tech-accent/50 transition-colors duration-300"
                initial={{ opacity: 0, x: -10 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h5 className="font-semibold">B.Tech in Artificial Intelligence and Machine Learning</h5>
                <p className="text-sm text-muted-foreground">Sharda University, Greater Noida (2020–2024)</p>
              </motion.div>
            </motion.div>

            <motion.div
              className="hidden sm:block glass-card overflow-hidden"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <motion.div
                  className="p-2 rounded-full bg-tech-glass"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Award size={20} className="text-tech-accent" />
                </motion.div>
                <h4 className="font-bold">Certifications</h4>
              </div>

              <motion.ul
                className="space-y-4 pl-12 border-l-2 border-tech-neon/30 hover:border-tech-accent/50 transition-colors duration-300"
                variants={staggerContainer}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
              >
                {certifications.slice(0, 3).map((cert) => (
                  <motion.li
                    key={cert.id}
                    variants={staggerItem}
                    className="group"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h5 className="font-semibold group-hover:text-tech-accent transition-colors duration-300">
                      {cert.title}
                    </h5>
                    <p className="text-sm text-muted-foreground">
                      {cert.issuer} | {cert.date}
                    </p>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
