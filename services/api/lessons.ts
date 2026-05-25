import { supabase } from './supabase';
import { mapDbLesson, type Lesson, type LessonRow } from '../../constants/lessons/types';

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

export async function fetchAllLessons(): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select('id, lesson_no, title, slug, situation, real_world_prompt, content_json')
    .order('lesson_no', { ascending: true });

  if (error) throw error;
  if (!data) return [];

  const rows = data as LessonRow[];
  for (const r of rows) slugToId.set(r.slug, r.id);
  return rows.map(mapDbLesson);
}

export async function fetchLessonBySlug(slug: string): Promise<Lesson | null> {
  const { data, error } = await supabase
    .from('lessons')
    .select('id, lesson_no, title, slug, situation, real_world_prompt, content_json')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as LessonRow;
  slugToId.set(row.slug, row.id);
  return mapDbLesson(row);
}

export function resetLessonsCache(): void {
  slugToId.clear();
}
