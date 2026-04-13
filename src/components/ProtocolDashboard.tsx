import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface ProtocolDashboardProps {
  commitment?: {
    id: string;
    current_day: number;
    discipline_index: number;
    consistency_rate: number;
    distraction_suppression: number;
    execution_depth: number;
  } | null;
}

const CircularProgress = ({ value, label, color, delay }: { value: number; label: string; color: string; delay: number }) => {
  const [current, setCurrent] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setCurrent((c) => {
          if (c >= value) { clearInterval(interval); return value; }
          return c + 1;
        });
      }, 20);
    }, delay);
    return () => clearTimeout(timer);
  }, [visible, value, delay]);

  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (current / 100) * circumference;

  return (
    <motion.div
      ref={ref}
      className="flex flex-col items-center gap-3"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000, duration: 0.6 }}
      viewport={{ once: true }}
    >
      <div className="relative w-28 h-28 sm:w-32 sm:h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--border))" strokeWidth="2" />
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke={`hsl(${color})`}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 0.1s ease',
              filter: `drop-shadow(0 0 6px hsl(${color} / 0.5))`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-2xl text-foreground">{current}</span>
        </div>
      </div>
      <span className="font-mono text-[10px] sm:text-xs tracking-wider text-muted-foreground uppercase text-center">
        {label}
      </span>
    </motion.div>
  );
};

const ProtocolDashboard = ({ commitment }: ProtocolDashboardProps) => {
  const day = commitment?.current_day || 1;
  const progress = Math.round((day / 90) * 100);

  const metrics = [
    { label: 'Discipline Index', value: commitment?.discipline_index || 50, color: 'var(--neon-blue)' },
    { label: 'Consistency Rate', value: commitment?.consistency_rate || 50, color: 'var(--neon-purple)' },
    { label: 'Distraction Suppression', value: commitment?.distraction_suppression || 50, color: 'var(--neon-cyan)' },
    { label: 'Execution Depth', value: commitment?.execution_depth || 50, color: 'var(--neon-blue)' },
  ];

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="max-w-4xl w-full space-y-12">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-2xl sm:text-3xl tracking-wider glow-text-blue">
            PROTOCOL DASHBOARD
          </h2>
          <p className="font-mono text-xs text-muted-foreground mt-3 tracking-widest">
            SYSTEM STATUS: OPERATIONAL
          </p>
        </motion.div>

        <motion.div
          className="glass rounded-lg p-6 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="font-mono text-xs text-muted-foreground tracking-widest mb-2">ACTIVE DURATION</p>
          <p className="font-display text-5xl sm:text-6xl text-primary glow-text-blue">
            DAY {day}
          </p>
          <p className="font-mono text-xs text-muted-foreground mt-2">OF 90</p>
        </motion.div>

        <motion.div
          className="glass rounded-lg p-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="flex justify-between items-center mb-3">
            <span className="font-mono text-xs text-muted-foreground tracking-widest">MISSION PROGRESS</span>
            <span className="font-mono text-xs text-primary">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              whileInView={{ width: `${progress}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              style={{
                background: 'linear-gradient(90deg, hsl(var(--neon-blue)), hsl(var(--neon-purple)))',
                boxShadow: '0 0 10px hsl(var(--neon-blue) / 0.5)',
              }}
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {metrics.map((m, i) => (
            <CircularProgress key={m.label} {...m} delay={i * 200} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProtocolDashboard;
