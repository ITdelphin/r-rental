-- EasyRent: Maintenance workflow status extension (FYP v3 revision, priority 8)
-- submitted -> acknowledged -> assigned -> in_progress -> completed -> verified -> closed
-- Migration 00034

UPDATE maintenance_requests SET status = 'submitted' WHERE status = 'open';

ALTER TABLE maintenance_requests DROP CONSTRAINT IF EXISTS maintenance_requests_status_check;
ALTER TABLE maintenance_requests ADD CONSTRAINT maintenance_requests_status_check
  CHECK (status IN ('submitted', 'acknowledged', 'assigned', 'in_progress', 'completed', 'verified', 'closed'));

ALTER TABLE maintenance_requests ALTER COLUMN status SET DEFAULT 'submitted';