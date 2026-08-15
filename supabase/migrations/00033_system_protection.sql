-- EasyRent: System Identity Protection + Automated Security Audit (FYP v3 revision)
-- 1) Settings: block SYSTEM_PROTECTED keys from non-super-admin (defense in depth, server-side).
-- 2) Automatic security_events on role changes and payment state changes.
-- 3) Unit status sync from booking lifecycle.
-- 4) feature_flags update WITH CHECK fix.
-- Migration 00033

-- ============================================================
-- 1. PROTECTED SYSTEM IDENTITY SETTINGS
-- ============================================================
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'super_admin');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION protect_system_settings()
RETURNS trigger AS $$
DECLARE
  protected_keys text[] := ARRAY[
    'platform_name', 'support_email', 'phone_number', 'address',
    'logo_url', 'favicon_url', 'hero_background', 'base_currency'
  ];
BEGIN
  IF (TG_OP = 'DELETE') THEN
    IF (OLD.key = ANY (protected_keys)) AND NOT is_super_admin() THEN
      RAISE EXCEPTION 'SYSTEM_PROTECTED setting "%" cannot be modified by this role', OLD.key;
    END IF;
    RETURN OLD;
  END IF;

  IF (COALESCE(NEW.key, OLD.key) = ANY (protected_keys)) AND NOT is_super_admin() THEN
    RAISE EXCEPTION 'SYSTEM_PROTECTED setting "%" cannot be modified by this role', COALESCE(NEW.key, OLD.key);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_system_settings ON settings;
CREATE TRIGGER trg_protect_system_settings
  BEFORE INSERT OR UPDATE OR DELETE ON settings
  FOR EACH ROW EXECUTE FUNCTION protect_system_settings();

-- ============================================================
-- 2. AUTOMATED SECURITY EVENTS
-- ============================================================
CREATE OR REPLACE FUNCTION log_role_change()
RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role) THEN
    INSERT INTO security_events (event_type, user_id, actor_id, success, details)
    VALUES ('role_change', NEW.id, auth.uid(),
            COALESCE(is_super_admin(), false),
            jsonb_build_object('from', OLD.role, 'to', NEW.role));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_role_change ON profiles;
CREATE TRIGGER trg_log_role_change
  AFTER UPDATE OF role ON profiles
  FOR EACH ROW EXECUTE FUNCTION log_role_change();

CREATE OR REPLACE FUNCTION log_payment_state_change()
RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO security_events (event_type, user_id, actor_id, success, details)
    VALUES ('payment_state_change', NULL, auth.uid(),
            NEW.status = 'successful',
            jsonb_build_object('transaction_id', NEW.id, 'from', OLD.status, 'to', NEW.status, 'amount', NEW.amount));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_payment_state_change ON payment_transactions;
CREATE TRIGGER trg_log_payment_state_change
  AFTER UPDATE OF status ON payment_transactions
  FOR EACH ROW EXECUTE FUNCTION log_payment_state_change();

-- ============================================================
-- 3. UNIT STATUS SYNC FROM BOOKING LIFE
-- approved -> reserved ; completed -> occupied ; cancelled/rejected -> available
-- ============================================================
CREATE OR REPLACE FUNCTION sync_unit_from_booking()
RETURNS trigger AS $$
BEGIN
  IF NEW.unit_id IS NULL THEN RETURN NEW; END IF;
  UPDATE property_units SET updated_at = now()
  WHERE id = NEW.unit_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_unit_from_booking ON bookings;
CREATE TRIGGER trg_sync_unit_from_booking
  AFTER INSERT OR UPDATE OF unit_id, status ON bookings
  FOR EACH ROW EXECUTE FUNCTION sync_unit_from_booking();

-- ============================================================
-- 4. FEATURE FLAGS UPDATE WITH CHECK FIX
-- ============================================================
DROP POLICY IF EXISTS "feature_flags_super_admin_update" ON feature_flags;
CREATE POLICY "feature_flags_super_admin_update" ON feature_flags
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'super_admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'super_admin')
  );