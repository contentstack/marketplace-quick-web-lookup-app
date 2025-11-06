import React, { useCallback, useEffect, useState } from 'react';
import { AppConfigurationContext, InstallationData } from '../contexts/appConfigurationContext';
import { useAppLocation } from '../hooks/useAppLocation';

interface ChildProp {
  children: React.ReactNode;
}

export const AppConfigurationProvider = ({ children }: ChildProp) => {
  const [installationData, setInstallation] = useState<InstallationData>({
    configuration: {},
    serverConfiguration: {},
  });
  const [loading, setLoading] = useState<boolean>(true);
  const { location } = useAppLocation();

  useEffect(() => {
    if (location && !('installation' in location)) return;
    location?.installation
      .getInstallationData()
      .then((data: InstallationData) => {
        setInstallation(data);
        setLoading(false);
      })
      .catch((_err: Error) => {
        // Handle installation data error silently
      });
  }, [location]);

  const setInstallationData = useCallback(
    async (data: { configuration: { [key: string]: unknown }; serverConfiguration: { [key: string]: unknown } }) => {
      const newInstallationData: InstallationData = {
        configuration: { ...installationData.configuration, ...data.configuration },
        serverConfiguration: { ...installationData.serverConfiguration, ...data.serverConfiguration },
      };
      if (location && !('installation' in location)) return;
      await location?.installation.setInstallationData(newInstallationData);
      setInstallation(newInstallationData);
      setLoading(false);
    },
    [location, setInstallation, setLoading, installationData.configuration, installationData.serverConfiguration],
  );

  return (
    <AppConfigurationContext.Provider value={{ installationData, setInstallationData, loading }}>
      {children}
    </AppConfigurationContext.Provider>
  );
};
