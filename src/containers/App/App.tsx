import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppConfigurationProvider } from '../../common/providers/AppConfigurationProvider';
import { EntrySidebarExtensionProvider } from '../../common/providers/EntrySidebarExtensionProvider';
import { MarketplaceAppProvider } from '../../common/providers/MarketplaceAppProvider';
import { ErrorBoundary } from '../../components/ErrorBoundary';
/**
 * Lazy loaded components for Link Preview Sidebar App
 */
const AppConfiguration = React.lazy(() => import('../AppConfiguration/AppConfiguration'));
const PageNotFound = React.lazy(() => import('../404/404'));
const EntrySidebarExtension = React.lazy(() => import('../SidebarWidget/EntrySidebar'));

function App() {
  return (
    <ErrorBoundary>
      <MarketplaceAppProvider>
        <Routes>
          <Route
            path="/entry-sidebar"
            element={
              <Suspense>
                <EntrySidebarExtensionProvider>
                  <EntrySidebarExtension />
                </EntrySidebarExtensionProvider>
              </Suspense>
            }
          />
          <Route
            path="/app-configuration"
            element={
              <Suspense>
                <AppConfigurationProvider>
                  <AppConfiguration />
                </AppConfigurationProvider>
              </Suspense>
            }
          />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </MarketplaceAppProvider>
    </ErrorBoundary>
  );
}

export default App;
