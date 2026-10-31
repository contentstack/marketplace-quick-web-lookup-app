import { describe, expect, it, vi } from 'vitest';
import { fetchLinkPreview, PeekalinkError, PeekalinkErrorType } from './peekalinkApi';
import { jsonResponse, peek } from '../test-utils/fixtures';

const call = (res: unknown) => {
  const api = vi.fn().mockResolvedValue(res);
  return { api, run: (url = 'https://x.example') => fetchLinkPreview({ api }, url) };
};

describe('fetchLinkPreview', () => {
  it('posts the link through the app proxy using the mapped API key placeholder', async () => {
    const { api, run } = call(jsonResponse(peek('https://x.example')));
    await run();
    const [path, init] = api.mock.calls[0];
    expect(path).toBe('/preview');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ link: 'https://x.example' });
    // the real key never appears in the app; the proxy substitutes the mapping
    expect(JSON.stringify(init.headers)).toContain('{{map.API_KEY}}');
  });

  it('maps a success body to a preview', async () => {
    const { run } = call(jsonResponse(peek('https://x.example', { id: 42 })));
    expect(await run()).toMatchObject({
      id: '42',
      url: 'https://x.example',
      originalUrl: 'https://x.example',
      title: 'Title of https://x.example',
      siteName: 'Example',
      ok: true,
    });
  });

  it('falls back to the requested url for id and url, and ok to false', async () => {
    const { run } = call(jsonResponse({}));
    expect(await run('https://orig.example')).toMatchObject({
      id: 'https://orig.example',
      url: 'https://orig.example',
      ok: false,
    });
  });

  it.each([
    [400, PeekalinkErrorType.LINK_CONTENT_ERROR, /Invalid URL/],
    [401, PeekalinkErrorType.UNAUTHORIZED, /Unauthorized/],
    [403, PeekalinkErrorType.FORBIDDEN, /Forbidden/],
    [429, PeekalinkErrorType.RATE_LIMITED, /Rate Limited/],
    [500, PeekalinkErrorType.SERVER_ERROR, /Server error/],
    [503, PeekalinkErrorType.SERVER_ERROR, /Server error/],
    [418, PeekalinkErrorType.UNKNOWN, /HTTP 418: teapot/],
  ])('maps HTTP %i to %s', async (status, type, message) => {
    const { run } = call(jsonResponse('teapot', status));
    const err = await run().catch((e) => e);
    expect(err).toBeInstanceOf(PeekalinkError);
    expect(err.type).toBe(type);
    expect(err.statusCode).toBe(status);
    expect(err.message).toMatch(message);
  });

  it('uses a generic message for an empty unknown error body', async () => {
    const { run } = call({ ok: false, status: 404, text: async () => '' });
    await expect(run()).rejects.toThrow('HTTP 404: Request failed');
  });

  it('treats a 2xx response carrying status >= 400 as a content error', async () => {
    const { run } = call(jsonResponse({ ok: false, status: 404 }));
    await expect(run()).rejects.toMatchObject({ type: PeekalinkErrorType.LINK_CONTENT_ERROR });
  });

  it('lets a network failure through', async () => {
    const api = vi.fn().mockRejectedValue(new Error('offline'));
    await expect(fetchLinkPreview({ api }, 'https://x.example')).rejects.toThrow('offline');
  });
});
