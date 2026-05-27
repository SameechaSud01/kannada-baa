import { useQuery } from '@tanstack/react-query';
import { fetchKarnatakaFunFacts, type FunFact } from '../services/api/karnataka_fun_facts';

export function useKarnatakaFunFacts() {
  return useQuery<FunFact[]>({
    queryKey: ['karnataka-fun-facts'],
    queryFn: fetchKarnatakaFunFacts,
    staleTime: 24 * 60 * 60 * 1000,
  });
}
