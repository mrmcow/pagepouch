-- Remove the problematic index that's causing size limit issues
-- Base64 images are too large for PostgreSQL index limits

DROP INDEX IF EXISTS idx_knowledge_graphs_preview_image;

-- The preview_image column will still work fine without an index
-- since we're not doing complex queries on it
