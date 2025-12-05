CREATE OR REPLACE VIEW v_public_applications AS
SELECT
  a.id AS application_id,
  a.hackathon_id,
  a.user_id,
  u.username,
  CONCAT_WS(' ', u.first_name, u.last_name) AS full_name,
  COALESCE(ARRAY_AGG(DISTINCT s.name) FILTER (WHERE s.id IS NOT NULL), ARRAY[]::text[]) AS skills, -- обновление
  a.role,
  a.status,
  a.created_at
FROM application a
JOIN users u ON u.id = a.user_id
LEFT JOIN user_skill us ON us.user_id = u.id
LEFT JOIN skill s ON s.id = us.skill_id
WHERE a.status = 'published'
GROUP BY a.id, a.hackathon_id, a.user_id, u.username, u.first_name, u.last_name, a.role, a.status, a.created_at;


CREATE OR REPLACE VIEW v_team_overview AS
SELECT t.id AS team_id,
       t.name,
       t.hackathon_id,
       t.status,
       COUNT(tm.user_id) AS members_count,
       SUM(CASE WHEN tm.is_captain THEN 1 ELSE 0 END) AS captains,
       SUM(CASE WHEN v.status='open' THEN 1 ELSE 0 END) AS open_vacancies
FROM team t
LEFT JOIN team_member tm ON tm.team_id=t.id
LEFT JOIN vacancy v ON v.team_id=t.id
GROUP BY t.id, t.name, t.hackathon_id, t.status;
