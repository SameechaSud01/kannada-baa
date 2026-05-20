import { supabase } from './supabase';

const slugToId = new Map<string, string>();

export async function fetchLessonIdBySlug(slug: string): Promise<string | null> {
  const cached = slugToId.get(slug);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('lessons')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  slugToId.set(slug, data.id as string);
  return data.id as string;
}

export function resetLessonsCache(): void {
  slugToId.clear();
}
