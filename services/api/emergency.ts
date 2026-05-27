import { supabase } from './supabase';

export type EmergencyItem = {
  id: string;
  kannada: string;
  transliteration: string | null;
  meaning: string;
  audioUrl: string | null;
};

export type EmergencyGroup = {
  id: string;
  label: string;
  items: EmergencyItem[];
};

type Row = {
  id: string;
  category: string;
  kannada: string;
  transliteration: string | null;
  meaning: string;
  audio_url: string | null;
  sort_order: number;
};

const GROUP_LABELS: Record<string, string> = {
  auto: 'Auto / cab',
  trouble: 'In trouble',
  basics: 'Basics',
};

const GROUP_ORDER = ['auto', 'trouble', 'basics'] as const;

export async function fetchEmergencyPhrases(): Promise<EmergencyGroup[]> {
  const { data, error } = await supabase
    .from('emergency_phrases')
    .select('id, category, kannada, transliteration, meaning, audio_url, sort_order')
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true });

  if (error) throw error;

  const byCategory = new Map<string, EmergencyItem[]>();
  for (const r of (data ?? []) as Row[]) {
    const bucket = byCategory.get(r.category) ?? [];
    bucket.push({
      id: r.id,
      kannada: r.kannada,
      transliteration: r.transliteration,
      meaning: r.meaning,
      audioUrl: r.audio_url,
    });
    byCategory.set(r.category, bucket);
  }

  return GROUP_ORDER.filter((cat) => byCategory.has(cat)).map((cat) => ({
    id: cat,
    label: GROUP_LABELS[cat] ?? cat,
    items: byCategory.get(cat) ?? [],
  }));
}
