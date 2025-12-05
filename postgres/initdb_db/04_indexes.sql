CREATE INDEX IF NOT EXISTS idx_app_hack_status    ON application (hackathon_id, status);
CREATE INDEX IF NOT EXISTS idx_team_hack          ON team (hackathon_id);
CREATE INDEX IF NOT EXISTS idx_vac_team_status    ON vacancy (team_id, status);
CREATE INDEX IF NOT EXISTS idx_notif_user_unread  ON notification (user_id, is_read);

-- CREATE INDEX IF NOT EXISTS idx_ar_role            ON application_roles(role_id);
-- CREATE INDEX IF NOT EXISTS idx_ar_app             ON application_roles(application_id);
CREATE INDEX IF NOT EXISTS idx_us_skill           ON user_skill(skill_id);
CREATE INDEX IF NOT EXISTS idx_us_user            ON user_skill(user_id);

CREATE INDEX IF NOT EXISTS idx_invite_active      ON invite   (application_id) WHERE status='pending';
CREATE INDEX IF NOT EXISTS idx_response_active    ON response (vacancy_id)    WHERE status='pending';

CREATE INDEX IF NOT EXISTS idx_achieves_user_id   ON achievements (user_id);
CREATE INDEX IF NOT EXISTS ix_users_username_ci ON users(LOWER(username));
CREATE INDEX IF NOT EXISTS skill_name_lower ON skill (LOWER(name));
CREATE INDEX IF NOT EXISTS ix_user_skill_user  ON user_skill(user_id);
CREATE INDEX IF NOT EXISTS ix_user_skill_skill ON user_skill(skill_id);
CREATE INDEX IF NOT EXISTS ux_skill_name_ci ON skill (lower(name));
CREATE INDEX IF NOT EXISTS idx_skill_name_prefix ON skill (lower(name) text_pattern_ops);
CREATE INDEX IF NOT EXISTS idx_user_skill_user  ON user_skill(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skill_skill ON user_skill(skill_id);
