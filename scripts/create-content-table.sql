-- Create table for storing website content
CREATE TABLE IF NOT EXISTS website_content (
  id INTEGER PRIMARY KEY,
  content JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default content if table is empty
INSERT INTO website_content (id, content, updated_at)
SELECT 1, '{}', NOW()
WHERE NOT EXISTS (SELECT 1 FROM website_content WHERE id = 1);
