import { motion } from 'framer-motion';

const ReturnPhase = () => {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="text-center">
        <motion.h2
          className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-wider glow-text-blue"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
          style={{ color: 'hsl(var(--foreground))' }}
        >
          RETURN
          <br />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            UNRECOGNIZABLE
          </span>
        </motion.h2>

        <motion.p
          className="mt-8 font-mono text-sm text-muted-foreground tracking-[0.3em]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 1 }}
        >
          Let it happen.
        </motion.p>
      </div>

      {/* Bottom fade to black */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent, hsl(var(--base-dark)))',
        }}
      />
    </section>
  );
};

export default ReturnPhase;
