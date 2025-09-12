/**
 * Layout constants and breakpoints used throughout the application
 */

export const LAYOUT_BREAKPOINTS = {
  SMALL: 300,
  MEDIUM: 400,
  TWO_COLUMN: 500,
  GRID_AUTO_FIT: 600,
} as const;

export const LAYOUT_TYPES = {
  SINGLE_COLUMN: 'single-column',
  TWO_COLUMN: 'two-column',
  GRID_AUTO_FIT: 'grid-auto-fit',
} as const;

export const MODAL_SIZES = {
  SMALL: { width: '100%', maxWidth: '250px' },
  MEDIUM: { width: '100%', maxWidth: '280px' },
  LARGE: { width: '98%', maxWidth: '320px' },
  XLARGE: { width: '95%', maxWidth: '380px' },
  XXLARGE: { width: '90%', maxWidth: '450px' },
} as const;
