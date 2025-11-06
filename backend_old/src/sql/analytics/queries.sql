-- DAU: по дням
SELECT date_trunc('day', e.ts) AS d, COUNT(DISTINCT e.user_id) AS dau
FROM product_event e
JOIN event_type t ON t.id=e.type_id AND t.code='session.start'
GROUP BY 1 ORDER BY 1 DESC;

-- MAU: за месяц от текущей даты
SELECT COUNT(DISTINCT e.user_id) AS mau
FROM product_event e
JOIN event_type t ON t.id=e.type_id AND t.code='session.start'
WHERE e.ts >= date_trunc('month', now());

-- Конверсия publish -> join за 30 дней
WITH pub AS (
  SELECT DISTINCT user_id
  FROM product_event e JOIN event_type t ON t.id=e.type_id
  WHERE t.code='application.publish' AND e.ts >= now() - interval '30 days'
),
jn AS (
  SELECT DISTINCT user_id
  FROM product_event e JOIN event_type t ON t.id=e.type_id
  WHERE t.code='team.member.join' AND e.ts >= now() - interval '30 days'
)
SELECT (SELECT COUNT(*) FROM pub) AS published,
       (SELECT COUNT(*) FROM jn) AS joined,
       CASE WHEN (SELECT COUNT(*) FROM pub)=0 THEN 0
            ELSE (SELECT COUNT(*) FROM jn)::decimal / (SELECT COUNT(*) FROM pub) END AS conversion_rate;

-- Time-to-Join (часы) для пользователей, у кого есть и publish, и join
WITH ev AS (
  SELECT user_id,
         MIN(CASE WHEN t.code='application.publish' THEN e.ts END) AS published_at,
         MIN(CASE WHEN t.code='team.member.join' THEN e.ts END)    AS joined_at
  FROM product_event e
  JOIN event_type t ON t.id=e.type_id
  WHERE t.code IN ('application.publish','team.member.join')
  GROUP BY user_id
)
SELECT user_id,
       EXTRACT(EPOCH FROM (joined_at - published_at))/3600.0 AS hours_to_join
FROM ev
WHERE published_at IS NOT NULL AND joined_at IS NOT NULL
ORDER BY 2;

-- Fill rate вакансий (все времена и последние 30 дней)
WITH v AS (
  SELECT v.id,
         MIN(pe.ts) FILTER (WHERE et.code='vacancy.create') AS created_at,
         MIN(pe.ts) FILTER (WHERE et.code='vacancy.close')  AS closed_at
  FROM vacancy v
  LEFT JOIN product_event pe ON pe.team_id=v.team_id
  LEFT JOIN event_type et ON et.id=pe.type_id
  GROUP BY v.id
)
SELECT
  COUNT(*) AS total_created,
  COUNT(*) FILTER (WHERE closed_at IS NOT NULL) AS total_closed,
  ROUND((COUNT(*) FILTER (WHERE closed_at IS NOT NULL)::decimal / NULLIF(COUNT(*),0))::numeric,3) AS total_fill_rate,
  COUNT(*) FILTER (WHERE created_at >= now()-interval '30 days') AS created_30d,
  COUNT(*) FILTER (WHERE closed_at  >= now()-interval '30 days') AS closed_30d
FROM v;

-- Retention (D1/D7/D30) на основе session.start и когорты по первой дате
WITH sessions AS (
  SELECT user_id, date_trunc('day', MIN(ts)) AS cohort_day
  FROM product_event e JOIN event_type t ON t.id=e.type_id AND t.code='session.start'
  GROUP BY user_id
), activity AS (
  SELECT s.user_id, s.cohort_day, date_trunc('day', e.ts) AS act_day,
         (date_trunc('day', e.ts) - s.cohort_day) AS delta
  FROM sessions s
  JOIN product_event e ON e.user_id=s.user_id
  JOIN event_type t ON t.id=e.type_id AND t.code='session.start'
)
SELECT cohort_day,
       COUNT(DISTINCT user_id) FILTER (WHERE delta=interval '1 day')  AS d1,
       COUNT(DISTINCT user_id) FILTER (WHERE delta=interval '7 days') AS d7,
       COUNT(DISTINCT user_id) FILTER (WHERE delta=interval '30 days') AS d30
FROM activity
GROUP BY cohort_day
ORDER BY cohort_day DESC;

-- Топ скиллов по пользователям (ранк)
WITH s AS (
  SELECT sd.name AS skill, COUNT(*) AS cnt
  FROM user_skills us JOIN skill_dict sd ON sd.id=us.skill_id
  GROUP BY sd.name
)
SELECT skill, cnt, RANK() OVER (ORDER BY cnt DESC) AS rnk
FROM s
ORDER BY cnt DESC;
