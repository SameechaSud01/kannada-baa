import { supabase } from './supabase';

export type LearningMode = 'spoken' | 'written' | 'both';
export type DailyGoalMinutes = 5 | 10 | 20;

export type UserRow = {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  learning_mode: LearningMode | null;
  motivations: string[];
  daily_goal_minutes: DailyGoalMinutes | null;
  current_streak: number;
  onboarding_completed_at: string | null;
  created_at: string;
};

export async function fetchUserRow(userId: string): Promise<UserRow | null> {
  const { data, error } = await supabase
    .from('users')
    .select(
      'id, email, name, avatar_url, learning_mode, motivations, daily_goal_minutes, current_streak, onboarding_completed_at, created_at',
    )
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return (data as UserRow | null) ?? null;
}

export async function completeOnboarding(
  userId: string,
  input: {
    learning_mode: LearningMode;
    motivations: string[];
    daily_goal_minutes: DailyGoalMinutes;
  },
): Promise<UserRow> {
  const { data, error } = await supabase
    .from('users')
    .update({
      learning_mode: input.learning_mode,
      motivations: input.motivations,
      daily_goal_minutes: input.daily_goal_minutes,
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select(
      'id, email, name, avatar_url, learning_mode, motivations, daily_goal_minutes, current_streak, onboarding_completed_at, created_at',
    )
    .single();

  if (error) throw error;
  return data as UserRow;
}
