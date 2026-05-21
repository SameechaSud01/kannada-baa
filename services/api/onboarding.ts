import { supabase } from './supabase';

export interface OnboardingRow {
  userId: string;
  name: string | null;
  learningMode: 'spoken' | 'written' | 'both' | null;
  motivations: string[];
  dailyGoalMinutes: 5 | 10 | 20 | null;
}

/**
 * Writes onboarding answers to the `public.users` row.
 * Best-effort: failures are logged and swallowed so a network hiccup doesn't
 * trap the user on /commitment — local state (AsyncStorage) is already saved.
 */
export async function syncOnboardingToSupabase(row: OnboardingRow): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({
      name: row.name,
      learning_mode: row.learningMode,
      motivations: row.motivations,
      daily_goal_minutes: row.dailyGoalMinutes,
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq('id', row.userId);

  if (error) {
    console.warn('[onboarding] sync to users table failed', error);
  }
}
