import { useQuery } from '@tanstack/react-query';
import { fetchEmergencyPhrases, type EmergencyGroup } from '../services/api/emergency';

/**
 * Fetch grouped emergency phrases from public.emergency_phrases.
 * Stale time 24h — content rarely changes.
 */
export function useEmergencyPhrases() {
  return useQuery<EmergencyGroup[]>({
    queryKey: ['emergency-phrases'],
    queryFn: fetchEmergencyPhrases,
    staleTime: 24 * 60 * 60 * 1000,
  });
}
