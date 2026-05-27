import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase config. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env (see .env.example).',
  );
}

// SecureStore (iOS Keychain) caps each item at ~2048 bytes. Supabase's
// serialized session blob (access token + refresh token + user metadata)
// routinely exceeds that, so we split the value across N keys and store the
// chunk count under `${key}_meta`. Chunk size is conservative for UTF-8.
const CHUNK_SIZE = 1500;

const ChunkedSecureStoreAdapter = {
  async getItem(key: string): Promise<string | null> {
    const meta = await SecureStore.getItemAsync(`${key}_meta`);
    if (!meta) {
      // Legacy single-key value written before chunking landed.
      return SecureStore.getItemAsync(key);
    }
    const count = parseInt(meta, 10);
    if (!Number.isFinite(count) || count <= 0) return null;
    const parts: string[] = [];
    for (let i = 0; i < count; i++) {
      const part = await SecureStore.getItemAsync(`${key}_${i}`);
      if (part === null) return null;
      parts.push(part);
    }
    return parts.join('');
  },
  async setItem(key: string, value: string): Promise<void> {
    const prevMeta = await SecureStore.getItemAsync(`${key}_meta`);
    const prevCount = prevMeta ? parseInt(prevMeta, 10) : 0;

    const chunks: string[] = [];
    for (let i = 0; i < value.length; i += CHUNK_SIZE) {
      chunks.push(value.slice(i, i + CHUNK_SIZE));
    }
    for (let i = 0; i < chunks.length; i++) {
      await SecureStore.setItemAsync(`${key}_${i}`, chunks[i]);
    }
    // If this write is shorter than the previous one, clean up the tail.
    for (let i = chunks.length; i < prevCount; i++) {
      await SecureStore.deleteItemAsync(`${key}_${i}`).catch(() => {});
    }
    await SecureStore.setItemAsync(`${key}_meta`, String(chunks.length));
    // Clear any legacy single-key value from before chunking.
    await SecureStore.deleteItemAsync(key).catch(() => {});
  },
  async removeItem(key: string): Promise<void> {
    const meta = await SecureStore.getItemAsync(`${key}_meta`);
    const count = meta ? parseInt(meta, 10) : 0;
    for (let i = 0; i < count; i++) {
      await SecureStore.deleteItemAsync(`${key}_${i}`).catch(() => {});
    }
    await SecureStore.deleteItemAsync(`${key}_meta`).catch(() => {});
    await SecureStore.deleteItemAsync(key).catch(() => {});
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ChunkedSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
