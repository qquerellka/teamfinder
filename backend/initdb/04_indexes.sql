-- 04_indexes.sql
-- Базовые индексы

-- users: поиск по username без учёта регистра
CREATE INDEX IF NOT EXISTS ix_users_username_ci ON users (lower(username));

-- skill: уникальность по имени без учёта регистра (защита от "React"/"react")
CREATE UNIQUE INDEX IF NOT EXISTS ux_skill_name_ci ON skill (lower(name));

-- user_skill: ускорители по связям
CREATE INDEX IF NOT EXISTS idx_user_skill_user  ON user_skill(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skill_skill ON user_skill(skill_id);
