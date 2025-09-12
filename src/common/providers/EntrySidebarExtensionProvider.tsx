import { isEmpty, isNull } from 'lodash';
import { useEffect, useState } from 'react';

import { EntrySidebarExtensionContext } from '../contexts/entrySidebarExtensionContext';
import { useAppLocation } from '../hooks/useAppLocation';
import { ChildProp } from '../types/types';

export const EntrySidebarExtensionProvider = ({ children }: ChildProp) => {
  const [entryData, setEntry] = useState({});
  const [loading, setLoading] = useState<boolean>(false);
  const { location } = useAppLocation();

  useEffect(() => {
    (async () => {
      let unsubscribeOnSave: () => void
      if (!isEmpty(entryData) || isNull(location)) return;
      setLoading(true);
      if ('entry' in location) {
        const entry: { [key: string]: unknown } | undefined = location?.entry?.getData();
        if (entry) {
          setEntry(entry);

          unsubscribeOnSave = location.entry.onSave((savedEntry: { [key: string]: unknown }) => {
            setEntry(savedEntry);
          });
        }
      }
      setLoading(false);
      return () => {
        if (unsubscribeOnSave && typeof unsubscribeOnSave === 'function') {
          unsubscribeOnSave();
        }
      };
    })();
  }, [entryData, location, setLoading, setEntry]);

  return (
    <EntrySidebarExtensionContext.Provider value={{ entryData, loading }}>
      {children}
    </EntrySidebarExtensionContext.Provider>
  );
};
