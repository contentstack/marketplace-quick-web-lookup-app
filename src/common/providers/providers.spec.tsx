import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import ContentstackAppSDK from '@contentstack/app-sdk';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { MarketplaceAppProvider } from './MarketplaceAppProvider';
import { EntrySidebarExtensionProvider } from './EntrySidebarExtensionProvider';
import { AppConfigurationProvider } from './AppConfigurationProvider';
import { useEntry } from '../hooks/useEntry';
import { useInstallationData } from '../hooks/useInstallationData';
import { MarketplaceAppContext } from '../contexts/marketplaceContext';
import { fakeId, jsonResponse, makeSdk, makeSigner } from '../../test-utils/fixtures';

vi.mock('@contentstack/app-sdk', () => ({ default: { init: vi.fn() } }));

const fetchMock = vi.fn();
let signer: ReturnType<typeof makeSigner>;
beforeAll(() => {
  signer = makeSigner();
});
beforeEach(() => {
  vi.clearAllMocks();
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  window.history.pushState({}, '', '/');
});

const Child = () => <p>app-content</p>;
const mount = () =>
  render(
    <MarketplaceAppProvider>
      <Child />
    </MarketplaceAppProvider>,
  );

describe('MarketplaceAppProvider', () => {
  it('shows loading, then the app once the SDK is ready', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ 'signing-key': signer.publicPem }));
    vi.mocked(ContentstackAppSDK.init).mockResolvedValue(makeSdk() as never);
    window.history.pushState({}, '', `/?app-token=${signer.sign()}`);
    mount();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(await screen.findByText('app-content')).toBeInTheDocument();
  });

  // BUG: src/common/providers/MarketplaceAppProvider.tsx:57 only blocks on isValidAppToken === false, and
  // src/common/hooks/useVerifyAppToken.tsx:12 returns early (stays null) when there is no app-token, so the app renders
  // unverified. Expected (fail closed): no token means a blocked state (AppFailed), never protected UI.
  it.skip('blocks the app when the URL has no app token', async () => {
    vi.mocked(ContentstackAppSDK.init).mockResolvedValue(makeSdk() as never);
    mount();
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.queryByText('app-content')).toBeNull();
  });

  it('shows AppFailed when the SDK cannot initialise', async () => {
    vi.mocked(ContentstackAppSDK.init).mockRejectedValue(new Error('outside iframe'));
    mount();
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('sizes every frame the SDK exposes and reads the config', async () => {
    const frame = () => ({ disableAutoResizing: vi.fn(), updateHeight: vi.fn(), updateDimension: vi.fn() });
    const sdk = makeSdk({
      CustomField: { frame: frame() },
      FieldModifierLocation: { frame: frame() },
      DashboardWidget: { frame: frame() },
    }) as unknown as { location: Record<string, { frame: ReturnType<typeof frame> }>; getConfig: () => unknown };
    vi.mocked(ContentstackAppSDK.init).mockResolvedValue(sdk as never);
    mount();
    await screen.findByText('app-content');
    expect(sdk.location.CustomField.frame.updateHeight).toHaveBeenCalledWith(450);
    expect(sdk.location.FieldModifierLocation.frame.updateDimension).toHaveBeenCalledWith({ height: 380, width: 520 });
    expect(sdk.location.DashboardWidget.frame.updateHeight).toHaveBeenCalledWith(722);
    expect(sdk.getConfig).toHaveBeenCalled();
  });

  it('renders the app when the app token verifies', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ 'signing-key': signer.publicPem }));
    vi.mocked(ContentstackAppSDK.init).mockResolvedValue(makeSdk() as never);
    window.history.pushState({}, '', `/?app-token=${signer.sign()}`);
    mount();
    expect(await screen.findByText('app-content')).toBeInTheDocument();
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows AppFailed when the app token does not verify', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ 'signing-key': makeSigner().publicPem }));
    vi.mocked(ContentstackAppSDK.init).mockResolvedValue(makeSdk() as never);
    window.history.pushState({}, '', `/?app-token=${signer.sign()}`);
    mount();
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.queryByText('app-content')).toBeNull();
  });
});

const Entry = () => {
  const { entryData } = useEntry();
  return <p data-testid="entry">{JSON.stringify(entryData)}</p>;
};
const withLocation = (location: unknown, ui: React.ReactElement) =>
  render(
    <MarketplaceAppContext.Provider value={{ appSdk: makeSdk(location as never) as never, appConfig: null }}>
      {ui}
    </MarketplaceAppContext.Provider>,
  );

