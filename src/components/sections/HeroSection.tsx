import { motion } from 'framer-motion';
import { ArrowDown, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { portfolioData } from '@/data/portfolioData';
import {
  heroTitle,
  heroSubtitle,
  heroDescription,
  heroImage,
  heroCTA,
  scrollIndicator,
  staggerContainer,
  fadeInUp,
  buttonHover,
  buttonTap,
} from '@/lib/animations';

export function HeroSection() {
  const { hero } = portfolioData;

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute top-40 left-0 w-72 h-72 bg-tech-neon/20 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-tech-accent/10 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-tech-highlight/5 rounded-full blur-[150px]"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
          <motion.div
            className="lg:col-span-3 space-y-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeInUp}>
              <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-tech-glass border border-tech-accent/20 inline-flex items-center gap-1.5 backdrop-blur-sm">
                <motion.span
                  className="w-2 h-2 rounded-full bg-tech-accent"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [1, 0.7, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                AI-ML Engineer
              </span>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold overflow-visible"
              variants={heroTitle}
            >
              <span className="block leading-[1.3]">Building</span>
              <motion.span
                className="bg-gradient-tech bg-clip-text text-transparent block leading-[1.3]"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{
                  backgroundSize: '200% 200%',
                }}
              >
                intelligent systems
              </motion.span>
              <span className="block leading-[1.3]">for the future</span>
            </motion.h1>

            <motion.p
              className="text-lg text-muted-foreground max-w-xl"
              variants={heroDescription}
            >
              {hero.description}
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-4 pt-2"
              variants={heroCTA}
            >
              <motion.div whileHover={buttonHover} whileTap={buttonTap}>
                <Button
                  className="tech-btn relative overflow-hidden group"
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <span className="relative z-10">Get in touch</span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-tech-accent to-tech-neon opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={false}
                  />
                </Button>
              </motion.div>
              <motion.div whileHover={buttonHover} whileTap={buttonTap}>
                <Button
                  variant="outline"
                  className="border-tech-accent/30 hover:border-tech-accent/70 hover:bg-tech-glass backdrop-blur-sm transition-all duration-300"
                  onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  View Projects
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            className="lg:col-span-2 flex justify-center"
            variants={heroImage}
            initial="hidden"
            animate="visible"
          >
            <div className="relative">
              {/* Decorative ring */}
              <motion.div
                className="absolute inset-0 w-64 h-64 md:w-80 md:h-80 rounded-full border-2 border-tech-neon/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                style={{ margin: '-8px' }}
              />
              <motion.div
                className="absolute inset-0 w-64 h-64 md:w-80 md:h-80 rounded-full border-2 border-dashed border-tech-accent/20"
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                style={{ margin: '-16px' }}
              />

              {/* Profile image */}
              <motion.div
                className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-tech-accent/30 shadow-lg shadow-tech-neon/30"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                whileHover={{
                  scale: 1.05,
                  borderColor: 'rgba(0, 224, 255, 0.6)',
                  transition: { duration: 0.3 },
                }}
              >
                <img
                  src={hero.image}
                  alt={hero.name || "Abhinav Sarkar"}
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Resume badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 10px 30px rgba(123, 66, 246, 0.3)',
                }}
                className="absolute -bottom-4 -right-4 glass px-4 py-2 rounded-full border border-tech-accent/30 shadow-md transition-all duration-300 cursor-pointer"
                onClick={() => window.open(hero.resumeLink, "_blank")}
              >
                <div className="text-sm flex items-center gap-1.5 text-white hover:text-tech-accent transition-colors">
                  <span className="text-xl">📄</span>
                  <span>Resume</span>
                  <ExternalLink size={14} />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2"
          variants={scrollIndicator}
          initial="hidden"
          animate="visible"
        >
          <span className="text-sm text-muted-foreground">Scroll to explore</span>
          <motion.div
            animate={{
              y: [0, 8, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <ArrowDown className="text-tech-accent" size={20} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
