-- Add array columns for multiple files
ALTER TABLE subject_notes 
ADD COLUMN image_urls text[] DEFAULT ARRAY[]::text[];

-- Migrate existing single image_url to array
UPDATE subject_notes 
SET image_urls = ARRAY[image_url] 
WHERE image_url IS NOT NULL;

-- Drop old column
ALTER TABLE subject_notes 
DROP COLUMN image_url;

-- Add array columns for homeworks
ALTER TABLE homeworks 
ADD COLUMN file_urls text[] DEFAULT ARRAY[]::text[],
ADD COLUMN file_types text[] DEFAULT ARRAY[]::text[];

-- Migrate existing data
UPDATE homeworks 
SET file_urls = ARRAY[file_url],
    file_types = ARRAY[file_type]
WHERE file_url IS NOT NULL;

-- Drop old columns
ALTER TABLE homeworks 
DROP COLUMN file_url,
DROP COLUMN file_type;