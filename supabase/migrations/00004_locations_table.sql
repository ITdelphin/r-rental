CREATE TABLE locations (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('province', 'district', 'sector', 'cell', 'village')),
  parent_code TEXT REFERENCES locations(code),
  slug TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_locations_type ON locations(type);
CREATE INDEX idx_locations_parent ON locations(parent_code);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone_can_read_locations" ON locations;
CREATE POLICY "anyone_can_read_locations" ON locations
  FOR SELECT
  TO anon, authenticated
  USING (true);
