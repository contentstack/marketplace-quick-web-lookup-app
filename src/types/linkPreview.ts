import { PeekalinkErrorType } from '../services/peekalinkApi';

export interface LinkPreview {
  id: string;
  url: string;
  originalUrl: string; // Store the original input URL
  title?: string;
  description?: string;
  image?: {
    thumbnail?: {
      url: string;
      width: number;
      height: number;
    };
    medium?: {
      url: string;
      width: number;
      height: number;
    };
    large?: {
      url: string;
      width: number;
      height: number;
    };
    original?: {
      url: string;
      width: number;
      height: number;
    };
  };
  domain?: string;
  siteName?: string;
  ok: boolean;
  error?: string; // Store error message when API call fails
  errorType?: PeekalinkErrorType; // Store error type for better error categorization
}

export interface LinkPreviewCache {
  [url: string]: LinkPreview;
}

export interface ApiConfig {
  apiKey: string;
}

export interface PeekalinkRequest {
  link: string;
}

export interface PeekalinkResponse {
  ok: boolean;
  status?: number;
  error?: string;
  message?: string;
  details?: {
    limit?: string;
  };
  id?: string | number;
  url?: string;
  title?: string;
  description?: string;
  type?: string;
  updatedAt?: string;
  size?: number;
  redirected?: boolean;
  icon?: {
    url: string;
    width: number;
    height: number;
    backgroundColor: string;
  };
  image?: {
    thumbnail?: {
      url: string;
      width: number;
      height: number;
    };
    medium?: {
      url: string;
      width: number;
      height: number;
    };
    large?: {
      url: string;
      width: number;
      height: number;
    };
    original?: {
      url: string;
      width: number;
      height: number;
    };
  };
  domain?: string;
  siteName?: string;
  page?: {
    size: number;
    estimatedReadingTimeInMinutes: number;
    htmlUrl: string;
    markdownUrl: string;
    rawTextUrl: string;
  };
  requestId?: string;
}
