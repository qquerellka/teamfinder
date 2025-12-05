-- CREATE OR REPLACE FUNCTION cleanup_old_notifications(p_days INT DEFAULT 90)
-- RETURNS INT AS $$
-- DECLARE
--   v_deleted INT;
-- BEGIN
--   DELETE FROM notification WHERE created_at < now() - (p_days || ' days')::interval;
--   GET DIAGNOSTICS v_deleted = ROW_COUNT;
--   RETURN v_deleted;
-- END; $$ LANGUAGE plpgsql;

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

CREATE OR REPLACE FUNCTION enforce_user_skill_limit() RETURNS TRIGGER AS $$
DECLARE
  cnt INTEGER;
BEGIN
  SELECT COUNT(*) INTO cnt FROM user_skill WHERE user_id = NEW.user_id;
  IF cnt >= 10 THEN
    RAISE EXCEPTION 'Too many skills forusers%, max is 10', NEW.user_id
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
