CREATE TABLE IF NOT EXISTS event_type (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS product_event (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  hackathon_id INT REFERENCES hackathon(id),
  team_id INT REFERENCES team(id),
  type_id INT NOT NULL REFERENCES event_type(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
