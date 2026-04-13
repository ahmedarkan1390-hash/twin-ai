import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LiquidBackground from './LiquidBackground';

interface HeroSectionProps {
  onEnter: () => void;
}

const HeroSection = ({ onEnter }: HeroSectionProps) => {
  const [clicked, setClicked] = useState(false);

  const handleClick = useCallback(() => {
    setClicked(true);
    setTimeout(onEnter, 800);
  }, [onEnter]);

  return (
    <AnimatePresence>
      {!clicked && (
        <motion.section
          className="relative h-screen w-full flex items-center justify-center overflow-hidden"
          exit={{ opacity: 0, filter: 'blur(20px)' }}
          transition={{ duration: 0.8 }}
        >
          <LiquidBackground />
          <div className="grid-bg absolute inset-0 z-[1] opacity-20" />

          <div className="relative z-10 text-center px-4">
            <motion.h1
              className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-wider glow-text-blue"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{ color: 'hsl(var(--foreground))' }}
            >
              STEALTH
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                BUILDER
              </span>
              <br />
              PROTOCOL
            </motion.h1>

            <motion.p
              className="mt-6 font-mono text-sm sm:text-base tracking-[0.3em] uppercase text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
            >
              Disappear. Execute. Return unstoppable.
            </motion.p>

            <motion.button
              className="mt-12 px-10 py-4 font-display text-sm tracking-[0.25em] uppercase border border-primary/50 bg-primary/10 text-primary rounded-sm pulse-glow relative overflow-hidden group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              onClick={handleClick}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10">ENTER PROTOCOL</span>
              <motion.div
                className="absolute inset-0 bg-primary/20"
                initial={{ x: '-100%' }}
                whileHover={{ x: '0%' }}
                transition={{ duration: 0.4 }}
              />
            </motion.button>
          </div>

          <div className="absolute inset-0 z-[2] pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 40%, hsl(var(--base-dark)) 100%)',
            }}
          />
        </motion.section>
      )}
    </AnimatePresence>
  );
};

export default HeroSection;
