import { createContext } from 'react';

export interface InstallationData {
  configuration: { [key: string]: unknown };
  serverConfiguration: { [key: string]: unknown };
}

export interface AppConfigurationContextType {
  installationData: InstallationData;
  setInstallationData: (data: {
    configuration: { [key: string]: unknown };
    serverConfiguration: { [key: string]: unknown };
  }) => Promise<void>;
  loading: boolean;
}

export const AppConfigurationContext = createContext<AppConfigurationContextType | undefined>(undefined);
