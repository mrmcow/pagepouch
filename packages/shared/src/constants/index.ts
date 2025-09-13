// Application constants

export const APP_CONFIG = {
  NAME: 'PagePouch',
  VERSION: '0.1.0',
  DESCRIPTION: 'The most frictionless way to capture, organize, and retrieve web content',
  WEBSITE: 'https://pagepouch.com',
  SUPPORT_EMAIL: 'support@pagepouch.com',
} as const;

export const SUBSCRIPTION_TIERS = {
  FREE: {
    name: 'Free',
    clips_per_month: 100,
    storage_limit_mb: 500,
    features: ['Basic capture', 'Simple search', 'Basic organization'],
  },
  PRO: {
    name: 'Pro',
    price_monthly: 6,
    clips_per_month: -1, // unlimited
    storage_limit_mb: 10000, // 10GB
    features: [
      'Unlimited captures',
      'Advanced search',
      'Team collaboration',
      'Export capabilities',
      'Priority support',
    ],
  },
} as const;

export const CAPTURE_LIMITS = {
  MAX_SCREENSHOT_SIZE_MB: 10,
  MAX_HTML_SIZE_MB: 5,
  MAX_TEXT_LENGTH: 1000000, // 1M characters
  MAX_TITLE_LENGTH: 200,
  MAX_NOTE_LENGTH: 10000,
  MAX_TAG_LENGTH: 50,
  MAX_FOLDER_NAME_LENGTH: 100,
} as const;

export const UI_CONSTANTS = {
  CLIPS_PER_PAGE: 20,
  SEARCH_DEBOUNCE_MS: 300,
  TOAST_DURATION_MS: 5000,
  ANIMATION_DURATION_MS: 200,
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'pagepouch_auth_token',
  USER_PREFERENCES: 'pagepouch_user_preferences',
  LAST_FOLDER: 'pagepouch_last_folder',
  LAST_TAGS: 'pagepouch_last_tags',
} as const;

export const API_ENDPOINTS = {
  CLIPS: '/api/clips',
  FOLDERS: '/api/folders',
  TAGS: '/api/tags',
  SEARCH: '/api/search',
  AUTH: '/api/auth',
  USER: '/api/user',
  UPLOAD: '/api/upload',
} as const;

export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Please sign in to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  RATE_LIMITED: 'Too many requests. Please try again later.',
  QUOTA_EXCEEDED: 'You have reached your monthly clip limit. Please upgrade to Pro.',
  INVALID_URL: 'Please enter a valid URL.',
  CAPTURE_FAILED: 'Failed to capture the page. Please try again.',
  UPLOAD_FAILED: 'Failed to upload the screenshot. Please try again.',
} as const;

export const SUCCESS_MESSAGES = {
  CLIP_SAVED: 'Page captured successfully!',
  CLIP_UPDATED: 'Clip updated successfully!',
  CLIP_DELETED: 'Clip deleted successfully!',
  FOLDER_CREATED: 'Folder created successfully!',
  FOLDER_UPDATED: 'Folder updated successfully!',
  FOLDER_DELETED: 'Folder deleted successfully!',
  TAG_CREATED: 'Tag created successfully!',
  TAG_UPDATED: 'Tag updated successfully!',
  TAG_DELETED: 'Tag deleted successfully!',
} as const;

export const EXTENSION_EVENTS = {
  CAPTURE_PAGE: 'CAPTURE_PAGE',
  CAPTURE_SUCCESS: 'CAPTURE_SUCCESS',
  CAPTURE_ERROR: 'CAPTURE_ERROR',
  GET_AUTH_TOKEN: 'GET_AUTH_TOKEN',
  AUTH_TOKEN_RESPONSE: 'AUTH_TOKEN_RESPONSE',
} as const;

export const DEFAULT_FOLDER = {
  id: 'inbox',
  name: 'Inbox',
  color: '#6B7280',
} as const;
