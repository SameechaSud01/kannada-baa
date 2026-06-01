import { supabase } from './supabase';

export interface OnboardingRow {
  userId: string;
  name: string | null;
  learningMode: 'spoken' | 'written' | 'both' | null;
  motivations: string[];
  dailyGoalMinutes: 5 | 10 | 20 | null;
}

export type SyncResult = { ok: true } | { ok: false; error: unknown };

// Background retry for an onboarding row that failed to sync on first commit.
// Foreground onboarding goes through completeOnboarding() in ./users — that
// fetches the row back for hydration. This path is fire-and-record-result and
// is only invoked from the boot path (spec_security_hardening.md §6).
export async function syncOnboardingToSupabase(row: OnboardingRow): Promise<SyncResult> {
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
    return { ok: false, error };
  }
  return { ok: true };
}
