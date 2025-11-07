-- 06_seed_dicts.sql
-- Начальный словарь навыков (без фанатизма, чисто для старта)
-- Повторный прогон не упадёт благодаря ON CONFLICT DO NOTHING

INSERT INTO skill(slug, name) VALUES
  ('python','Python'),
  ('fastapi','FastAPI'),
  ('sqlalchemy','SQLAlchemy'),
  ('postgres','PostgreSQL'),
  ('asyncio','asyncio'),
  ('redis','Redis'),
  ('docker','Docker'),
  ('kafka','Kafka'),
  ('react','React'),
  ('typescript','TypeScript')
ON CONFLICT (slug) DO NOTHING;
