-- Migration to add type field and convert store to stores array
-- This allows items to have a type classification and be available at multiple stores

-- Add type column with default value 'grocery'
ALTER TABLE grocery_items
ADD COLUMN type TEXT NOT NULL DEFAULT 'grocery';

-- Add CHECK constraint for type
ALTER TABLE grocery_items
ADD CONSTRAINT grocery_items_type_check
CHECK (type IN ('grocery', 'supply', 'clothing', 'other'));

-- Add new stores column as text array
ALTER TABLE grocery_items
ADD COLUMN stores TEXT[] DEFAULT '{}';

-- Migrate existing store data to stores array
UPDATE grocery_items
SET stores = ARRAY[store]::TEXT[]
WHERE store IS NOT NULL AND store != '';

-- Drop the old store column
ALTER TABLE grocery_items
DROP COLUMN store;

-- Create index on type for filtering
CREATE INDEX idx_grocery_items_type ON grocery_items(type);

-- Create GIN index on stores array for efficient array operations
CREATE INDEX idx_grocery_items_stores ON grocery_items USING GIN(stores);
