-- EasyRent: Property Units (FYP v3 revision, priority 2)
-- A property may contain multiple rentable units. Bookings/contracts reference a unit.
-- Migration 00025

CREATE TABLE IF NOT EXISTS property_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  unit_number text,
  floor text,
  bedrooms integer DEFAULT 1,
  bathrooms integer DEFAULT 1,
  monthly_rent numeric(12, 0) NOT NULL,
  deposit_amount numeric(12, 0),
  status text NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'reserved', 'occupied', 'maintenance', 'unavailable')),
  available_from date,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_property_units_property ON property_units(property_id);
CREATE INDEX IF NOT EXISTS idx_property_units_status ON property_units(status);

-- Reference a unit from bookings and contracts
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS unit_id uuid REFERENCES property_units(id) ON DELETE SET NULL;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS unit_id uuid REFERENCES property_units(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_unit ON bookings(unit_id);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE property_units ENABLE ROW LEVEL SECURITY;

-- Everyone can read active units
CREATE POLICY "property_units_public_select" ON property_units
  FOR SELECT USING (is_active = true OR EXISTS (
    SELECT 1 FROM properties p WHERE p.id = property_units.property_id
      AND (p.owner_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')))
  ));

-- Owners / admins can manage units of their properties
CREATE POLICY "property_units_owner_insert" ON property_units
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM properties p WHERE p.id = property_units.property_id
      AND (p.owner_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')))
  ));

CREATE POLICY "property_units_owner_update" ON property_units
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM properties p WHERE p.id = property_units.property_id
      AND (p.owner_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')))
  ));

CREATE POLICY "property_units_owner_delete" ON property_units
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM properties p WHERE p.id = property_units.property_id
      AND (p.owner_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')))
  ));
