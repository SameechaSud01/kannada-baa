import { supabase } from './supabase';

export type FunFactCategory =
  | 'History'
  | 'Food'
  | 'Cinema'
  | 'Literature'
  | 'Culture'
  | 'Nature';

export type FunFact = {
  id: string;
  factNo: number;
  category: FunFactCategory;
  fact: string;
};

type Row = {
  id: string;
  fact_no: number;
  category: FunFactCategory;
  fact: string;
};

export async function fetchKarnatakaFunFacts(): Promise<FunFact[]> {
  const { data, error } = await supabase
    .from('karnataka_fun_facts')
    .select('id, fact_no, category, fact')
    .order('fact_no', { ascending: true });

  if (error) throw error;

  return ((data ?? []) as Row[]).map((r) => ({
    id: r.id,
    factNo: r.fact_no,
    category: r.category,
    fact: r.fact,
  }));
}
