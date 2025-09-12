import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchLinkPreview, PeekalinkErrorType } from '../../services/peekalinkApi';
import { LinkPreview, LinkPreviewCache } from '../../types/linkPreview';
import { extractUrls } from '../../utils/urlExtractor';
import { useAppSdk } from './useAppSdk';

interface UseLinkPreviewsOptions {
  entryData?: any;
}

interface UseLinkPreviewsReturn {
  previews: LinkPreview[];
  loading: boolean;
  error: string;
  urls: string[];
  refreshPreviews: () => void;
  clearError: () => void;
}

/**
 * Custom hook for managing link previews state and operations
 */
export const useLinkPreviews = ({ entryData }: UseLinkPreviewsOptions): UseLinkPreviewsReturn => {
  const [previews, setPreviews] = useState<LinkPreview[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Use refs for cache to persist across re-renders
  const cacheRef = useRef<LinkPreviewCache>({});

  const appSdk = useAppSdk();

  // Extract URLs from entry data
  const urls = useMemo(() => {
    if (entryData && Object.keys(entryData).length > 0) {
      return extractUrls(entryData);
    }
    return [];
  }, [entryData]);

  // Helper function to get preview from cache
  const getCachedPreview = useCallback((url: string): LinkPreview | null => {
    const cached = cacheRef.current[url];
    return cached && cached.ok ? cached : null;
  }, []);

  // Helper function to cache a successful preview
  const cachePreview = useCallback((url: string, preview: LinkPreview) => {
    if (preview.ok) {
      cacheRef.current[url] = preview;
    }
  }, []);

  // Helper function to fetch a single preview
  const fetchSinglePreview = useCallback(
    async (url: string, useCache: boolean): Promise<LinkPreview> => {
      // Check cache first if enabled
      if (useCache) {
        const cached = getCachedPreview(url);
        if (cached) {
          return cached;
        }
      }

      try {
        const preview = await fetchLinkPreview(appSdk, url);

        if (preview.ok) {
          cachePreview(url, preview);
        }
        return preview;
      } catch (err) {
        // Check if it's a PeekalinkError to preserve error type
        let errorMessage = 'Failed to fetch preview';
        let errorType: PeekalinkErrorType | undefined;

        if (err instanceof Error) {
          errorMessage = err.message;
          // Check if it's a PeekalinkError with type information
          if ('type' in err && typeof err.type === 'string') {
            errorType = err.type as PeekalinkErrorType;
          }
        }

        const fallbackPreview: LinkPreview = {
          id: url,
          url,
          originalUrl: url,
          ok: false,
          error: errorMessage,
          errorType: errorType,
        };

        return fallbackPreview;
      }
    },
    [appSdk, getCachedPreview, cachePreview],
  );

  // Helper function to determine error state
  const determineErrorState = useCallback((results: LinkPreview[]): string => {
    const successfulPreviews = results.filter((preview) => preview.ok);
    const failedPreviews = results.filter((preview) => !preview.ok);

    if (successfulPreviews.length === 0 && failedPreviews.length > 0) {
      // All previews failed - check if they all have common error types
      const commonErrorTypes = [
        PeekalinkErrorType.UNAUTHORIZED,
        PeekalinkErrorType.FORBIDDEN,
        PeekalinkErrorType.RATE_LIMITED,
        PeekalinkErrorType.SERVER_ERROR,
      ];

      // Check if all failed previews have one of the common error types
      const allHaveCommonErrors = failedPreviews.every(
        (preview) => preview.errorType && commonErrorTypes.includes(preview.errorType),
      );

      if (allHaveCommonErrors) {
        // All failed with common errors - show common error message
        const firstError = failedPreviews.find((p) => p.error)?.error;
        return firstError || 'Failed to load link previews';
      }

      // Some failed with different error types - don't show common error
      // Individual errors will be shown per resource
      return '';
    }

    // Some or all previews succeeded
    return '';
  }, []);

  // Helper function to determine which previews to show
  const determinePreviewsToShow = useCallback((results: LinkPreview[]): LinkPreview[] => {
    const successfulPreviews = results.filter((preview) => preview.ok);
    const failedPreviews = results.filter((preview) => !preview.ok);

    if (successfulPreviews.length === 0 && failedPreviews.length > 0) {
      // All failed - check if they all have common error types
      const commonErrorTypes = [
        PeekalinkErrorType.UNAUTHORIZED,
        PeekalinkErrorType.FORBIDDEN,
        PeekalinkErrorType.RATE_LIMITED,
        PeekalinkErrorType.SERVER_ERROR,
      ];
      const allHaveCommonErrors = failedPreviews.every(
        (preview) => preview.errorType && commonErrorTypes.includes(preview.errorType),
      );

      if (allHaveCommonErrors) {
        // All failed with common errors - show none (common error will be displayed)
        return [];
      }

      // Some failed with different error types - show failed previews for individual error display
      return failedPreviews;
    }

    // Show all previews (including failed ones for individual error indicators)
    return results;
  }, []);

  // Fetch previews for all URLs
  const fetchPreviews = useCallback(
    async (urlList: string[], useCache = true) => {
      if (!urlList.length) {
        setPreviews([]);
        setError('');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const previewPromises = urlList.map((url) => fetchSinglePreview(url, useCache));
        const results = await Promise.all(previewPromises);

        const errorMessage = determineErrorState(results);
        const previewsToShow = determinePreviewsToShow(results);

        setError(errorMessage);
        setPreviews(previewsToShow);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load previews';
        setError(errorMessage);
        setPreviews([]);
      } finally {
        setLoading(false);
      }
    },
    [fetchSinglePreview, determineErrorState, determinePreviewsToShow],
  );

  // Fetch previews when URLs change
  useEffect(() => {
    if (urls.length > 0) {
      fetchPreviews(urls);
    } else {
      setPreviews([]);
      setError('');
    }
  }, [urls, fetchPreviews]);

  // Refresh function (bypass cache)
  const refreshPreviews = useCallback(() => {
    if (urls.length > 0) {
      fetchPreviews(urls, false);
    }
  }, [urls, fetchPreviews]);

  // Clear error function
  const clearError = useCallback(() => {
    setError('');
  }, []);

  return {
    previews,
    loading,
    error,
    urls,
    refreshPreviews,
    clearError,
  };
};
