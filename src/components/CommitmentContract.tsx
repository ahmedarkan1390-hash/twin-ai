import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createCommitment } from '@/lib/protocol-api';
import { toast } from 'sonner';

interface CommitmentContractProps {
  onSigned: (commitment: {
    id: string;
    operative_name: string;
    stealth_id: string;
    current_day: number;
    discipline_index: number;
    consistency_rate: number;
    distraction_suppression: number;
    execution_depth: number;
  }) => void;
}

const CommitmentContract = ({ onSigned }: CommitmentContractProps) => {
  const [name, setName] = useState('');
  const [signed, setSigned] = useState(false);
  const [stealthId, setStealthId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSign = useCallback(async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const commitment = await createCommitment(name.trim());
      setStealthId(commitment.stealth_id);
      setSigned(true);
      onSigned(commitment);
      toast.success('Protocol signed. You are now active.');
    } catch (err) {
      console.error('Failed to sign protocol:', err);
      toast.error('Failed to sign protocol. Try again.');
    } finally {
      setLoading(false);
    }
  }, [name, onSigned]);

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="max-w-md w-full">
        <AnimatePresence mode="wait">
          {!signed ? (
            <motion.div
              key="form"
              className="glass rounded-lg p-8 sm:p-10 text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-xl sm:text-2xl tracking-wider mb-2">
                COMMITMENT CONTRACT
              </h2>
              <p className="font-mono text-xs text-muted-foreground mt-4 leading-relaxed">
                "I commit to 90 days of silent execution."
              </p>

              <div className="mt-8 space-y-4">
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSign()}
                  className="w-full bg-muted/50 border border-border/50 rounded-sm px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                />
                <motion.button
                  className="w-full px-8 py-3 font-display text-xs tracking-[0.2em] border border-primary/50 bg-primary/10 text-primary rounded-sm disabled:opacity-30 disabled:cursor-not-allowed"
                  onClick={handleSign}
                  disabled={!name.trim() || loading}
                  whileHover={name.trim() ? { scale: 1.02, boxShadow: '0 0 30px hsla(210, 100%, 55%, 0.3)' } : {}}
                  whileTap={name.trim() ? { scale: 0.98 } : {}}
                >
                  {loading ? 'SIGNING...' : 'SIGN PROTOCOL'}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="signed"
              className="glass rounded-lg p-8 sm:p-10 text-center glow-blue"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-4 h-4 rounded-full bg-primary mx-auto mb-6 pulse-glow" />
              <h3 className="font-display text-lg tracking-wider text-primary glow-text-blue mb-6">
                PROTOCOL SIGNED
              </h3>
              <div className="space-y-3 font-mono text-sm">
                <div>
                  <span className="text-muted-foreground text-xs">OPERATIVE:</span>
                  <p className="text-foreground">{name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">STEALTH ID:</span>
                  <p className="text-primary tracking-widest">{stealthId}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">STATUS:</span>
                  <p className="text-primary flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    ACTIVE — SAVED TO DATABASE
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default CommitmentContract;
