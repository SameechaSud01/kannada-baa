import { useUserStore } from '../stores/useUserStore';
import { COPY, type CopyKey } from '../constants/copy';

export function useCopy() {
  const mode = useUserStore((s) => s.mode);
  return (key: CopyKey) => COPY[key][mode];
}
