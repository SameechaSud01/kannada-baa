/**
 * spec_docs/Sameecha/spec_security_hardening.md §3
 *
 * Truth table: only https: URLs reach Linking.openURL. Anything else
 * (http:, javascript:, file:, mailto:, null/undefined/non-string) is dropped.
 */

jest.mock('expo-linking', () => ({
  openURL: jest.fn(() => Promise.resolve()),
}));

import * as Linking from 'expo-linking';
import { safeOpenUrl } from '../../lib/safeOpenUrl';

const openURL = Linking.openURL as jest.Mock;

describe('safeOpenUrl', () => {
  beforeEach(() => {
    openURL.mockClear();
  });

  it('opens https URLs', async () => {
    await safeOpenUrl('https://example.com');
    expect(openURL).toHaveBeenCalledWith('https://example.com');
  });

  it('opens uppercase-scheme https URLs', async () => {
    await safeOpenUrl('HTTPS://EXAMPLE.COM');
    expect(openURL).toHaveBeenCalledWith('HTTPS://EXAMPLE.COM');
  });

  it('drops http URLs', async () => {
    await safeOpenUrl('http://example.com');
    expect(openURL).not.toHaveBeenCalled();
  });

  it('drops javascript: URLs', async () => {
    await safeOpenUrl('javascript:alert(1)');
    expect(openURL).not.toHaveBeenCalled();
  });

  it('drops file: URLs', async () => {
    await safeOpenUrl('file:///etc/passwd');
    expect(openURL).not.toHaveBeenCalled();
  });

  it('drops mailto: URLs', async () => {
    await safeOpenUrl('mailto:x@y.com');
    expect(openURL).not.toHaveBeenCalled();
  });

  it.each([null, undefined, '', 42 as unknown as string])(
    'drops non-string / empty input (%p)',
    async (input) => {
      await safeOpenUrl(input as string | null | undefined);
      expect(openURL).not.toHaveBeenCalled();
    },
  );

  it('swallows openURL rejection', async () => {
    openURL.mockRejectedValueOnce(new Error('nope'));
    await expect(safeOpenUrl('https://example.com')).resolves.toBeUndefined();
  });
});
