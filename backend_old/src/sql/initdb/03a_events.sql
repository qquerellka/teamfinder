CREATE TABLE IF NOT EXISTS event_type (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS product_event (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES "user"(id),
  hackathon_id BIGINT REFERENCES hackathon(id),
  team_id BIGINT REFERENCES team(id),
  type_id BIGINT NOT NULL REFERENCES event_type(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
