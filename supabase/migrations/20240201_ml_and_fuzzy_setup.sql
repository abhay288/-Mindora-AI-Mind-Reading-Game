-- 1. Fuzzy Logic Support
-- Add fuzzy_weight to answers table (confidence in the answer: 0.0 to 1.0)
-- Default to 1.0 (High confidence) for existing explicit answers
ALTER TABLE answers 
ADD COLUMN IF NOT EXISTS fuzzy_weight float DEFAULT 1.0;

-- 2. ML & OpenAI Support: Vector Embeddings
-- Enable the pgvector extension to work with embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create table for Entity Embeddings (for duplicate detection)
CREATE TABLE IF NOT EXISTS entity_embeddings (
  entity_id uuid REFERENCES entities(id) ON DELETE CASCADE,
  embedding vector(1536), -- Dimension for text-embedding-3-small
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (entity_id)
);

-- Index for faster similarity search
CREATE INDEX ON entity_embeddings USING hnsw (embedding vector_cosine_ops);

-- 3. Moderation Support
-- Queue for content flagging (managed by OpenAI or Admin)
CREATE TABLE IF NOT EXISTS moderation_queue (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_id uuid REFERENCES entities(id),
  image_url text, -- If flagging an image
  flagged_reason text,
  risk_score float, -- 0.0 to 1.0 (OpenAI Score)
  status text DEFAULT 'pending', -- pending, approved, rejected
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  resolved_at timestamp with time zone
);

COMMENT ON TABLE moderation_queue IS 'Queue for content flagged by OpenAI or Users for Admin review';
