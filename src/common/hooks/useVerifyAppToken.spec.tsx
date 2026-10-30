import { renderHook, waitFor } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { useVerifyAppToken } from './useVerifyAppToken';
import { jsonResponse, makeSigner } from '../../test-utils/fixtures';

let signer: ReturnType<typeof makeSigner>;
const fetchMock = vi.fn();

beforeAll(() => {
  signer = makeSigner();
});
beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

const publish = (signingKey: string) => fetchMock.mockResolvedValue(jsonResponse({ 'signing-key': signingKey }));
const verify = (jwt: string | null) => renderHook(() => useVerifyAppToken(jwt)).result;

describe('useVerifyAppToken', () => {
  it('skips verification and stays undecided without a token', () => {
    const result = verify(null);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.isValidAppToken).toBeNull();
  });

  it('accepts a token signed by the published key', async () => {
    publish(signer.publicPem);
    const result = verify(signer.sign());
    await waitFor(() => expect(result.current.isValidAppToken).toBe(true));
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/\.well-known\/public-keys\.json$/);
  });

  it('rejects a token signed by a different key', async () => {
    publish(makeSigner().publicPem);
    const result = verify(signer.sign());
    await waitFor(() => expect(result.current.isValidAppToken).toBe(false));
  });

  it('rejects an expired token', async () => {
    publish(signer.publicPem);
    const result = verify(signer.sign({ exp: Math.floor(Date.now() / 1000) - 600 }));
    await waitFor(() => expect(result.current.isValidAppToken).toBe(false));
  });

  it('rejects a malformed token', async () => {
    publish(signer.publicPem);
    const result = verify('not-a-jwt');
    await waitFor(() => expect(result.current.isValidAppToken).toBe(false));
  });

  it('rejects when the published key is empty', async () => {
    publish('  ');
    const result = verify(signer.sign());
    await waitFor(() => expect(result.current.isValidAppToken).toBe(false));
  });

  it('rejects when the public key request fails', async () => {
    fetchMock.mockRejectedValue(new Error('offline'));
    const result = verify(signer.sign());
    await waitFor(() => expect(result.current.isValidAppToken).toBe(false));
  });
});
