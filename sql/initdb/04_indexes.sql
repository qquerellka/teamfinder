CREATE INDEX IF NOT EXISTS idx_app_hack_status ON application (hackathon_id, status);
CREATE INDEX IF NOT EXISTS idx_team_hack ON team (hackathon_id);
CREATE INDEX IF NOT EXISTS idx_vac_team_status ON vacancy (team_id, status);
CREATE INDEX IF NOT EXISTS idx_notif_user_unread ON notification (user_id, is_read);

CREATE INDEX IF NOT EXISTS idx_invite_active ON invite (application_id) WHERE status='pending';
CREATE INDEX IF NOT EXISTS idx_response_active ON response (vacancy_id) WHERE status='pending';

CREATE INDEX IF NOT EXISTS idx_event_ts ON product_event (ts);
CREATE INDEX IF NOT EXISTS idx_event_user_ts ON product_event (user_id, ts);
CREATE INDEX IF NOT EXISTS idx_event_hack_ts ON product_event (hackathon_id, ts);
