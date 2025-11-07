-- 04a_extra_indexes.sql
-- Доп. индексы под поиск по имени/ФИО и подсказки по навыкам

-- users: триграммы по username для '%q%'
CREATE INDEX IF NOT EXISTS ix_users_username_trgm
  ON users USING GIN (username gin_trgm_ops);

-- users: триграммы по "first_name last_name" для '%q%'
CREATE INDEX IF NOT EXISTS ix_users_fullname_trgm
  ON users USING GIN ( (coalesce(first_name,'') || ' ' || coalesce(last_name,'')) gin_trgm_ops );

-- skill: триграммы по name (если решим делать серверный suggest)
CREATE INDEX IF NOT EXISTS skill_name_trgm
  ON skill USING GIN (name gin_trgm_ops);
