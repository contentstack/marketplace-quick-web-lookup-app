import React, { useRef } from 'react';
import { useInstallationData } from '../../common/hooks/useInstallationData';
import Tooltip from '../Tooltip/Tooltip';
import styles from './AppConfiguration.module.css';

const AppConfiguration: React.FC = () => {
  const { installationData, setInstallationData } = useInstallationData();
  const peekalinkApiKeyRef = useRef<HTMLInputElement>(null);

  const updateConfig = async () => {
    if (typeof setInstallationData !== 'undefined') {
      setInstallationData({
        configuration: {},
        serverConfiguration: {
          peekalink_api_key: peekalinkApiKeyRef.current?.value,
        },
      });
    }
  };

  return (
    <div className={`${styles.layoutContainer}`}>
      <div className={`${styles.appConfig}`}>
        <div className={`${styles.configWrapper}`}>
          <div className={`${styles.configContainer}`}>
            <div className={`${styles.infoContainerWrapper}`}>
              <div className={`${styles.infoContainer}`}>
                <div className={`${styles.labelWrapper}`}>
                  <label htmlFor="peekalinkApiKey">Peekalink API Key</label>
                  <Tooltip content="Enter your Peekalink API key to enable link preview functionality. Get your API key from https://peekalink.io/" />
                </div>
              </div>
              <div className={`${styles.inputContainer}`}>
                <input
                  type="text"
                  ref={peekalinkApiKeyRef}
                  required
                  value={(installationData.serverConfiguration.peekalink_api_key as string) || ''}
                  placeholder="Enter Peekalink API Key"
                  name="peekalinkApiKey"
                  autoComplete="off"
                  className={`${styles.fieldInput}`}
                  onChange={updateConfig}
                />
              </div>
            </div>
            <div className={`${styles.descriptionContainer}`}>
              <p>
                Your Peekalink API key is required to fetch link previews. <span>Get your API key from </span>
                <a href="https://peekalink.io/" target="_blank" rel="noopener noreferrer">
                  peekalink.io
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppConfiguration;
