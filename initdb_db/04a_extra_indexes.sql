CREATE INDEX IF NOT EXISTS idx_app_hack_status   ON application(hackathon_id, status);
CREATE INDEX IF NOT EXISTS idx_team_hack_status  ON team(hackathon_id, status);
CREATE INDEX IF NOT EXISTS idx_vac_team_status   ON vacancy(team_id, status);
CREATE INDEX IF NOT EXISTS idx_inv_team_status   ON invite(team_id, status);
CREATE INDEX IF NOT EXISTS idx_resp_vac_status   ON response(vacancy_id, status);
CREATE INDEX IF NOT EXISTS idx_tm_team           ON team_member(team_id);
CREATE INDEX IF NOT EXISTS idx_notif_user_created ON notification(user_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uq_team_member_pair ON public.team_member (team_id, user_id);