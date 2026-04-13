import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface TwinChatProps {
  currentDay?: number;
  commitmentId?: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/twin-ai`;

const TwinChat = ({ currentDay = 1, commitmentId }: TwinChatProps) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    let assistantSoFar = '';

    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: 'assistant', content: assistantSoFar }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: 'chat',
          current_day: currentDay,
          messages: [...messages, userMsg],
        }),
      });

      if (resp.status === 429) { toast.error('Rate limited. Stand by.'); setLoading(false); return; }
      if (resp.status === 402) { toast.error('Credits depleted.'); setLoading(false); return; }
      if (!resp.ok || !resp.body) throw new Error('Stream failed');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buf.indexOf('\n')) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6).trim();
          if (json === '[DONE]') break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsert(content);
          } catch {
            buf = line + '\n' + buf;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error('Twin connection lost.');
    }
    setLoading(false);
  };

  return (
    <>
      {/* Floating button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring' }}
      >
        <Button
          onClick={() => setOpen(!open)}
          className="w-14 h-14 rounded-full shadow-lg"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--neon-blue)), hsl(var(--neon-purple)))',
            boxShadow: '0 0 20px hsl(var(--neon-blue) / 0.4)',
          }}
        >
          {open ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
        </Button>
      </motion.div>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[28rem] glass rounded-lg border border-border/50 flex flex-col overflow-hidden"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            style={{ boxShadow: '0 0 40px hsl(var(--neon-blue) / 0.15)' }}
          >
            {/* Header */}
            <div className="p-4 border-b border-border/30 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-display text-sm tracking-wider text-foreground">TWIN COMMS</span>
              <span className="font-mono text-[10px] text-muted-foreground ml-auto">DAY {currentDay}</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.length === 0 && (
                <p className="text-center font-mono text-xs text-muted-foreground/60 mt-12">
                  Initiate communication with your Twin.
                </p>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 font-mono text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-primary/20 text-foreground'
                        : 'bg-accent/10 text-primary border border-primary/20'
                    }`}
                  >
                    {m.content}
                    {loading && m.role === 'assistant' && i === messages.length - 1 && (
                      <span className="inline-block w-1.5 h-3 bg-primary/60 ml-1 animate-pulse" />
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border/30 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Transmit to Twin..."
                className="flex-1 bg-transparent border border-border/30 rounded px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50"
                disabled={loading}
              />
              <Button
                onClick={send}
                disabled={loading || !input.trim()}
                size="icon"
                className="shrink-0"
                style={{ background: 'hsl(var(--neon-blue))' }}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TwinChat;
