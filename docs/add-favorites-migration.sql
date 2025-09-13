-- Add is_favorite field to clips table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.clips 
ADD COLUMN is_favorite BOOLEAN DEFAULT FALSE NOT NULL;

-- Add index for faster favorite queries
CREATE INDEX idx_clips_is_favorite ON public.clips(user_id, is_favorite) WHERE is_favorite = TRUE;

-- Update the search vector to include favorite status (optional)
-- This allows searching for favorites
ALTER TABLE public.clips 
DROP COLUMN search_vector;

ALTER TABLE public.clips 
ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(text_content, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(notes, '')), 'C') ||
  setweight(to_tsvector('english', coalesce(url, '')), 'D') ||
  setweight(to_tsvector('english', CASE WHEN is_favorite THEN 'favorite starred' ELSE '' END), 'D')
) STORED;

-- Recreate the search index
CREATE INDEX idx_clips_search_vector ON public.clips USING GIN (search_vector);
