-- 02_tables_core.sql
-- Базовые таблицы: пользователи и справочник навыков

CREATE TABLE IF NOT EXISTS users (
  id              BIGSERIAL PRIMARY KEY,
  telegram_id     BIGINT UNIQUE NOT NULL,

  username        TEXT,
  first_name      TEXT,
  last_name       TEXT,
  language_code   TEXT,
  bio             TEXT,
  avatar_url      TEXT,
  city            TEXT,
  university      TEXT,
  link            TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS skill (
  id          BIGSERIAL PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,   -- канонический ключ (нижний регистр)
  name        TEXT NOT NULL,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_skill_slug_lower CHECK (slug = lower(slug))  -- <— здесь
);
