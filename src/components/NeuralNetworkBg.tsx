import { useEffect, useRef, useCallback } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulsePhase: number;
}

interface Connection {
  from: number;
  to: number;
  strength: number;
}

export function NeuralNetworkBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const connectionsRef = useRef<Connection[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);

  const initializeNetwork = useCallback((width: number, height: number) => {
    const nodeCount = Math.min(Math.floor((width * height) / 25000), 50);
    const nodes: Node[] = [];
    const connections: Connection[] = [];

    // Create nodes in a semi-random pattern
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2 + 2,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    // Create connections based on proximity
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 200) {
          connections.push({
            from: i,
            to: j,
            strength: 1 - distance / 200,
          });
        }
      }
    }

    nodesRef.current = nodes;
    connectionsRef.current = connections;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      initializeNetwork(canvas.width, canvas.height);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const animate = () => {
      if (!ctx || !canvas) return;

      timeRef.current += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const nodes = nodesRef.current;
      const connections = connectionsRef.current;

      // Update nodes
      nodes.forEach((node, index) => {
        // Basic movement
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges with padding
        const padding = 50;
        if (node.x < padding || node.x > canvas.width - padding) node.vx *= -1;
        if (node.y < padding || node.y > canvas.height - padding) node.vy *= -1;

        // Mouse interaction
        if (mouseRef.current.active) {
          const dx = node.x - mouseRef.current.x;
          const dy = node.y - mouseRef.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            const force = (150 - distance) / 150;
            node.vx += (dx / distance) * force * 0.05;
            node.vy += (dy / distance) * force * 0.05;
          }
        }

        // Limit velocity
        const maxVel = 0.5;
        const vel = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
        if (vel > maxVel) {
          node.vx = (node.vx / vel) * maxVel;
          node.vy = (node.vy / vel) * maxVel;
        }

        // Update pulse phase
        node.pulsePhase += 0.02;
      });

      // Draw connections
      connections.forEach((conn) => {
        const from = nodes[conn.from];
        const to = nodes[conn.to];

        const dx = from.x - to.x;
        const dy = from.y - to.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 200) {
          const opacity = (1 - distance / 200) * 0.3;

          // Create gradient for connection
          const gradient = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
          gradient.addColorStop(0, `rgba(123, 66, 246, ${opacity})`);
          gradient.addColorStop(0.5, `rgba(0, 224, 255, ${opacity * 0.8})`);
          gradient.addColorStop(1, `rgba(123, 66, 246, ${opacity})`);

          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Draw data packet traveling along connection
          const packetPos = (Math.sin(timeRef.current * 2 + conn.from) + 1) / 2;
          const packetX = from.x + (to.x - from.x) * packetPos;
          const packetY = from.y + (to.y - from.y) * packetPos;

          if (Math.random() > 0.98) {
            ctx.beginPath();
            ctx.arc(packetX, packetY, 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 224, 255, ${opacity * 2})`;
            ctx.fill();
          }
        }
      });

      // Draw nodes
      nodes.forEach((node) => {
        const pulse = Math.sin(node.pulsePhase) * 0.3 + 1;

        // Outer glow
        const gradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, node.radius * 3 * pulse
        );
        gradient.addColorStop(0, 'rgba(123, 66, 246, 0.3)');
        gradient.addColorStop(0.5, 'rgba(0, 224, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 3 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * pulse, 0, Math.PI * 2);
        const coreGradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, node.radius * pulse
        );
        coreGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        coreGradient.addColorStop(0.5, 'rgba(0, 224, 255, 0.6)');
        coreGradient.addColorStop(1, 'rgba(123, 66, 246, 0.3)');
        ctx.fillStyle = coreGradient;
        ctx.fill();
      });

      // Draw mouse attraction field
      if (mouseRef.current.active) {
        const mouseGradient = ctx.createRadialGradient(
          mouseRef.current.x, mouseRef.current.y, 0,
          mouseRef.current.x, mouseRef.current.y, 150
        );
        mouseGradient.addColorStop(0, 'rgba(0, 224, 255, 0.1)');
        mouseGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.arc(mouseRef.current.x, mouseRef.current.y, 150, 0, Math.PI * 2);
        ctx.fillStyle = mouseGradient;
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();

    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [initializeNetwork]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.6 }}
    />
  );
}
