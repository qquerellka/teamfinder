INSERT INTO event_type (code, name) VALUES
  ('invite.accept','Invite accepted'),
  ('response.accept','Response accepted'),
  ('team.member.join','Team member joined')
ON CONFLICT (code) DO NOTHING;
