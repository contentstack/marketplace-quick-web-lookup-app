import { describe, expect, it } from 'vitest';
import { extractUrls } from './urlExtractor';
import { calculateModalSize, selectBestImageUrl } from './imageUtils';
import { MODAL_SIZES } from '../common/constants/layout';
import { LinkPreview } from '../types/linkPreview';

describe('extractUrls', () => {
  it('finds urls in a plain text field', () => {
    expect(extractUrls({ body: 'see https://a.example/x and http://b.example' })).toEqual([
      'https://a.example/x',
      'http://b.example',
    ]);
  });

  it('finds urls in rich text html, link fields, arrays and groups, once each', () => {
    const entry = {
      rte: '<p><a href="https://rte.example/p?q=1">link</a></p>',
      link: { title: 'x', href: 'https://link.example' },
      multi: ['https://m1.example', 'no url', 'https://m1.example'],
      group: [{ inner: { url: 'https://deep.example' } }],
    };
    expect(extractUrls(entry)).toEqual([
      'https://rte.example/p?q=1',
      'https://link.example',
      'https://m1.example',
      'https://deep.example',
    ]);
  });

  it('ignores numbers, booleans, null and non-http schemes', () => {
    expect(extractUrls({ a: 1, b: true, c: null, d: 'ftp://x.example mailto:a@b.c', e: undefined })).toEqual([]);
  });

  it('finds a bare string and handles empty input', () => {
    expect(extractUrls('https://s.example')).toEqual(['https://s.example']);
    expect(extractUrls(null)).toEqual([]);
  });
});

describe('selectBestImageUrl', () => {
  const p = (image?: LinkPreview['image']) => ({ id: 'i', url: 'u', originalUrl: 'u', ok: true, image });
  const img = (u: string) => ({ url: u, width: 1, height: 1 });

  it('returns null without an image', () => {
    expect(selectBestImageUrl(p(), 700)).toBeNull();
  });

  it('prefers large on wide containers and falls back', () => {
    expect(selectBestImageUrl(p({ large: img('L'), medium: img('M'), thumbnail: img('T') }), 600)).toBe('L');
    expect(selectBestImageUrl(p({ medium: img('M'), thumbnail: img('T') }), 600)).toBe('M');
    expect(selectBestImageUrl(p({ thumbnail: img('T') }), 600)).toBe('T');
    expect(selectBestImageUrl(p({}), 600)).toBeNull();
  });

  it('prefers medium on mid containers and thumbnail on small ones', () => {
    expect(selectBestImageUrl(p({ medium: img('M'), thumbnail: img('T') }), 500)).toBe('M');
    expect(selectBestImageUrl(p({ thumbnail: img('T') }), 500)).toBe('T');
    expect(selectBestImageUrl(p({ medium: img('M'), thumbnail: img('T') }), 499)).toBe('T');
    expect(selectBestImageUrl(p({ medium: img('M') }), 100)).toBeNull();
  });
});

describe('calculateModalSize', () => {
  it.each([
    [700, 'XXLARGE'],
    [600, 'XXLARGE'],
    [500, 'XLARGE'],
    [400, 'LARGE'],
    [300, 'MEDIUM'],
    [299, 'SMALL'],
  ] as const)('width %i gives %s', (w, size) => {
    expect(calculateModalSize(w)).toBe(MODAL_SIZES[size]);
  });
});
