import { useEffect, useRef } from 'react';

const LiquidBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0.5, y: 0.5 });
  const animationRef = useRef<number>(0);
  const time = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMouse = (e: MouseEvent) => {
      mouse.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener('mousemove', handleMouse);

    const animate = () => {
      time.current += 0.005;
      const t = time.current;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Multiple overlapping liquid blobs
      for (let i = 0; i < 5; i++) {
        const cx = w * (0.3 + 0.4 * Math.sin(t * (0.3 + i * 0.1) + i * 1.5) + (mouse.current.x - 0.5) * 0.3);
        const cy = h * (0.3 + 0.4 * Math.cos(t * (0.2 + i * 0.15) + i * 2) + (mouse.current.y - 0.5) * 0.3);
        const radius = Math.min(w, h) * (0.15 + 0.1 * Math.sin(t + i));

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        
        if (i % 2 === 0) {
          gradient.addColorStop(0, 'hsla(210, 100%, 55%, 0.08)');
          gradient.addColorStop(0.5, 'hsla(210, 100%, 45%, 0.04)');
          gradient.addColorStop(1, 'hsla(210, 100%, 35%, 0)');
        } else {
          gradient.addColorStop(0, 'hsla(270, 80%, 60%, 0.06)');
          gradient.addColorStop(0.5, 'hsla(270, 80%, 50%, 0.03)');
          gradient.addColorStop(1, 'hsla(270, 80%, 40%, 0)');
        }

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0"
    />
  );
};

export default LiquidBackground;
