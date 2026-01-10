import { motion } from 'framer-motion';
import { ArrowDown, ExternalLink, Terminal, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { portfolioData } from '@/data/portfolioData';
import { TypeWriter } from '@/components/TypeWriter';
import { NeuralNetworkBg } from '@/components/NeuralNetworkBg';
import {
  staggerContainer,
  fadeInUp,
  buttonHover,
  buttonTap,
} from '@/lib/animations';

export function HeroSection() {
  const { hero } = portfolioData;

  const roles = [
    'AI Engineer',
    'ML Engineer',
    'Deep Learning Engineer',
    'Data Scientist',
    'GenAI Developer',
  ];

  const codeSnippets = [
    'model.fit(X_train, y_train)',
    'mlflow.log_metrics({"rmse": 0.12})',
    'pipeline = make_pipeline(scaler, clf)',
    'torch.jit.trace(model, input)',
    'feature_store.get_features()',
    'xgb.XGBRegressor(n_estimators=100)',
  ];

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Neural Network Background */}
      <div className="absolute inset-0 z-0">
        <NeuralNetworkBg />
      </div>

      {/* Animated gradient orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-tech-neon/20 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-tech-accent/15 rounded-full blur-[150px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-tech-highlight/5 rounded-full blur-[180px]"
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, 90, 180],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Floating code snippets - hidden on mobile for performance */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none hidden sm:block">
        {codeSnippets.map((snippet, index) => (
          <motion.div
            key={index}
            className="absolute font-mono text-xs text-tech-accent/30 whitespace-nowrap select-none"
            style={{
              left: `${10 + (index * 25)}%`,
              top: `${20 + (index * 15)}%`,
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: [0, 0.4, 0],
              y: [20, -30, -80],
              x: [0, index % 2 === 0 ? 20 : -20, 0],
            }}
            transition={{
              duration: 8,
              delay: index * 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <code className="bg-tech-glass/30 px-2 py-1 rounded backdrop-blur-sm">
              {snippet}
            </code>
          </motion.div>
        ))}
      </div>

      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
          <motion.div
            className="lg:col-span-3 space-y-4 sm:space-y-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Status badge */}
            <motion.div variants={fadeInUp}>
              <motion.span
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium bg-tech-glass/80 border border-tech-accent/30 inline-flex items-center gap-2 backdrop-blur-md"
                whileHover={{ scale: 1.05, borderColor: 'rgba(0, 224, 255, 0.5)' }}
              >
                <motion.span
                  className="w-2 h-2 rounded-full bg-green-400"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [1, 0.7, 1],
                    boxShadow: [
                      '0 0 0 0 rgba(74, 222, 128, 0.4)',
                      '0 0 0 8px rgba(74, 222, 128, 0)',
                      '0 0 0 0 rgba(74, 222, 128, 0)',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                <span className="text-green-400">Available for opportunities</span>
              </motion.span>
            </motion.div>

            {/* Main heading */}
            <motion.div variants={fadeInUp}>
              <h1 className="text-[8.5vw] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight whitespace-nowrap">
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  Hi, I'm{' '}
                </motion.span>
                <motion.span
                  className="bg-gradient-to-r from-tech-neon via-tech-accent to-tech-highlight bg-clip-text text-transparent bg-[length:200%_auto] sm:block"
                  animate={{
                    backgroundPosition: ['0% center', '200% center'],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  {hero.name}
                </motion.span>
              </h1>
            </motion.div>

            {/* Typewriter role */}
            <motion.div
              variants={fadeInUp}
              className="flex items-center gap-2 sm:gap-3"
            >
              <Terminal className="text-tech-accent w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="text-base sm:text-xl md:text-2xl text-muted-foreground">
                <TypeWriter
                  words={roles}
                  className="text-tech-accent font-semibold"
                  typingSpeed={80}
                  deletingSpeed={40}
                  pauseDuration={2500}
                />
              </span>
            </motion.div>

            {/* CTA Buttons - Stack on mobile, row on larger screens */}
            <motion.div
              className="flex flex-col sm:flex-row flex-wrap gap-3 pt-2 sm:pt-4"
              variants={fadeInUp}
            >
              <motion.div whileHover={buttonHover} whileTap={buttonTap} className="w-full sm:w-auto">
                <Button
                  className="tech-btn relative overflow-hidden group w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-6 text-sm sm:text-base"
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Let's Collaborate
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-tech-accent to-tech-neon opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                </Button>
              </motion.div>
              <div className="flex gap-3 w-full sm:w-auto">
                <motion.div whileHover={buttonHover} whileTap={buttonTap} className="flex-1 sm:flex-initial">
                  <Button
                    variant="outline"
                    className="w-full border-tech-accent/40 hover:border-tech-accent hover:bg-tech-glass/50 backdrop-blur-sm transition-all duration-300 px-4 py-3 sm:px-8 sm:py-6 text-sm sm:text-base group"
                    onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <span className="flex items-center justify-center gap-2">
                      About Me
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        →
                      </motion.span>
                    </span>
                  </Button>
                </motion.div>
                <motion.div whileHover={buttonHover} whileTap={buttonTap} className="flex-1 sm:flex-initial">
                  <Button
                    variant="outline"
                    className="w-full border-tech-accent/40 hover:border-tech-accent hover:bg-tech-glass/50 backdrop-blur-sm transition-all duration-300 px-4 py-3 sm:px-8 sm:py-6 text-sm sm:text-base group"
                    onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <span className="flex items-center justify-center gap-2">
                      My Work
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        →
                      </motion.span>
                    </span>
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* Quick stats */}
            <motion.div
              variants={fadeInUp}
              className="flex justify-center gap-8 sm:gap-10 pt-4 sm:pt-6 border-t border-white/10"
            >
              {[
                { value: '2', label: 'YOE' },
                { value: '12+', label: 'AI&ML Projects' },
                { value: '7+', label: 'Client Projects' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <div className="text-xl sm:text-2xl font-bold text-tech-accent">{stat.value}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Profile section */}
          <motion.div
            className="lg:col-span-2 flex justify-center order-first lg:order-last"
            initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative">
              {/* Animated rings - smaller on mobile */}
              <motion.div
                className="absolute inset-0 w-40 h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 lg:w-80 lg:h-80"
                style={{ margin: '-16px' }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-tech-neon/30"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                  className="absolute inset-2 rounded-full border border-dashed border-tech-accent/30 hidden sm:block"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                  className="absolute inset-4 rounded-full border border-tech-highlight/20 hidden sm:block"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                />
              </motion.div>

              {/* Floating tech icons - hidden on mobile */}
              {['🧠', '🤖', '📊', '⚡'].map((emoji, index) => (
                <motion.div
                  key={index}
                  className="absolute w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-tech-glass/80 backdrop-blur-sm border border-tech-neon/30 items-center justify-center text-sm sm:text-lg hidden md:flex"
                  style={{
                    top: `${20 + Math.sin(index * Math.PI / 2) * 40}%`,
                    left: `${50 + Math.cos(index * Math.PI / 2) * 60}%`,
                  }}
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 3,
                    delay: index * 0.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  {emoji}
                </motion.div>
              ))}

              {/* Profile image - smaller on mobile */}
              <motion.div
                className="relative w-36 h-36 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-72 lg:h-72 rounded-full overflow-hidden"
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.3 },
                }}
              >
                {/* Gradient border */}
                <div className="absolute inset-0 rounded-full p-1 bg-gradient-to-br from-tech-neon via-tech-accent to-tech-highlight">
                  <div className="w-full h-full rounded-full overflow-hidden bg-background">
                    <img
                      src={hero.image}
                      alt={hero.name || "Abhinav Sarkar"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%', y: '-100%' }}
                  animate={{ x: '200%', y: '200%' }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 5,
                    ease: 'easeInOut',
                  }}
                />
              </motion.div>

              {/* Resume badge - compact on mobile */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1 }}
                whileHover={{
                  scale: 1.1,
                  boxShadow: '0 10px 40px rgba(0, 224, 255, 0.3)',
                }}
                className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 glass px-3 py-2 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl border border-tech-accent/40 shadow-lg cursor-pointer group"
                onClick={() => window.open(hero.resumeLink, "_blank")}
              >
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <span className="text-base sm:text-xl">📄</span>
                  <span className="font-medium group-hover:text-tech-accent transition-colors">Resume</span>
                  <ExternalLink size={12} className="text-muted-foreground group-hover:text-tech-accent transition-colors sm:w-[14px] sm:h-[14px]" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator - hidden on small mobile */}
        <motion.div
          className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex-col items-center gap-2 hidden sm:flex"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          <span className="text-xs sm:text-sm text-muted-foreground">Scroll to explore</span>
          <motion.div
            className="w-5 h-8 sm:w-6 sm:h-10 rounded-full border-2 border-tech-accent/50 flex justify-center pt-1.5 sm:pt-2"
            animate={{
              borderColor: ['rgba(0, 224, 255, 0.3)', 'rgba(0, 224, 255, 0.6)', 'rgba(0, 224, 255, 0.3)'],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-tech-accent"
              animate={{
                y: [0, 12, 0],
                opacity: [1, 0.3, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
