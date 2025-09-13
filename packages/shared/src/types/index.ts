import { z } from 'zod';

// User types
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  created_at: z.string().datetime(),
  subscription_tier: z.enum(['free', 'pro']).default('free'),
  avatar_url: z.string().url().optional(),
  full_name: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;

// Clip types
export const ClipSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  url: z.string().url(),
  title: z.string(),
  screenshot_url: z.string().url().optional(),
  html_content: z.string().optional(),
  text_content: z.string().optional(),
  favicon_url: z.string().url().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  folder_id: z.string().uuid().optional(),
  notes: z.string().optional(),
  is_favorite: z.boolean().default(false),
});

export type Clip = z.infer<typeof ClipSchema>;

// Folder types
export const FolderSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  parent_id: z.string().uuid().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  color: z.string().optional(),
});

export type Folder = z.infer<typeof FolderSchema>;

// Tag types
export const TagSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1).max(50),
  color: z.string().optional(),
  created_at: z.string().datetime(),
});

export type Tag = z.infer<typeof TagSchema>;

// Clip-Tag relationship
export const ClipTagSchema = z.object({
  clip_id: z.string().uuid(),
  tag_id: z.string().uuid(),
  created_at: z.string().datetime(),
});

export type ClipTag = z.infer<typeof ClipTagSchema>;

// API request/response types
export const CreateClipRequestSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  screenshot_data: z.string().optional(), // base64 encoded image
  html_content: z.string().optional(),
  text_content: z.string().optional(),
  favicon_url: z.string().url().optional(),
  folder_id: z.string().uuid().optional(),
  tag_ids: z.array(z.string().uuid()).optional(),
  notes: z.string().optional(),
});

export type CreateClipRequest = z.infer<typeof CreateClipRequestSchema>;

export const UpdateClipRequestSchema = z.object({
  title: z.string().optional(),
  folder_id: z.string().uuid().optional(),
  tag_ids: z.array(z.string().uuid()).optional(),
  notes: z.string().optional(),
});

export type UpdateClipRequest = z.infer<typeof UpdateClipRequestSchema>;

// Search types
export const SearchRequestSchema = z.object({
  query: z.string().optional(),
  folder_id: z.string().uuid().optional(),
  tag_ids: z.array(z.string().uuid()).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  sort_by: z.enum(['created_at', 'updated_at', 'title', 'relevance']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

export type SearchRequest = z.infer<typeof SearchRequestSchema>;

export const SearchResponseSchema = z.object({
  clips: z.array(ClipSchema),
  total_count: z.number(),
  has_more: z.boolean(),
});

export type SearchResponse = z.infer<typeof SearchResponseSchema>;

// Extension message types
export const ExtensionMessageSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('CAPTURE_PAGE'),
    payload: z.object({
      url: z.string().url(),
      title: z.string(),
      captureType: z.enum(['visible', 'fullPage']).optional(),
      html: z.string().optional(),
      text: z.string().optional(),
      favicon: z.string().url().optional(),
    }),
  }),
  z.object({
    type: z.literal('CAPTURE_PROGRESS'),
    payload: z.object({
      status: z.string(),
      message: z.string(),
    }),
  }),
  z.object({
    type: z.literal('CAPTURE_SUCCESS'),
    payload: z.object({
      synced: z.boolean(),
      error: z.string().optional(),
    }),
  }),
  z.object({
    type: z.literal('CAPTURE_ERROR'),
    payload: z.object({
      error: z.string(),
    }),
  }),
  z.object({
    type: z.literal('GET_AUTH_TOKEN'),
    payload: z.object({}),
  }),
  z.object({
    type: z.literal('AUTH_TOKEN_RESPONSE'),
    payload: z.object({
      token: z.string().optional(),
    }),
  }),
  z.object({
    type: z.literal('CANCEL_CAPTURE'),
    payload: z.object({}),
  }),
  z.object({
    type: z.literal('EXTRACT_PAGE_DATA'),
    payload: z.object({}),
  }),
]);

export type ExtensionMessage = z.infer<typeof ExtensionMessageSchema>;

// Error types
export const ApiErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  details: z.record(z.any()).optional(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

// Database table names (for consistency)
export const TABLE_NAMES = {
  USERS: 'users',
  CLIPS: 'clips',
  FOLDERS: 'folders',
  TAGS: 'tags',
  CLIP_TAGS: 'clip_tags',
} as const;

// Storage bucket names
export const STORAGE_BUCKETS = {
  SCREENSHOTS: 'screenshots',
  FAVICONS: 'favicons',
} as const;
