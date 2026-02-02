-- Add theme column to sessions
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS theme text;

-- Add category column to questions
ALTER TABLE questions ADD COLUMN IF NOT EXISTS category text DEFAULT 'general';

-- Update RLS if needed (Admin-only UPDATE policies likely cover this, but good to ensure)
-- No RLS changes needed for adding columns usually if policy covers 'all columns'.
