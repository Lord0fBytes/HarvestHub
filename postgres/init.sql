-- HarvestHub database schema

CREATE TABLE IF NOT EXISTS grocery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  status TEXT CHECK (status IS NULL OR status IN ('pending', 'purchased', 'skipped')),
  type TEXT NOT NULL DEFAULT 'grocery' CHECK (type IN ('grocery', 'supply', 'clothing', 'other')),
  stores TEXT[] NOT NULL DEFAULT '{}',
  aisle TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_grocery_items_status ON grocery_items(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_grocery_items_created_at ON grocery_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_grocery_items_type ON grocery_items(type);
CREATE INDEX IF NOT EXISTS idx_grocery_items_stores ON grocery_items USING GIN(stores);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_grocery_items_updated_at
  BEFORE UPDATE ON grocery_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
