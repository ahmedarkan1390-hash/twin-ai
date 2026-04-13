import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { callTwinAI } from '@/lib/protocol-api';

interface InitiationScreenProps {
  onAccept: (aiMessage: string) => void;
}

const bootSequence = [
  'Initializing Discipline Engine...',
  'Loading Focus Protocol...',
  'Blocking External Validation...',
  'Calibrating Execution Matrix...',
  'Stealth Mode: ACTIVATED',
];

const InitiationScreen = ({ onAccept }: InitiationScreenProps) => {
  const [phase, setPhase] = useState<'question' | 'booting' | 'done'>('question');
  const [bootLine, setBootLine] = useState(0);
  const [aiMessage, setAiMessage] = useState('');

  const handleAccept = useCallback(() => {
    setPhase('booting');
  }, []);

  useEffect(() => {
    if (phase !== 'booting') return;
    if (bootLine < bootSequence.length) {
      const timer = setTimeout(() => setBootLine((l) => l + 1), 700);
      return () => clearTimeout(timer);
    } else {
      // Fetch AI boot message
      callTwinAI('boot_message', { operative_name: 'Operative' })
        .then((data) => {
          setAiMessage(data.message || 'Protocol initialized.');
          setPhase('done');
          setTimeout(() => onAccept(data.message || ''), 2000);
        })
        .catch(() => {
          setAiMessage('Protocol initialized. Signal acquired.');
          setPhase('done');
          setTimeout(() => onAccept('Protocol initialized.'), 2000);
        });
    }
  }, [phase, bootLine, onAccept]);

  return (
    <motion.section
      className="min-h-screen flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="glass rounded-lg p-8 sm:p-12 max-w-lg w-full scanline relative overflow-hidden">
        <AnimatePresence mode="wait">
          {phase === 'question' && (
            <motion.div
              key="question"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center"
            >
              <div className="w-3 h-3 rounded-full bg-primary mx-auto mb-8 pulse-glow" />
              <h2 className="font-display text-xl sm:text-2xl tracking-wider mb-2">
                INITIATION SEQUENCE
              </h2>
              <p className="font-mono text-sm text-muted-foreground mt-6 mb-10">
                Are you ready to disappear for 90 days?
              </p>
              <div className="flex gap-4 justify-center">
                <motion.button
                  className="px-8 py-3 font-display text-xs tracking-[0.2em] border border-primary/50 bg-primary/10 text-primary rounded-sm"
                  onClick={handleAccept}
                  whileHover={{ scale: 1.05, boxShadow: '0 0 30px hsla(210, 100%, 55%, 0.3)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  ACCEPT
                </motion.button>
                <motion.button
                  className="px-8 py-3 font-display text-xs tracking-[0.2em] border border-destructive/50 bg-destructive/10 text-destructive rounded-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ABORT
                </motion.button>
              </div>
            </motion.div>
          )}

          {phase === 'booting' && (
            <motion.div
              key="boot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-mono text-sm space-y-3"
            >
              {bootSequence.slice(0, bootLine).map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center gap-3 ${
                    i === bootSequence.length - 1 ? 'text-primary font-bold' : 'text-muted-foreground'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    i === bootSequence.length - 1 ? 'bg-primary pulse-glow' : 'bg-muted-foreground/50'
                  }`} />
                  {line}
                </motion.div>
              ))}
              <span className="inline-block w-2 h-4 bg-primary animate-blink ml-5" />
            </motion.div>
          )}

          {phase === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <p className="font-display text-2xl text-primary glow-text-blue tracking-wider">
                PROTOCOL ACTIVE
              </p>
              {aiMessage && (
                <motion.p
                  className="font-mono text-xs text-muted-foreground italic leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  "{aiMessage}"
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
};

export default InitiationScreen;
