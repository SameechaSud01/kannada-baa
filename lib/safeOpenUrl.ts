import * as Linking from 'expo-linking';

// Opens an external URL only if it is an https: URL. mailto: and tel: schemes
// are explicitly NOT supported here — call Linking.openURL directly for those.
// Any URL that came from a non-literal source (DB column, remote config, OAuth
// provider metadata, etc.) goes through this helper.
export function safeOpenUrl(url: string | null | undefined): Promise<void> {
  if (!url || typeof url !== 'string') return Promise.resolve();
  if (!/^https:\/\//i.test(url)) return Promise.resolve();
  return Linking.openURL(url).then(
    () => undefined,
    () => undefined,
  );
}
