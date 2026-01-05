import { useRef, useEffect, useState } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import { Brain, Code2, Cpu, Zap } from 'lucide-react';

interface StatItemProps {
  icon: React.ElementType;
  value: number;
  suffix?: string;
  label: string;
  delay: number;
  isInView: boolean;
}

function AnimatedCounter({ value, isInView }: { value: number; isInView: boolean }) {
  const [displayValue, setDisplayValue] = useState(0);
  const spring = useSpring(0, { stiffness: 50, damping: 20 });

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, value, spring]);

  useEffect(() => {
    const unsubscribe = spring.on('change', (latest) => {
      setDisplayValue(Math.round(latest));
    });
    return unsubscribe;
  }, [spring]);

  return <>{displayValue}</>;
}

function StatItem({ icon: Icon, value, suffix = '', label, delay, isInView }: StatItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className="relative group"
    >
      <motion.div
        className="glass-card text-center py-8 px-6 relative overflow-hidden"
        whileHover={{ scale: 1.05, y: -5 }}
        transition={{ duration: 0.3 }}
      >
        {/* Animated background gradient on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-tech-neon/10 to-tech-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        />

        {/* Glowing orb behind icon */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-tech-neon/20 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: delay,
          }}
        />

        <div className="relative z-10">
          {/* Icon */}
          <motion.div
            className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-tech-glass flex items-center justify-center border border-tech-neon/30"
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ duration: 0.3 }}
          >
            <Icon className="w-7 h-7 text-tech-accent" />
          </motion.div>

          {/* Value */}
          <div className="text-4xl font-bold font-heading mb-2">
            <span className="bg-gradient-to-r from-tech-neon to-tech-accent bg-clip-text text-transparent">
              <AnimatedCounter value={value} isInView={isInView} />
              {suffix}
            </span>
          </div>

          {/* Label */}
          <p className="text-muted-foreground text-sm">{label}</p>
        </div>

        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
          <motion.div
            className="absolute -top-8 -right-8 w-16 h-16 bg-tech-accent/10 rotate-45"
            animate={{
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

export function StatsSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const stats = [
    { icon: Brain, value: 2, suffix: '+', label: 'Years of Experience' },
    { icon: Code2, value: 12, suffix: '+', label: 'ML Projects Deployed' },
    { icon: Cpu, value: 20, suffix: '+', label: 'Models Trained' },
    { icon: Zap, value: 10, suffix: 'x', label: 'Inference Speedup' },
  ];

  return (
    <section ref={sectionRef} className="relative py-16 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute top-1/2 left-1/4 w-64 h-64 bg-tech-neon/5 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/4 w-64 h-64 bg-tech-accent/5 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -20, 0],
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatItem
              key={stat.label}
              icon={stat.icon}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              delay={index * 0.1}
              isInView={isInView}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
