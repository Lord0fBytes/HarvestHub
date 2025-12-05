-- Create grocery_items table
CREATE TABLE grocery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'purchased', 'skipped')),
  store TEXT,
  aisle TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on status for faster filtering
CREATE INDEX idx_grocery_items_status ON grocery_items(status);

-- Create index on created_at for sorting
CREATE INDEX idx_grocery_items_created_at ON grocery_items(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE grocery_items ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for everyone (since this is a publicly accessible app)
CREATE POLICY "Allow all operations for everyone"
  ON grocery_items
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_grocery_items_updated_at
  BEFORE UPDATE ON grocery_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
