import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { callTwinAI } from '@/lib/protocol-api';

interface DigitalTwinSectionProps {
  commitment?: {
    id: string;
    current_day: number;
    discipline_index: number;
    consistency_rate: number;
    execution_depth: number;
  } | null;
}

const DigitalTwinSection = ({ commitment }: DigitalTwinSectionProps) => {
  const [inactive, setInactive] = useState(false);
  const [twinStatus, setTwinStatus] = useState('');
  const [directive, setDirective] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const hasFetched = useRef(false);

  // Fetch AI twin status on mount
  useEffect(() => {
    if (hasFetched.current || !commitment) return;
    hasFetched.current = true;

    callTwinAI('twin_status', {
      current_day: commitment.current_day,
      metrics: {
        discipline: commitment.discipline_index,
        consistency: commitment.consistency_rate,
        execution: commitment.execution_depth,
      },
    })
      .then((data) => setTwinStatus(data.message || ''))
      .catch(() => setTwinStatus('Twin operational. Building in parallel.'));

    callTwinAI('motivation', { current_day: commitment.current_day })
      .then((data) => setDirective(data.message || ''))
      .catch(() => setDirective('Execute without hesitation.'));
  }, [commitment]);

  // Inactivity detection
  useEffect(() => {
    const reset = () => {
      setInactive(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setInactive(true), 30000);
    };

    reset();
    window.addEventListener('mousemove', reset);
    window.addEventListener('scroll', reset);
    window.addEventListener('touchstart', reset);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      window.removeEventListener('mousemove', reset);
      window.removeEventListener('scroll', reset);
      window.removeEventListener('touchstart', reset);
    };
  }, []);

  const fragments = [
    'Build in silence.',
    'Execute.',
    'No validation needed.',
    'Precision.',
    'Control.',
    directive || 'Momentum.',
    'Zero noise.',
  ];

  return (
    <section className="min-h-screen relative flex items-center justify-center px-4 py-20 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {fragments.map((text, i) => (
          <motion.span
            key={i}
            className="absolute font-mono text-xs text-primary/20 whitespace-nowrap"
            style={{
              left: `${10 + (i * 13) % 80}%`,
              top: `${10 + (i * 17) % 75}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              opacity: [0.15, 0.3, 0.15],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 1.5,
            }}
          >
            {text}
          </motion.span>
        ))}
      </div>

      <div className="relative z-10 max-w-2xl w-full text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-2xl sm:text-3xl tracking-wider">
            DIGITAL <span className="text-accent glow-text-purple">TWIN</span> SYSTEM
          </h2>
        </motion.div>

        <motion.div
          className="glass rounded-lg p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <p className="font-mono text-sm text-muted-foreground leading-relaxed">
            Your Digital Twin is building while you hesitate.
          </p>
          {twinStatus && (
            <motion.p
              className="font-mono text-xs text-primary/70 mt-4 italic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              "{twinStatus}"
            </motion.p>
          )}
          <div className="mt-6 flex items-center justify-center gap-3">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-xs text-primary tracking-widest">TWIN ACTIVE</span>
          </div>
        </motion.div>

        <AnimatePresence>
          {inactive && (
            <motion.div
              className="glass rounded-lg p-6 border-destructive/30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ boxShadow: '0 0 30px hsla(0, 75%, 55%, 0.2)' }}
            >
              <p className="font-display text-lg text-destructive tracking-wider">TWIN PAUSED</p>
              <p className="font-mono text-xs text-destructive/70 mt-2">Momentum lost. Resume activity.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default DigitalTwinSection;
