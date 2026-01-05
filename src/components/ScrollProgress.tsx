import { motion, useScroll, useSpring } from 'framer-motion';

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <>
      {/* Main progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-tech-neon via-tech-accent to-tech-highlight origin-left z-50"
        style={{ scaleX }}
      />

      {/* Glow effect */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[4px] blur-sm bg-gradient-to-r from-tech-neon via-tech-accent to-tech-highlight origin-left z-50 opacity-50"
        style={{ scaleX }}
      />
    </>
  );
}
