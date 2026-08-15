-- EasyRent: Analytics Views + Reporting Functions (FYP v3 revision, priority 11)
-- Metrics are computed in the database, not inside React components.
-- Views are security_barrier so underlying RLS still applies.
-- Migration 00032

-- Occupancy per property (from unit statuses)
CREATE OR REPLACE VIEW v_property_occupancy
WITH (security_barrier = true)
AS
SELECT
  p.id AS property_id,
  p.title,
  count(u.id) AS total_units,
  count(u.id) FILTER (WHERE u.status = 'occupied') AS occupied_units,
  count(u.id) FILTER (WHERE u.status = 'reserved') AS reserved_units,
  count(u.id) FILTER (WHERE u.status = 'available') AS available_units,
  CASE WHEN count(u.id) = 0 THEN 0
       ELSE round((count(u.id) FILTER (WHERE u.status = 'occupied')::numeric / count(u.id)) * 100, 1)
  END AS occupancy_rate
FROM properties p
LEFT JOIN property_units u ON u.property_id = p.id AND u.is_active = true
GROUP BY p.id;

-- Monthly revenue from completed payments
CREATE OR REPLACE VIEW v_monthly_revenue
WITH (security_barrier = true)
AS
SELECT
  date_trunc('month', created_at) AS month,
  sum(amount) FILTER (WHERE status = 'completed') AS revenue,
  count(*) FILTER (WHERE status = 'completed') AS successful_payments,
  count(*) AS total_payments
FROM payments
GROUP BY date_trunc('month', created_at)
ORDER BY 1 DESC;

-- Overdue rent ledger
CREATE OR REPLACE VIEW v_overdue_charges
WITH (security_barrier = true)
AS
SELECT
  rc.id,
  rc.tenant_id,
  rc.property_id,
  rc.unit_id,
  rc.amount,
  rc.paid_amount,
  (rc.amount - rc.paid_amount) AS outstanding,
  rc.due_date,
  rc.status
FROM rent_charges rc
WHERE rc.status IN ('unpaid', 'partial', 'overdue')
  AND rc.due_date < CURRENT_DATE;

-- Active contracts
CREATE OR REPLACE VIEW v_active_contracts
WITH (security_barrier = true)
AS
SELECT c.*, pr.title AS property_title
FROM contracts c
LEFT JOIN properties pr ON pr.id = c.property_id
WHERE c.status = 'active';

-- Contracts expiring soon (within 30 days)
CREATE OR REPLACE VIEW v_expiring_contracts
WITH (security_barrier = true)
AS
SELECT c.*, pr.title AS property_title
FROM contracts c
LEFT JOIN properties pr ON pr.id = c.property_id
WHERE c.status = 'active'
  AND c.end_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '30 days');

-- Open maintenance requests
CREATE OR REPLACE VIEW v_open_maintenance
WITH (security_barrier = true)
AS
SELECT mr.*, pr.title AS property_title,
  (SELECT count(*) FROM maintenance_assignments ma WHERE ma.request_id = mr.id) AS assignment_count
FROM maintenance_requests mr
LEFT JOIN properties pr ON pr.id = mr.property_id
WHERE mr.status NOT IN ('resolved', 'closed');

-- Property views + booking conversion summary
CREATE OR REPLACE VIEW v_property_performance
WITH (security_barrier = true)
AS
SELECT
  p.id AS property_id,
  p.title,
  p.views_count,
  count(DISTINCT b.id) FILTER (WHERE b.status IN ('approved', 'completed')) AS bookings,
  count(DISTINCT r.id) AS reviews,
  round(avg(r.rating)::numeric, 1) AS avg_rating
FROM properties p
LEFT JOIN bookings b ON b.property_id = p.id
LEFT JOIN reviews r ON r.property_id = p.id
GROUP BY p.id;

-- Occupancy rate helper function
CREATE OR REPLACE FUNCTION get_occupancy_rate(prop_id uuid)
RETURNS numeric AS $$
DECLARE
  result numeric;
BEGIN
  SELECT round((count(*) FILTER (WHERE status = 'occupied')::numeric / NULLIF(count(*), 0)) * 100, 1)
  INTO result
  FROM property_units
  WHERE property_id = prop_id AND is_active = true;
  RETURN COALESCE(result, 0);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Monthly revenue helper function
CREATE OR REPLACE FUNCTION get_monthly_revenue(target_month date)
RETURNS numeric AS $$
DECLARE
  result numeric;
BEGIN
  SELECT COALESCE(sum(amount), 0)
  INTO result
  FROM payments
  WHERE status = 'completed'
    AND date_trunc('month', created_at) = date_trunc('month', target_month);
  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
