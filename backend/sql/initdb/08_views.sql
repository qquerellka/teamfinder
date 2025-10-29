CREATE OR REPLACE VIEW v_public_applications AS
SELECT a.id AS application_id,
       a.hackathon_id,
       a.user_id,
       u.username,
       u.name,
       u.skills,
       a.roles,
       a.about,
       a.status,
       a.created_at
FROM application a
JOIN "user" u ON u.id=a.user_id
WHERE a.status='published';

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
