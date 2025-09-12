import { useContext } from 'react';
import {
  AppConfigurationContext,
  AppConfigurationContextType,
} from '../contexts/appConfigurationContext';

export const useInstallationData = () => {
  const { installationData, setInstallationData, loading } = useContext(
    AppConfigurationContext,
  ) as AppConfigurationContextType;
  return { installationData, setInstallationData, loading };
};
