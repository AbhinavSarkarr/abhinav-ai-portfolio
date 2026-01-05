import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setIsLoading(false), 400);
          return 100;
        }
        return prev + Math.random() * 12 + 3;
      });
    }, 80);

    return () => clearInterval(timer);
  }, []);

  // Neural network nodes for AI theme
  const nodes = [
    { x: 50, y: 30 },
    { x: 20, y: 50 },
    { x: 80, y: 50 },
    { x: 35, y: 70 },
    { x: 65, y: 70 },
    { x: 50, y: 90 },
  ];

  const connections = [
    [0, 1], [0, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 5], [4, 5],
  ];

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Background gradient effect */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-tech-neon/5 rounded-full blur-[120px]"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          {/* Neural network animation */}
          <div className="relative w-32 h-32 mb-8">
            <svg viewBox="0 0 100 120" className="w-full h-full">
              {/* Connections */}
              {connections.map(([from, to], index) => (
                <motion.line
                  key={`line-${index}`}
                  x1={nodes[from].x}
                  y1={nodes[from].y}
                  x2={nodes[to].x}
                  y2={nodes[to].y}
                  stroke="url(#gradient)"
                  strokeWidth="1"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.4 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                />
              ))}

              {/* Gradient definition */}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7B42F6" />
                  <stop offset="100%" stopColor="#00E0FF" />
                </linearGradient>
              </defs>

              {/* Nodes */}
              {nodes.map((node, index) => (
                <motion.circle
                  key={`node-${index}`}
                  cx={node.x}
                  cy={node.y}
                  r="4"
                  fill="url(#gradient)"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: index * 0.15,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              ))}

              {/* Data flow particles */}
              {connections.map(([from, to], index) => (
                <motion.circle
                  key={`particle-${index}`}
                  r="2"
                  fill="#00E0FF"
                  initial={{ opacity: 0 }}
                  animate={{
                    cx: [nodes[from].x, nodes[to].x],
                    cy: [nodes[from].y, nodes[to].y],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.2,
                    delay: index * 0.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </svg>
          </div>

          {/* Progress bar */}
          <div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-tech-neon via-tech-accent to-tech-highlight"
              style={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>

          {/* Loading percentage */}
          <motion.p
            className="mt-4 text-xs text-muted-foreground font-mono tracking-wider"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {Math.min(Math.round(progress), 100)}%
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
