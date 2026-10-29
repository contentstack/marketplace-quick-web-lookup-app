import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useLinkPreviews } from './useLinkPreviews';
import { MarketplaceAppContext } from '../contexts/marketplaceContext';
import { jsonResponse, makeSdk, peek } from '../../test-utils/fixtures';

const setup = (respond: (url: string) => unknown, entry: unknown) => {
  const api = vi.fn(async (_p: string, init: { body: string }) => respond(JSON.parse(init.body).link));
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MarketplaceAppContext.Provider value={{ appSdk: makeSdk({}, api) as never, appConfig: null }}>
      {children}
    </MarketplaceAppContext.Provider>
  );
  const view = renderHook((props: { entryData: unknown }) => useLinkPreviews(props as never), {
    wrapper,
    initialProps: { entryData: entry },
  });
  return { api, ...view };
};

const ok = (url: string) => jsonResponse(peek(url));

describe('useLinkPreviews', () => {
  it('does nothing for an entry without urls', () => {
    const { api, result } = setup(ok, { title: 'plain text', n: 3 });
    expect(result.current.urls).toEqual([]);
    expect(result.current.previews).toEqual([]);
    expect(api).not.toHaveBeenCalled();
  });

  it('does nothing for an empty entry', () => {
    const { api, result } = setup(ok, {});
    expect(result.current.urls).toEqual([]);
    expect(api).not.toHaveBeenCalled();
  });

  it('extracts urls from mixed field types and renders one preview per url', async () => {
    const entry = { text: 'https://a.example', rte: '<a href="https://b.example">b</a>', list: ['https://c.example'] };
    const { api, result } = setup(ok, entry);
    await waitFor(() => expect(result.current.previews).toHaveLength(3));
    expect(result.current.urls).toEqual(['https://a.example', 'https://b.example', 'https://c.example']);
    expect(api).toHaveBeenCalledTimes(3);
    expect(result.current.error).toBe('');
    expect(result.current.loading).toBe(false);
  });

  it('serves repeat urls from the cache, and refresh bypasses it', async () => {
    const { api, result, rerender } = setup(ok, { u: 'https://a.example' });
    await waitFor(() => expect(result.current.previews).toHaveLength(1));
    rerender({ entryData: { u: 'https://a.example', other: 'changed' } });
    await waitFor(() => expect(result.current.previews).toHaveLength(1));
    expect(api).toHaveBeenCalledTimes(1);
    await act(async () => result.current.refreshPreviews());
    await waitFor(() => expect(api).toHaveBeenCalledTimes(2));
  });

  it('refresh does nothing without urls', () => {
    const { api, result } = setup(ok, {});
    act(() => result.current.refreshPreviews());
    expect(api).not.toHaveBeenCalled();
  });

  it('shows one shared error and no cards when every url is rate limited (429)', async () => {
    const { result } = setup(() => jsonResponse('slow down', 429), { a: 'https://a.example', b: 'https://b.example' });
    await waitFor(() => expect(result.current.error).toMatch(/Rate Limited/));
    expect(result.current.previews).toEqual([]);
  });

  it('shows the shared error for a rejected key (401, as with a missing or wrong API key)', async () => {
    const { result } = setup(() => jsonResponse('no', 401), { a: 'https://a.example' });
    await waitFor(() => expect(result.current.error).toMatch(/Unauthorized/));
    expect(result.current.previews).toEqual([]);
  });

  it('keeps successes and failures side by side without a shared error', async () => {
    const respond = (u: string) => (u.includes('bad') ? jsonResponse('x', 400) : ok(u));
    const { result } = setup(respond, { a: 'https://good.example', b: 'https://bad.example' });
    await waitFor(() => expect(result.current.previews).toHaveLength(2));
    expect(result.current.error).toBe('');
    expect(result.current.previews.map((p) => p.ok)).toEqual([true, false]);
  });

  it('shows failed cards individually when the failures are of different kinds', async () => {
    const respond = (u: string) => (u.includes('bad') ? jsonResponse('x', 400) : jsonResponse('x', 401));
    const { result } = setup(respond, { a: 'https://good.example', b: 'https://bad.example' });
    await waitFor(() => expect(result.current.previews).toHaveLength(2));
    expect(result.current.error).toBe('');
  });

  it('keeps the network error message and shows the failed card', async () => {
    const { result } = setup(() => Promise.reject(new Error('offline')), { a: 'https://a.example' });
    await waitFor(() => expect(result.current.previews).toHaveLength(1));
    expect(result.current.previews[0]).toMatchObject({ ok: false, error: 'offline' });
    expect(result.current.previews[0].errorType).toBeUndefined();
  });

  it('uses a generic message when a non-Error is thrown', async () => {
    const { result } = setup(() => Promise.reject('boom'), { a: 'https://a.example' });
    await waitFor(() => expect(result.current.previews).toHaveLength(1));
    expect(result.current.previews[0].error).toBe('Failed to fetch preview');
  });

  it('falls back to a default message for common errors with no text, and clears it', async () => {
    const { result } = setup(() => jsonResponse('', 500), { a: 'https://a.example' });
    await waitFor(() => expect(result.current.error).toMatch(/Server error/));
    act(() => result.current.clearError());
    expect(result.current.error).toBe('');
  });

  it('clears previews when the entry loses its urls', async () => {
    const { result, rerender } = setup(ok, { a: 'https://a.example' });
    await waitFor(() => expect(result.current.previews).toHaveLength(1));
    rerender({ entryData: { a: 'none' } });
    await waitFor(() => expect(result.current.previews).toEqual([]));
  });
});
