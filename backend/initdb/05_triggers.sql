-- 05_triggers.sql
-- Функции и триггеры

-- 1) Автообновление updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_set_updated_at ON users;
CREATE TRIGGER trg_users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_skill_set_updated_at ON skill;
CREATE TRIGGER trg_skill_set_updated_at
BEFORE UPDATE ON skill
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 2) Лимит: максимум 10 навыков у одного пользователя
CREATE OR REPLACE FUNCTION enforce_max_10_skills()
RETURNS TRIGGER AS $$
DECLARE
  cnt INTEGER;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT COUNT(*) INTO cnt FROM user_skill WHERE user_id = NEW.user_id;
    IF cnt >= 10 THEN
      RAISE EXCEPTION 'User % already has 10 skills', NEW.user_id
        USING ERRCODE = '23514'; -- check_violation
    END IF;

  ELSIF TG_OP = 'UPDATE' THEN
    -- на случай смены user_id/skill_id
    SELECT COUNT(*) INTO cnt FROM user_skill WHERE user_id = NEW.user_id;
    IF cnt > 10 THEN
      RAISE EXCEPTION 'User % exceeds 10 skills', NEW.user_id
        USING ERRCODE = '23514';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_skill_max10 ON user_skill;
CREATE TRIGGER trg_user_skill_max10
BEFORE INSERT OR UPDATE ON user_skill
FOR EACH ROW EXECUTE FUNCTION enforce_max_10_skills();
