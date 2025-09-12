/**
 * Utility functions for extracting URLs from various data structures
 */

/**
 * Regular expression to match HTTP and HTTPS URLs
 */
const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;

/**
 * Recursively extracts URLs from any data structure (objects, arrays, strings)
 * @param data - The data to extract URLs from
 * @returns Array of unique URLs found in the data
 */
export const extractUrls = (data: any): string[] => {
  const foundUrls: string[] = [];

  const traverse = (obj: any) => {
    if (typeof obj === 'string') {
      const matches = obj.match(URL_REGEX);
      if (matches) {
        foundUrls.push(...matches);
      }
    } else if (Array.isArray(obj)) {
      obj.forEach(traverse);
    } else if (obj && typeof obj === 'object') {
      Object.values(obj).forEach(traverse);
    }
  };

  traverse(data);

  // Remove duplicates and return
  return [...new Set(foundUrls)];
};
