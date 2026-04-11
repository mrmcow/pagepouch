-- Add entities JSONB column to clips table
-- Stores extracted entities (people, orgs, emails, IPs, crypto addresses, etc.)
-- Run this in Supabase SQL Editor

ALTER TABLE public.clips ADD COLUMN IF NOT EXISTS entities JSONB DEFAULT NULL;

-- GIN index for fast JSONB containment queries (e.g. find all clips mentioning an email)
CREATE INDEX IF NOT EXISTS idx_clips_entities ON public.clips USING GIN (entities) WHERE entities IS NOT NULL;
