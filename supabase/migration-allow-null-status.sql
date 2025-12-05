-- Migration to allow NULL status for grocery items
-- This allows items to exist in the master list without being on the shopping list

-- Drop the existing CHECK constraint
ALTER TABLE grocery_items
DROP CONSTRAINT IF EXISTS grocery_items_status_check;

-- Modify the status column to allow NULL
ALTER TABLE grocery_items
ALTER COLUMN status DROP NOT NULL;

-- Add a new CHECK constraint that allows NULL or valid status values
ALTER TABLE grocery_items
ADD CONSTRAINT grocery_items_status_check
CHECK (status IS NULL OR status IN ('pending', 'purchased', 'skipped'));

-- Update the index to include NULL values
DROP INDEX IF EXISTS idx_grocery_items_status;
CREATE INDEX idx_grocery_items_status ON grocery_items(status) WHERE status IS NOT NULL;
