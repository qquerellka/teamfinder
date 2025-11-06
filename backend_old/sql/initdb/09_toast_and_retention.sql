-- Опциональная компрессия
-- ALTER TABLE "user"      SET (toast.compress = 'lz4');
-- ALTER TABLE application SET (toast.compress = 'lz4');
-- ALTER TABLE vacancy     SET (toast.compress = 'lz4');
-- ALTER TABLE notification SET (toast.compress = 'lz4');

CREATE OR REPLACE FUNCTION cleanup_old_notifications(p_days INT DEFAULT 90)
RETURNS INT AS $$
DECLARE
  v_deleted INT;
BEGIN
  DELETE FROM notification WHERE created_at < now() - (p_days || ' days')::interval;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION archive_inactive_interactions(p_days INT DEFAULT 90)
RETURNS INT AS $$
DECLARE
  v_deleted INT;
BEGIN
  DELETE FROM invite WHERE status IN ('rejected','expired') AND created_at < now() - (p_days || ' days')::interval;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  DELETE FROM response WHERE status IN ('rejected','withdrawn') AND created_at < now() - (p_days || ' days')::interval;
  v_deleted := v_deleted + ROW_COUNT;
  RETURN v_deleted;
END; $$ LANGUAGE plpgsql;
