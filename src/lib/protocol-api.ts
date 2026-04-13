import { supabase } from '@/integrations/supabase/client';

export const createCommitment = async (operativeName: string) => {
  const stealthId = `SBP-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  
  const { data, error } = await supabase
    .from('protocol_commitments')
    .insert({
      operative_name: operativeName,
      stealth_id: stealthId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getCommitment = async (stealthId: string) => {
  const { data, error } = await supabase
    .from('protocol_commitments')
    .select('*')
    .eq('stealth_id', stealthId)
    .single();

  if (error) throw error;
  return data;
};

export const updateMetrics = async (id: string, metrics: {
  discipline_index?: number;
  consistency_rate?: number;
  distraction_suppression?: number;
  execution_depth?: number;
  current_day?: number;
}) => {
  const { data, error } = await supabase
    .from('protocol_commitments')
    .update(metrics)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const callTwinAI = async (type: string, params: Record<string, unknown>) => {
  const { data, error } = await supabase.functions.invoke('twin-ai', {
    body: { type, ...params },
  });

  if (error) throw error;
  return data;
};

export const saveTwinMessage = async (commitmentId: string, role: string, content: string) => {
  const { error } = await supabase
    .from('twin_messages')
    .insert({
      commitment_id: commitmentId,
      role,
      content,
    });

  if (error) throw error;
};
