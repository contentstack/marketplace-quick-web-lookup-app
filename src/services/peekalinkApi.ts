import { LinkPreview, PeekalinkResponse } from '../types/linkPreview';

/**
 * Peekalink API service with clean architecture and proper error handling
 */

// Error types for better error categorization
export enum PeekalinkErrorType {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  RATE_LIMITED = 'RATE_LIMITED',
  SERVER_ERROR = 'SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  UNKNOWN = 'UNKNOWN',
  LINK_CONTENT_ERROR = 'LINK_CONTENT_ERROR',
}

// Error class for Peekalink-specific errors
export class PeekalinkError extends Error {
  constructor(
    message: string,
    public type: PeekalinkErrorType,
    public statusCode?: number,
    public originalError?: any,
  ) {
    super(message);
    this.name = 'PeekalinkError';
  }
}

/**
 * Transforms Peekalink API response to LinkPreview format
 */
function transformResponse(data: PeekalinkResponse, originalUrl: string): LinkPreview {
  return {
    id: data.id?.toString() || originalUrl,
    url: data.url || originalUrl,
    originalUrl: originalUrl,
    title: data.title,
    description: data.description,
    image: data.image,
    domain: data.domain,
    siteName: data.siteName,
    ok: data.ok || false,
  };
}

/**
 * Handles HTTP response errors with proper error categorization
 */
function handleHttpError(response: Response, errorText: string): never {
  const status = response.status;
  let errorType: PeekalinkErrorType;
  let message: string;

  switch (status) {
    case 400:
      errorType = PeekalinkErrorType.LINK_CONTENT_ERROR;
      message = 'Invalid URL: The URL may be invalid or currently unreachable.';
      break;
    case 401:
      errorType = PeekalinkErrorType.UNAUTHORIZED;
      message = 'Unauthorized: Please check your API key';
      break;
    case 403:
      errorType = PeekalinkErrorType.FORBIDDEN;
      message = 'Forbidden: API key may be invalid or expired';
      break;
    case 429:
      errorType = PeekalinkErrorType.RATE_LIMITED;
      message = 'Rate Limited: Too many requests. Please wait a moment and try again later.';
      break;
    default:
      if (status >= 500) {
        errorType = PeekalinkErrorType.SERVER_ERROR;
        message = 'Server error: Peekalink service is temporarily unavailable';
      } else {
        errorType = PeekalinkErrorType.UNKNOWN;
        message = `HTTP ${status}: ${errorText || 'Request failed'}`;
      }
  }

  throw new PeekalinkError(message, errorType, status, errorText);
}

/**
 * Fetches link preview from Peekalink API
 */
export async function fetchLinkPreview(appSdk: any, url: string): Promise<LinkPreview> {
  try {
    const response = await appSdk.api(`/preview`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer {{map.API_KEY}}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ link: url }),
    });

    // Handle HTTP errors
    if (!response.ok) {
      const errorText = await response.text();
      handleHttpError(response, errorText);
    }

    const data = await response.json();
    if (data.status >= 400) {
      throw new PeekalinkError(
        'The URL may be invalid or currently unreachable.',
        PeekalinkErrorType.LINK_CONTENT_ERROR,
      );
    }
    return transformResponse(data, url);
  } catch (err) {
    throw err;
  }
}
