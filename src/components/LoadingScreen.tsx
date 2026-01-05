import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';

export function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 6 + 2;
        if (newProgress >= 100) {
          clearInterval(timer);
          setTimeout(() => setIsLoading(false), 500);
          return 100;
        }
        return newProgress;
      });
    }, 50);

    return () => clearInterval(timer);
  }, []);

  // Neural network configuration - more complex structure
  const layers = useMemo(() => [
    { nodes: 3, x: 10 },
    { nodes: 5, x: 25 },
    { nodes: 7, x: 40 },
    { nodes: 7, x: 55 },
    { nodes: 5, x: 70 },
    { nodes: 3, x: 85 },
  ], []);

  const getNodeY = (layerNodes: number, nodeIndex: number) => {
    const spacing = 70 / (layerNodes + 1);
    return 15 + spacing * (nodeIndex + 1);
  };

  // Generate connections
  const connections = useMemo(() => {
    const conns: Array<{ x1: number; y1: number; x2: number; y2: number; delay: number }> = [];
    for (let l = 0; l < layers.length - 1; l++) {
      for (let i = 0; i < layers[l].nodes; i++) {
        for (let j = 0; j < layers[l + 1].nodes; j++) {
          conns.push({
            x1: layers[l].x,
            y1: getNodeY(layers[l].nodes, i),
            x2: layers[l + 1].x,
            y2: getNodeY(layers[l + 1].nodes, j),
            delay: (l * 0.05) + (i * 0.01) + (j * 0.005),
          });
        }
      }
    }
    return conns;
  }, [layers]);

  // Matrix-style binary data
  const binaryStreams = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      left: `${(i * 9) % 100}%`,
      delay: i * 0.3,
      duration: 3 + Math.random() * 2,
    })), []
  );

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.02,
          }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[100] bg-[#0a0a0f] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Grid background */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0, 224, 255, 0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 224, 255, 0.5) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}
          />

          {/* Radial gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 0%, #0a0a0f 70%)',
            }}
          />

          {/* Binary data streams */}
          <div className="absolute inset-0 overflow-hidden opacity-20">
            {binaryStreams.map((stream, i) => (
              <motion.div
                key={i}
                className="absolute top-0 font-mono text-[10px] text-tech-accent/60 whitespace-nowrap"
                style={{ left: stream.left }}
                initial={{ y: '-100%' }}
                animate={{ y: '100vh' }}
                transition={{
                  duration: stream.duration,
                  delay: stream.delay,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                {Array.from({ length: 20 }, () => Math.round(Math.random())).join('')}
              </motion.div>
            ))}
          </div>

          {/* Main neural network visualization */}
          <div className="relative w-[400px] h-[200px] mb-12">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <defs>
                <linearGradient id="connGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7B42F6" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="#00E0FF" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#7B42F6" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="nodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00E0FF" />
                  <stop offset="100%" stopColor="#7B42F6" />
                </linearGradient>
                <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="strongGlow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Connections */}
              {connections.map((conn, index) => (
                <motion.line
                  key={`conn-${index}`}
                  x1={conn.x1}
                  y1={conn.y1}
                  x2={conn.x2}
                  y2={conn.y2}
                  stroke="url(#connGrad)"
                  strokeWidth="0.15"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.4 }}
                  transition={{ duration: 0.8, delay: conn.delay }}
                />
              ))}

              {/* Data flow particles */}
              {connections.slice(0, 30).map((conn, index) => (
                <motion.circle
                  key={`flow-${index}`}
                  r="0.6"
                  fill="#00E0FF"
                  filter="url(#strongGlow)"
                  initial={{ opacity: 0 }}
                  animate={{
                    cx: [conn.x1, conn.x2],
                    cy: [conn.y1, conn.y2],
                    opacity: [0, 0.8, 0],
                  }}
                  transition={{
                    duration: 1.2,
                    delay: index * 0.1,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              ))}

              {/* Nodes */}
              {layers.map((layer, layerIndex) =>
                Array.from({ length: layer.nodes }).map((_, nodeIndex) => {
                  const isActive = progress > (layerIndex / layers.length) * 100;
                  return (
                    <motion.g key={`node-${layerIndex}-${nodeIndex}`}>
                      {/* Outer glow ring */}
                      <motion.circle
                        cx={layer.x}
                        cy={getNodeY(layer.nodes, nodeIndex)}
                        r="2.5"
                        fill="none"
                        stroke="url(#nodeGrad)"
                        strokeWidth="0.3"
                        filter="url(#nodeGlow)"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                          scale: isActive ? [1, 1.3, 1] : 1,
                          opacity: isActive ? [0.3, 0.6, 0.3] : 0.1,
                        }}
                        transition={{
                          duration: 2,
                          delay: layerIndex * 0.1 + nodeIndex * 0.05,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                      {/* Inner node */}
                      <motion.circle
                        cx={layer.x}
                        cy={getNodeY(layer.nodes, nodeIndex)}
                        r="1.2"
                        fill="url(#nodeGrad)"
                        filter="url(#nodeGlow)"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                          scale: 1,
                          opacity: isActive ? 1 : 0.3,
                        }}
                        transition={{
                          duration: 0.4,
                          delay: layerIndex * 0.1 + nodeIndex * 0.05,
                        }}
                      />
                      {/* Center dot */}
                      <motion.circle
                        cx={layer.x}
                        cy={getNodeY(layer.nodes, nodeIndex)}
                        r="0.4"
                        fill="#fff"
                        initial={{ scale: 0 }}
                        animate={{ scale: isActive ? 1 : 0.5 }}
                        transition={{
                          duration: 0.3,
                          delay: layerIndex * 0.1 + nodeIndex * 0.05,
                        }}
                      />
                    </motion.g>
                  );
                })
              )}

              {/* Layer labels */}
              {['Input', '', 'Hidden', '', '', 'Output'].map((label, i) => (
                label && (
                  <motion.text
                    key={`label-${i}`}
                    x={layers[i].x}
                    y="95"
                    textAnchor="middle"
                    className="fill-muted-foreground text-[3px] font-mono uppercase tracking-wider"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    {label}
                  </motion.text>
                )
              ))}
            </svg>
          </div>

          {/* Loading text and progress */}
          <div className="text-center space-y-6">
            {/* Model loading indicator */}
            <motion.div
              className="flex items-center justify-center gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                className="w-2 h-2 rounded-full bg-tech-accent"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <span className="font-mono text-sm text-muted-foreground tracking-wide">
                {progress < 30 && 'Initializing model architecture...'}
                {progress >= 30 && progress < 60 && 'Loading neural weights...'}
                {progress >= 60 && progress < 85 && 'Optimizing inference pipeline...'}
                {progress >= 85 && progress < 100 && 'Finalizing...'}
                {progress >= 100 && 'Ready'}
              </span>
            </motion.div>

            {/* Progress bar */}
            <div className="w-72 mx-auto">
              <div className="h-[2px] bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full relative"
                  style={{
                    width: `${Math.min(progress, 100)}%`,
                    background: 'linear-gradient(90deg, #7B42F6, #00E0FF)',
                  }}
                >
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                    }}
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                </motion.div>
              </div>
            </div>

            {/* Percentage */}
            <motion.div
              className="font-mono text-2xl font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <span className="bg-gradient-to-r from-tech-neon to-tech-accent bg-clip-text text-transparent">
                {Math.min(Math.round(progress), 100)}%
              </span>
            </motion.div>
          </div>

          {/* Bottom decorative elements */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 1 }}
          >
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-tech-accent/50" />
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
              Deep Learning Portfolio
            </div>
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-tech-accent/50" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