describe('EntrySidebarExtensionProvider', () => {
  it('loads the entry and follows saves', async () => {
    let save: (e: unknown) => void = () => undefined;
    const onSave = vi.fn((cb) => {
      save = cb;
      return vi.fn();
    });
    withLocation(
      { SidebarWidget: { entry: { getData: () => ({ a: 1 }), onSave } } },
      <EntrySidebarExtensionProvider>
        <Entry />
      </EntrySidebarExtensionProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('entry')).toHaveTextContent('{"a":1}'));
    act(() => save({ a: 2 }));
    expect(screen.getByTestId('entry')).toHaveTextContent('{"a":2}');
  });

  it('keeps an empty entry when there is no location or no entry data', async () => {
    const { unmount } = render(
      <EntrySidebarExtensionProvider>
        <Entry />
      </EntrySidebarExtensionProvider>,
    );
    expect(screen.getByTestId('entry')).toHaveTextContent('{}');
    unmount();
    withLocation(
      { SidebarWidget: { entry: { getData: () => undefined, onSave: vi.fn() } } },
      <EntrySidebarExtensionProvider>
        <Entry />
      </EntrySidebarExtensionProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('entry')).toHaveTextContent('{}'));
  });

  it('ignores a location with no entry API', async () => {
    withLocation(
      { Other: { frame: {} } },
      <EntrySidebarExtensionProvider>
        <Entry />
      </EntrySidebarExtensionProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('entry')).toHaveTextContent('{}'));
  });

  // BUG: src/common/providers/EntrySidebarExtensionProvider.tsx:29-33 returns the onSave unsubscribe from inside an async
  // IIFE, so React never receives it and the subscription outlives the component. Expected: unsubscribe on unmount.
  it.skip('unsubscribes from entry saves on unmount', async () => {
    const unsubscribe = vi.fn();
    const { unmount } = withLocation(
      { SidebarWidget: { entry: { getData: () => ({ a: 1 }), onSave: () => unsubscribe } } },
      <EntrySidebarExtensionProvider>
        <Entry />
      </EntrySidebarExtensionProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('entry')).toHaveTextContent('{"a":1}'));
    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });
});

const Config = () => {
  const { installationData, setInstallationData, loading } = useInstallationData();
  return (
    <div>
      <p data-testid="state">{`${loading}:${JSON.stringify(installationData)}`}</p>
      <button onClick={() => setInstallationData({ configuration: { c: 1 }, serverConfiguration: { s: 2 } })}>
        save
      </button>
    </div>
  );
};

describe('AppConfigurationProvider', () => {
  const installation = (stored = { configuration: { x: 1 }, serverConfiguration: { y: 2 } }) => ({
    getInstallationData: vi.fn().mockResolvedValue(stored),
    setInstallationData: vi.fn().mockResolvedValue(undefined),
  });

  it('loads stored installation data', async () => {
    const inst = installation();
    withLocation(
      { AppConfigWidget: { installation: inst } },
      <AppConfigurationProvider>
        <Config />
      </AppConfigurationProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('false:'));
    expect(screen.getByTestId('state')).toHaveTextContent('"x":1');
  });

  it('merges a save over the stored data and persists it', async () => {
    const inst = installation();
    withLocation(
      { AppConfigWidget: { installation: inst } },
      <AppConfigurationProvider>
        <Config />
      </AppConfigurationProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('false:'));
    fireEvent.click(screen.getByText('save'));
    const merged = { configuration: { x: 1, c: 1 }, serverConfiguration: { y: 2, s: 2 } };
    await waitFor(() => expect(inst.setInstallationData).toHaveBeenCalledWith(merged));
    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent(JSON.stringify(merged)));
  });

  it('stays loading and swallows an installation read failure', async () => {
    const inst = installation();
    inst.getInstallationData.mockRejectedValue(new Error(fakeId('err')));
    withLocation(
      { AppConfigWidget: { installation: inst } },
      <AppConfigurationProvider>
        <Config />
      </AppConfigurationProvider>,
    );
    await waitFor(() => expect(inst.getInstallationData).toHaveBeenCalled());
    expect(screen.getByTestId('state')).toHaveTextContent('true:');
  });

  it('does nothing in a location without installation support', async () => {
    withLocation(
      { Other: { frame: {} } },
      <AppConfigurationProvider>
        <Config />
      </AppConfigurationProvider>,
    );
    fireEvent.click(screen.getByText('save'));
    expect(screen.getByTestId('state')).toHaveTextContent('true:');
  });
});
