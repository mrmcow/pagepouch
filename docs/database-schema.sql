-- PagePouch Database Schema
-- Supabase PostgreSQL Database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Folders table
CREATE TABLE public.folders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL CHECK (length(name) <= 100),
  parent_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name, parent_id)
);

-- Tags table
CREATE TABLE public.tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL CHECK (length(name) <= 50),
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Clips table
CREATE TABLE public.clips (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  title TEXT NOT NULL CHECK (length(title) <= 200),
  screenshot_url TEXT,
  html_content TEXT,
  text_content TEXT,
  favicon_url TEXT,
  folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
  notes TEXT CHECK (length(notes) <= 10000),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Full-text search vector
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(text_content, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(notes, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(url, '')), 'D')
  ) STORED
);

-- Clip-Tag junction table
CREATE TABLE public.clip_tags (
  clip_id UUID REFERENCES public.clips(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (clip_id, tag_id)
);

-- User usage tracking (for quotas)
CREATE TABLE public.user_usage (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  clips_this_month INTEGER DEFAULT 0,
  storage_used_mb DECIMAL DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_clips_user_id ON public.clips(user_id);
CREATE INDEX idx_clips_folder_id ON public.clips(folder_id);
CREATE INDEX idx_clips_created_at ON public.clips(created_at DESC);
CREATE INDEX idx_clips_search_vector ON public.clips USING GIN(search_vector);
CREATE INDEX idx_clips_url_trgm ON public.clips USING GIN(url gin_trgm_ops);
CREATE INDEX idx_folders_user_id ON public.folders(user_id);
CREATE INDEX idx_folders_parent_id ON public.folders(parent_id);
CREATE INDEX idx_tags_user_id ON public.tags(user_id);
CREATE INDEX idx_clip_tags_clip_id ON public.clip_tags(clip_id);
CREATE INDEX idx_clip_tags_tag_id ON public.clip_tags(tag_id);

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clip_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can access own folders" ON public.folders
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own tags" ON public.tags
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own clips" ON public.clips
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own clip tags" ON public.clip_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.clips 
      WHERE clips.id = clip_tags.clip_id 
      AND clips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access own usage data" ON public.user_usage
  FOR ALL USING (auth.uid() = user_id);

-- Functions and triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON public.folders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clips_updated_at BEFORE UPDATE ON public.clips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_usage_updated_at BEFORE UPDATE ON public.user_usage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Create default inbox folder
  INSERT INTO public.folders (user_id, name, color)
  VALUES (NEW.id, 'Inbox', '#6B7280');
  
  -- Initialize usage tracking
  INSERT INTO public.user_usage (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update usage stats
CREATE OR REPLACE FUNCTION public.update_user_usage()
RETURNS TRIGGER AS $$
DECLARE
  current_month_start DATE;
BEGIN
  current_month_start := date_trunc('month', CURRENT_DATE);
  
  -- Reset monthly count if it's a new month
  UPDATE public.user_usage 
  SET 
    clips_this_month = CASE 
      WHEN last_reset_date < current_month_start THEN 1
      ELSE clips_this_month + 1
    END,
    last_reset_date = CASE
      WHEN last_reset_date < current_month_start THEN CURRENT_DATE
      ELSE last_reset_date
    END,
    updated_at = NOW()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger to update usage on new clip
CREATE TRIGGER on_clip_created
  AFTER INSERT ON public.clips
  FOR EACH ROW EXECUTE FUNCTION public.update_user_usage();

-- Function for full-text search
CREATE OR REPLACE FUNCTION public.search_clips(
  search_query TEXT DEFAULT '',
  user_uuid UUID DEFAULT auth.uid(),
  folder_uuid UUID DEFAULT NULL,
  tag_uuids UUID[] DEFAULT NULL,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  url TEXT,
  title TEXT,
  screenshot_url TEXT,
  favicon_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  folder_id UUID,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.url,
    c.title,
    c.screenshot_url,
    c.favicon_url,
    c.notes,
    c.created_at,
    c.updated_at,
    c.folder_id,
    CASE 
      WHEN search_query = '' THEN 0
      ELSE ts_rank(c.search_vector, plainto_tsquery('english', search_query))
    END as rank
  FROM public.clips c
  WHERE c.user_id = user_uuid
    AND (folder_uuid IS NULL OR c.folder_id = folder_uuid)
    AND (tag_uuids IS NULL OR EXISTS (
      SELECT 1 FROM public.clip_tags ct 
      WHERE ct.clip_id = c.id 
      AND ct.tag_id = ANY(tag_uuids)
    ))
    AND (
      search_query = '' OR 
      c.search_vector @@ plainto_tsquery('english', search_query)
    )
  ORDER BY 
    CASE WHEN search_query = '' THEN c.created_at END DESC,
    CASE WHEN search_query != '' THEN rank END DESC,
    c.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Storage buckets (to be created in Supabase dashboard)
-- screenshots: for storing page screenshots
-- favicons: for storing website favicons

-- Storage policies (to be applied in Supabase dashboard)
-- Users can upload to their own folder: user_id/
-- Users can read their own files
-- Public read access for shared clips (future feature)
