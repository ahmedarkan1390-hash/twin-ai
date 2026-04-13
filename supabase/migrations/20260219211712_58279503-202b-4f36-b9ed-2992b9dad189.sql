
-- Protocol commitments table
CREATE TABLE public.protocol_commitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  operative_name TEXT NOT NULL,
  stealth_id TEXT NOT NULL UNIQUE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  current_day INTEGER NOT NULL DEFAULT 1,
  discipline_index INTEGER NOT NULL DEFAULT 50,
  consistency_rate INTEGER NOT NULL DEFAULT 50,
  distraction_suppression INTEGER NOT NULL DEFAULT 50,
  execution_depth INTEGER NOT NULL DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.protocol_commitments ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (anonymous users too)
CREATE POLICY "Anyone can create commitments"
ON public.protocol_commitments FOR INSERT
WITH CHECK (true);

-- Anyone can read their own or anonymous commitments
CREATE POLICY "Anyone can read commitments"
ON public.protocol_commitments FOR SELECT
USING (true);

-- Update own commitments
CREATE POLICY "Users can update own commitments"
ON public.protocol_commitments FOR UPDATE
USING (
  user_id IS NULL OR auth.uid() = user_id
);

-- AI Twin messages log
CREATE TABLE public.twin_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commitment_id UUID REFERENCES public.protocol_commitments(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('system', 'user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.twin_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read twin messages"
ON public.twin_messages FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert twin messages"
ON public.twin_messages FOR INSERT
WITH CHECK (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_protocol_commitments_updated_at
BEFORE UPDATE ON public.protocol_commitments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
