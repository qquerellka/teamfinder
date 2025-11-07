-- 08_views.sql
-- Представление "пользователь со списком навыков" (удобно для отдачи профиля)

DROP VIEW IF EXISTS v_user_with_skills;

CREATE VIEW v_user_with_skills AS
SELECT
  u.id,
  u.telegram_id,
  u.username,
  u.first_name,
  u.last_name,
  u.language_code,
  u.bio,
  u.avatar_url,
  u.city,
  u.university,
  u.link,
  u.created_at,
  u.updated_at,
  COALESCE(
    (
      SELECT json_agg(
               json_build_object('id', s.id, 'slug', s.slug, 'name', s.name)
               ORDER BY s.name
             )
      FROM user_skill us
      JOIN skill s ON s.id = us.skill_id
      WHERE us.user_id = u.id
    ),
    '[]'::json
  ) AS skills
FROM users u;
