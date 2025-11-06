import { useCallback, useEffect, useState } from 'react';
import { LAYOUT_BREAKPOINTS, LAYOUT_TYPES } from '../constants/layout';

interface UseResponsiveWidthOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  fallbackSelector?: string;
}

interface UseResponsiveWidthReturn {
  width: number;
  layoutType: 'single-column' | 'two-column' | 'grid-auto-fit';
  isTwoColumnLayout: boolean;
}

/**
 * Custom hook for responsive width detection and layout calculations
 * Centralizes the responsive logic used across multiple components
 */
export const useResponsiveWidth = ({
  containerRef,
  fallbackSelector,
}: UseResponsiveWidthOptions): UseResponsiveWidthReturn => {
  const [width, setWidth] = useState<number>(0);

  const updateWidth = useCallback(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const width = container.getBoundingClientRect().width;
      setWidth(width);
    } else if (fallbackSelector) {
      // Fallback to finding container by selector
      const fallbackContainer = document.querySelector(fallbackSelector);
      if (fallbackContainer) {
        const width = fallbackContainer.getBoundingClientRect().width;
        setWidth(width);
      }
    }
  }, [containerRef, fallbackSelector]);

  useEffect(() => {
    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    const handleResize = updateWidth;

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    } else if (fallbackSelector) {
      const fallbackContainer = document.querySelector(fallbackSelector);
      if (fallbackContainer) {
        resizeObserver.observe(fallbackContainer);
      }
    }

    window.addEventListener('resize', handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [updateWidth, containerRef, fallbackSelector]);

  const layoutType =
    width >= LAYOUT_BREAKPOINTS.GRID_AUTO_FIT
      ? LAYOUT_TYPES.GRID_AUTO_FIT
      : width >= LAYOUT_BREAKPOINTS.TWO_COLUMN
      ? LAYOUT_TYPES.TWO_COLUMN
      : LAYOUT_TYPES.SINGLE_COLUMN;

  const isTwoColumnLayout = width >= LAYOUT_BREAKPOINTS.TWO_COLUMN && width < LAYOUT_BREAKPOINTS.GRID_AUTO_FIT;

  return {
    width,
    layoutType,
    isTwoColumnLayout,
  };
};
