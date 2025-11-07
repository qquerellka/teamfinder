-- 03_tables_norm.sql
-- Нормализованные связи (m:n)

CREATE TABLE IF NOT EXISTS user_skill (
  user_id   BIGINT NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  skill_id  BIGINT NOT NULL REFERENCES skill(id)  ON DELETE RESTRICT,
  PRIMARY KEY (user_id, skill_id)
);

-- На всякий: удалить старый дубликат, если когда-то заводился
DROP TABLE IF EXISTS user_skills;
