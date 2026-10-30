import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import EntrySidebarExtension from './SidebarWidget/EntrySidebar';
import AppConfiguration from './AppConfiguration/AppConfiguration';
import { EntrySidebarExtensionProvider } from '../common/providers/EntrySidebarExtensionProvider';
import { AppConfigurationProvider } from '../common/providers/AppConfigurationProvider';
import { MarketplaceAppContext } from '../common/contexts/marketplaceContext';
import { fakeId, jsonResponse, makeSdk, peek, sidebarLocation } from '../test-utils/fixtures';

const sidebar = (entry: unknown, respond: (url: string) => unknown) => {
  const api = vi.fn(async (_p: string, init: { body: string }) => respond(JSON.parse(init.body).link));
  render(
    <MarketplaceAppContext.Provider value={{ appSdk: makeSdk(sidebarLocation(entry), api) as never, appConfig: null }}>
      <EntrySidebarExtensionProvider>
        <EntrySidebarExtension />
      </EntrySidebarExtensionProvider>
    </MarketplaceAppContext.Provider>,
  );
  return api;
};
const ok = (u: string) => jsonResponse(peek(u));

describe('EntrySidebar', () => {
  beforeEach(() => vi.clearAllMocks());

  it('tells the editor when an entry has no urls', async () => {
    sidebar({ title: 'just text' }, ok);
    expect(await screen.findByText('No URLs Found')).toBeInTheDocument();
    expect(screen.getByText('0 URLs found')).toBeInTheDocument();
    expect(screen.queryByTitle('Refresh previews')).toBeNull();
  });

  it('renders a preview card for each url found in the entry', async () => {
    sidebar({ a: 'https://one.example', b: { rte: '<a href="https://two.example">x</a>' } }, ok);
    expect(await screen.findByText('Title of https://one.example')).toBeInTheDocument();
    expect(screen.getByText('Title of https://two.example')).toBeInTheDocument();
    expect(screen.getByText('2 URLs found')).toBeInTheDocument();
  });

  it('shows the Peekalink rate limit error with a working retry', async () => {
    let limited = true;
    const api = sidebar({ a: 'https://one.example' }, (u) => (limited ? jsonResponse('', 429) : ok(u)));
    expect(await screen.findByText(/Rate Limited/)).toBeInTheDocument();
    limited = false;
    fireEvent.click(screen.getByText('Try Again'));
    expect(await screen.findByText('Title of https://one.example')).toBeInTheDocument();
    expect(api).toHaveBeenCalledTimes(2);
  });

  it('shows an unauthorized error when the proxy has no valid key', async () => {
    sidebar({ a: 'https://one.example' }, () => jsonResponse('', 401));
    expect(await screen.findByText(/Unauthorized: Please check your API key/)).toBeInTheDocument();
  });

  it('summarises mixed results and refreshes from the header', async () => {
    const api = sidebar({ a: 'https://good.example', b: 'https://bad.example' }, (u) =>
      u.includes('bad') ? jsonResponse('', 400) : ok(u),
    );
    expect(await screen.findByText('1 successful, 1 failed')).toBeInTheDocument();
    fireEvent.click(screen.getByTitle('Refresh previews'));
    await waitFor(() => expect(api).toHaveBeenCalledTimes(4));
  });
});

describe('AppConfiguration', () => {
  const mountConfig = (stored: Record<string, unknown>) => {
    const inst = {
      getInstallationData: vi.fn().mockResolvedValue({ configuration: {}, serverConfiguration: stored }),
      setInstallationData: vi.fn().mockResolvedValue(undefined),
    };
    render(
      <MarketplaceAppContext.Provider
        value={{ appSdk: makeSdk({ AppConfigWidget: { installation: inst } }) as never, appConfig: null }}>
        <AppConfigurationProvider>
          <AppConfiguration />
        </AppConfigurationProvider>
      </MarketplaceAppContext.Provider>,
    );
    return inst;
  };

  it('shows an empty field when no API key is stored yet', async () => {
    const inst = mountConfig({});
    await waitFor(() => expect(inst.getInstallationData).toHaveBeenCalled());
    expect(screen.getByPlaceholderText('Enter Peekalink API Key')).toHaveValue('');
  });

  it('shows the stored API key', async () => {
    const stored = fakeId('stored');
    mountConfig({ peekalink_api_key: stored });
    await waitFor(() => expect(screen.getByPlaceholderText('Enter Peekalink API Key')).toHaveValue(stored));
  });

  it('saves what the admin types as the server-side Peekalink API key', async () => {
    const inst = mountConfig({});
    await waitFor(() => expect(inst.getInstallationData).toHaveBeenCalled());
    const typed = fakeId('typed');
    fireEvent.change(screen.getByPlaceholderText('Enter Peekalink API Key'), { target: { value: typed } });
    await waitFor(() =>
      expect(inst.setInstallationData).toHaveBeenCalledWith({
        configuration: {},
        serverConfiguration: { peekalink_api_key: typed },
      }),
    );
  });
});
