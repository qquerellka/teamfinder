DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'team_member_uq'
  ) THEN
    ALTER TABLE team_member ADD CONSTRAINT team_member_uq UNIQUE(team_id, user_id);
  END IF;
END $$;
