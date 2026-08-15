-- EasyRent: Rent Ledger + Payment Reconciliation (FYP v3 revision, priority 5)
-- rent_charges = per-tenant ledger of rent, deposits, late fees.
-- payment_transactions = provider-level transaction state; success only from provider callback.
-- Migration 00027

CREATE TABLE IF NOT EXISTS rent_charges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  unit_id uuid REFERENCES property_units(id) ON DELETE SET NULL,
  contract_id uuid REFERENCES contracts(id) ON DELETE SET NULL,
  charge_type text NOT NULL
    CHECK (charge_type IN ('rent', 'deposit', 'late_fee', 'maintenance', 'other')),
  amount numeric(12, 0) NOT NULL,
  paid_amount numeric(12, 0) NOT NULL DEFAULT 0,
  due_date date,
  period_start date,
  period_end date,
  status text NOT NULL DEFAULT 'unpaid'
    CHECK (status IN ('unpaid', 'partial', 'paid', 'waived', 'overdue')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rent_charges_tenant ON rent_charges(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rent_charges_unit ON rent_charges(unit_id);
CREATE INDEX IF NOT EXISTS idx_rent_charges_status ON rent_charges(status);

CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid REFERENCES payments(id) ON DELETE SET NULL,
  rent_charge_id uuid REFERENCES rent_charges(id) ON DELETE SET NULL,
  provider text NOT NULL,
  provider_transaction_id text,
  external_reference text,
  amount numeric(12, 0) NOT NULL,
  currency text DEFAULT 'RWF',
  status text NOT NULL DEFAULT 'initiated'
    CHECK (status IN ('initiated', 'pending', 'successful', 'failed', 'cancelled', 'refunded')),
  raw_response jsonb,
  reconciled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_tx_payment ON payment_transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_tx_charge ON payment_transactions(rent_charge_id);
CREATE INDEX IF NOT EXISTS idx_payment_tx_status ON payment_transactions(status);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE rent_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Tenant sees own ledger; owner/admins see what they manage
CREATE POLICY "rent_charges_select"
  ON rent_charges FOR SELECT USING (
    tenant_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM properties p WHERE p.id = rent_charges.property_id AND p.owner_id = (SELECT id FROM profiles WHERE user_id = auth.uid()))
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "rent_charges_owner_insert"
  ON rent_charges FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM properties p WHERE p.id = rent_charges.property_id AND p.owner_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  ));

CREATE POLICY "rent_charges_owner_update"
  ON rent_charges FOR UPDATE USING (EXISTS (
    SELECT 1 FROM properties p WHERE p.id = rent_charges.property_id AND p.owner_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  ));

-- Payments transaction: select for tenant/owner/admin
CREATE POLICY "payment_tx_select"
  ON payment_transactions FOR SELECT USING (
    EXISTS (SELECT 1 FROM payments py
      WHERE py.id = payment_transactions.payment_id
        AND (py.payer_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
          OR py.payee_id = (SELECT id FROM profiles WHERE user_id = auth.uid())))
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Provider/server inserts + updates (reconciliation) via service_role; clients may initiate
CREATE POLICY "payment_tx_client_insert"
  ON payment_transactions FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "payment_tx_service_update"
  ON payment_transactions FOR UPDATE USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
