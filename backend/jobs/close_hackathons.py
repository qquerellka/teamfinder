import asyncio
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_PORT = int(os.getenv("POSTGRES_PORT", "5432"))
POSTGRES_DB = os.getenv("POSTGRES_DB", "app_db")
POSTGRES_USER = os.getenv("POSTGRES_USER", "app_user")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "app_password")

DATABASE_URL = (
    f"postgresql+asyncpg://{POSTGRES_USER}:{POSTGRES_PASSWORD}"
    f"@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
)

SQL = text("""
WITH due AS (
  SELECT h.id
  FROM hackathon h
  WHERE h.status = 'open'
    AND ((h.end_date AT TIME ZONE 'Europe/Moscow')::date::timestamp - interval '1 minute')
        <= (now() AT TIME ZONE 'Europe/Moscow')
  ORDER BY h.end_date
  FOR UPDATE SKIP LOCKED
  LIMIT 50
),
teams AS (
  SELECT t.id
  FROM team t
  WHERE t.hackathon_id IN (SELECT id FROM due)
),
vacancies AS (
  SELECT v.id
  FROM vacancy v
  WHERE v.team_id IN (SELECT id FROM teams)
),
apps AS (
  SELECT a.id
  FROM application a
  WHERE a.hackathon_id IN (SELECT id FROM due)
),
upd_h AS (
  UPDATE hackathon
  SET status = 'closed', updated_at = now()
  WHERE id IN (SELECT id FROM due)
    AND status <> 'closed'
  RETURNING id
),
upd_t AS (
  UPDATE team
  SET status = 'hidden', updated_at = now()
  WHERE id IN (SELECT id FROM teams)
    AND status <> 'hidden'
  RETURNING id
),
upd_v AS (
  UPDATE vacancy
  SET status = 'closed', updated_at = now()
  WHERE id IN (SELECT id FROM vacancies)
    AND status <> 'closed'
  RETURNING id
),
upd_a AS (
  UPDATE application
  SET status = 'hidden', updated_at = now()
  WHERE id IN (SELECT id FROM apps)
    AND status <> 'hidden'
  RETURNING id
),
upd_i AS (
  UPDATE invite
  SET status = 'expired'
  WHERE (team_id IN (SELECT id FROM teams)
     OR application_id IN (SELECT id FROM apps))
    AND status <> 'expired'
  RETURNING id
),
upd_r AS (
  UPDATE response
  SET status = 'expired', updated_at = now()
  WHERE (vacancy_id IN (SELECT id FROM vacancies)
     OR application_id IN (SELECT id FROM apps))
    AND status <> 'expired'
  RETURNING id
)
SELECT
  (SELECT count(*) FROM upd_h) AS hackathons_closed,
  (SELECT count(*) FROM upd_t) AS teams_hidden,
  (SELECT count(*) FROM upd_v) AS vacancies_closed,
  (SELECT count(*) FROM upd_a) AS applications_hidden,
  (SELECT count(*) FROM upd_i) AS invites_expired,
  (SELECT count(*) FROM upd_r) AS responses_expired;
""")

async def main():
    interval = int(os.getenv("CLOSE_JOB_INTERVAL", "60"))

    engine = create_async_engine(DATABASE_URL, pool_pre_ping=True)
    Session = async_sessionmaker(engine, expire_on_commit=False)

    while True:
        async with Session() as s:
            async with s.begin():
                await s.execute(SQL)
        await asyncio.sleep(interval)

if __name__ == "__main__":
    asyncio.run(main())
