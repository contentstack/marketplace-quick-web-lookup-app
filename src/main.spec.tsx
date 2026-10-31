import ContentstackAppSDK from '@contentstack/app-sdk';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { jsonResponse, makeSdk, peek, sidebarLocation } from './test-utils/fixtures';

vi.mock('@contentstack/app-sdk', () => ({ default: { init: vi.fn() } }));

// Contentstack loads the app at <host>/entry-sidebar and <host>/app-configuration (BrowserRouter), so the real entry must route on the path.
describe('entry', () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = '<div id="root"></div>';
  });

  it('renders the link previews at /entry-sidebar', async () => {
    const api = vi.fn().mockResolvedValue(jsonResponse(peek('https://one.example')));
    vi.mocked(ContentstackAppSDK.init).mockResolvedValue(
      makeSdk(sidebarLocation({ a: 'see https://one.example' }), api) as never,
    );
    window.history.pushState({}, '', '/entry-sidebar');
    await import('./main');
    await vi.waitFor(() => expect(document.body.textContent).toContain('Title of https://one.example'));
  });

  it('renders the API key form at /app-configuration', async () => {
    const installation = {
      getInstallationData: vi.fn().mockResolvedValue({ configuration: {}, serverConfiguration: {} }),
      setInstallationData: vi.fn(),
    };
    vi.mocked(ContentstackAppSDK.init).mockResolvedValue(makeSdk({ AppConfigWidget: { installation } }) as never);
    window.history.pushState({}, '', '/app-configuration');
    await import('./main');
    await vi.waitFor(() => expect(document.querySelector('input[name="peekalinkApiKey"]')).not.toBeNull());
  });

  it('renders the 404 page at an unknown path', async () => {
    vi.mocked(ContentstackAppSDK.init).mockResolvedValue(makeSdk() as never);
    window.history.pushState({}, '', '/nope');
    await import('./main');
    await vi.waitFor(() => expect(document.body.textContent).toContain('404: Not Found'));
  });
});
