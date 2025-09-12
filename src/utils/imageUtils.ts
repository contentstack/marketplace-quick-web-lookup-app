import { LAYOUT_BREAKPOINTS, MODAL_SIZES } from '../common/constants/layout';
import { LinkPreview } from '../types/linkPreview';

/**
 * Selects the best image URL based on container width and available image sizes
 */
export const selectBestImageUrl = (preview: LinkPreview, containerWidth: number): string | null => {
  if (!preview.image) return null;

  const { thumbnail, medium, large } = preview.image;

  // For larger containers (600px+), use large or medium images for better quality
  if (containerWidth >= LAYOUT_BREAKPOINTS.GRID_AUTO_FIT) {
    return large?.url || medium?.url || thumbnail?.url || null;
  }

  // For medium containers (500px-599px), use medium images for good balance
  if (containerWidth >= LAYOUT_BREAKPOINTS.TWO_COLUMN) {
    return medium?.url || thumbnail?.url || null;
  }

  // For small containers (<500px), use thumbnail for performance
  return thumbnail?.url || null;
};

/**
 * Calculates modal size based on container width
 */
export const calculateModalSize = (containerWidth: number) => {
  if (containerWidth >= LAYOUT_BREAKPOINTS.GRID_AUTO_FIT) {
    return MODAL_SIZES.XXLARGE;
  } else if (containerWidth >= LAYOUT_BREAKPOINTS.TWO_COLUMN) {
    return MODAL_SIZES.XLARGE;
  } else if (containerWidth >= LAYOUT_BREAKPOINTS.MEDIUM) {
    return MODAL_SIZES.LARGE;
  } else if (containerWidth >= LAYOUT_BREAKPOINTS.SMALL) {
    return MODAL_SIZES.MEDIUM;
  } else {
    return MODAL_SIZES.SMALL;
  }
};
