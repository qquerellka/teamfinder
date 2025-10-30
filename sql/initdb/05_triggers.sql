CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_updated ON "user";
CREATE TRIGGER trg_user_updated BEFORE UPDATE ON "user"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_hack_updated ON hackathon;
CREATE TRIGGER trg_hack_updated BEFORE UPDATE ON hackathon
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_app_updated ON application;
CREATE TRIGGER trg_app_updated BEFORE UPDATE ON application
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_team_updated ON team;
CREATE TRIGGER trg_team_updated BEFORE UPDATE ON team
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_vac_updated ON vacancy;
CREATE TRIGGER trg_vac_updated BEFORE UPDATE ON vacancy
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION fn_check_one_team_per_hack()
RETURNS TRIGGER AS $$
DECLARE
  existing_count INT;
  target_hack_id BIGINT;
BEGIN
  SELECT hackathon_id INTO target_hack_id FROM team WHERE id = NEW.team_id;

  SELECT COUNT(*) INTO existing_count
  FROM team_member tm
  JOIN team t ON t.id = tm.team_id
  WHERE tm.user_id = NEW.user_id
    AND t.hackathon_id = target_hack_id;

  IF existing_count > 0 THEN
    RAISE EXCEPTION 'User % already in a team for hackathon %', NEW.user_id, target_hack_id
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_one_team_per_hack ON team_member;
CREATE TRIGGER trg_one_team_per_hack
BEFORE INSERT ON team_member
FOR EACH ROW EXECUTE FUNCTION fn_check_one_team_per_hack();
