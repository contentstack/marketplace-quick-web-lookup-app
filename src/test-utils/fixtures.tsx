import { render } from '@testing-library/react';
import forge from 'node-forge';
import { KJUR } from 'jsrsasign';
import { vi } from 'vitest';
import { MarketplaceAppContext } from '../common/contexts/marketplaceContext';

let n = 0;
/** Unique fake id; fixtures never use literals for credentials. */
export const fakeId = (prefix: string) => `${prefix}-${++n}-${Math.random().toString(36).slice(2, 8)}`;

export const jsonResponse = (body: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
  text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
});

/** A Peekalink success body. */
export const peek = (url: string, extra: Record<string, unknown> = {}) => ({
  ok: true,
  id: fakeId('pk'),
  url,
  title: `Title of ${url}`,
  description: `About ${url}`,
  siteName: 'Example',
  image: {
    thumbnail: { url: `${url}/t.png`, width: 1, height: 1 },
    medium: { url: `${url}/m.png`, width: 2, height: 2 },
  },
  ...extra,
});

/** Fake SDK: `api` stands in for the app-config proxy (appSdk.api). */
export const makeSdk = (location: Record<string, unknown> = {}, api = vi.fn()) => ({
  api,
  getConfig: vi.fn().mockResolvedValue({}),
  location,
});

export const sidebarLocation = (entry: unknown, onSave = vi.fn(() => vi.fn())) => ({
  SidebarWidget: { entry: { getData: vi.fn(() => entry), onSave } },
});

export const renderWithSdk = (ui: React.ReactElement, appSdk: unknown) =>
  render(
    <MarketplaceAppContext.Provider value={{ appSdk: appSdk as never, appConfig: null }}>
      {ui}
    </MarketplaceAppContext.Provider>,
  );

/** Real RS256 keypair: returns the PKCS1 public PEM Contentstack publishes and a signer. */
export const makeSigner = () => {
  const { publicKey, privateKey } = forge.pki.rsa.generateKeyPair({ bits: 1024 });
  const privPem = forge.pki.privateKeyToPem(privateKey);
  const sign = (claims: Record<string, unknown> = {}) => {
    const now = Math.floor(Date.now() / 1000);
    return KJUR.jws.JWS.sign(
      'RS256',
      JSON.stringify({ alg: 'RS256', typ: 'JWT' }),
      JSON.stringify({ iat: now - 10, exp: now + 3600, ...claims }),
      privPem,
    );
  };
  return { publicPem: forge.pki.publicKeyToRSAPublicKeyPem(publicKey), sign };
};
