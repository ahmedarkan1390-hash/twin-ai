import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ParticleField from '../components/ParticleField';
import HeroSection from '../components/HeroSection';
import InitiationScreen from '../components/InitiationScreen';
import ProtocolDashboard from '../components/ProtocolDashboard';
import DigitalTwinSection from '../components/DigitalTwinSection';
import CommitmentContract from '../components/CommitmentContract';
import ReturnPhase from '../components/ReturnPhase';
import TwinChat from '../components/TwinChat';

type Phase = 'hero' | 'initiation' | 'protocol';

interface Commitment {
  id: string;
  operative_name: string;
  stealth_id: string;
  current_day: number;
  discipline_index: number;
  consistency_rate: number;
  distraction_suppression: number;
  execution_depth: number;
}

const Index = () => {
  const [phase, setPhase] = useState<Phase>('hero');
  const [commitment, setCommitment] = useState<Commitment | null>(null);

  const handleSigned = useCallback((c: Commitment) => {
    setCommitment(c);
  }, []);

  return (
    <div className="relative min-h-screen bg-background film-grain">
      <ParticleField />

      <AnimatePresence mode="wait">
        {phase === 'hero' && (
          <motion.div key="hero" exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <HeroSection onEnter={() => setPhase('initiation')} />
          </motion.div>
        )}

        {phase === 'initiation' && (
          <motion.div
            key="initiation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <InitiationScreen onAccept={() => setPhase('protocol')} />
          </motion.div>
        )}

        {phase === 'protocol' && (
          <motion.div
            key="protocol"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <ProtocolDashboard commitment={commitment} />
            <DigitalTwinSection commitment={commitment} />
            <CommitmentContract onSigned={handleSigned} />
            <ReturnPhase />

            <TwinChat currentDay={commitment?.current_day} commitmentId={commitment?.id} />

            <footer className="pb-12 pt-20 text-center">
              <p className="font-mono text-[10px] text-muted-foreground/40 tracking-[0.3em] uppercase">
                Stealth Builder Protocol © {new Date().getFullYear()}
              </p>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
