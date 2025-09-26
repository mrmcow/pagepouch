-- Add preview_image field to knowledge_graphs table
-- This will store base64 data URLs of graph preview images

ALTER TABLE public.knowledge_graphs 
ADD COLUMN IF NOT EXISTS preview_image TEXT;

-- Add index for faster queries when filtering by preview availability
CREATE INDEX IF NOT EXISTS idx_knowledge_graphs_preview_image 
ON public.knowledge_graphs(preview_image) 
WHERE preview_image IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.knowledge_graphs.preview_image IS 
'Base64 data URL of graph preview image (PNG format, 320x180px)';
