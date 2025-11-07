CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  telegram_id     INT UNIQUE NOT NULL,
  username        TEXT,
  first_name      TEXT,
  last_name       TEXT,
  language_code   TEXT,
  bio             TEXT,
  avatar_url      TEXT,
  city            TEXT DEFAULT NULL,
  university      TEXT DEFAULT NULL,
  link            TEXT DEFAULT NULL,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS skill (
  id          SERIAL PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,         -- канонический, нижний регистр
  name        TEXT NOT NULL,                -- человекочитаемое имя (может дублироваться)
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CHECK (slug = lower(slug))
);

CREATE TABLE IF NOT EXISTS user_skill (
  user_id  INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id INT NOT NULL REFERENCES skill(id)  ON DELETE RESTRICT,
  PRIMARY KEY (user_id, skill_id)
);


CREATE TABLE IF NOT EXISTS hackathon (
  id                    SERIAL PRIMARY KEY,
  name                  TEXT NOT NULL,
  description           TEXT,
  image_link            TEXT,
  start_date            TIMESTAMPTZ NOT NULL,
  end_date              TIMESTAMPTZ NOT NULL,
  registration_end_date TIMESTAMPTZ,
  mode                  hackathon_mode NOT NULL DEFAULT 'online',
  city                  TEXT DEFAULT NULL,
  team_members_minimum  INT,
  team_members_limit    INT,
  registration_link     TEXT,
  prize_fund            TEXT,
  status                hackathon_status NOT NULL DEFAULT 'open',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS application (
  id            SERIAL PRIMARY KEY,
  hackathon_id  INT NOT NULL REFERENCES hackathon(id) ON DELETE CASCADE,
  user_id       INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role          role_type,
  status        application_status NOT NULL DEFAULT 'published',
  joined        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT app_unique_per_hack UNIQUE (hackathon_id, user_id)
);

CREATE TABLE IF NOT EXISTS team (
  id             SERIAL PRIMARY KEY,
  hackathon_id   INT NOT NULL REFERENCES hackathon(id) ON DELETE CASCADE,
  captain_id     INT NOT NULL REFERENCES users(id),
  name           TEXT NOT NULL,
  description    TEXT,
  is_private     BOOLEAN DEFAULT FALSE,
  status         team_status NOT NULL DEFAULT 'forming',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS team_member (
  team_id     INT NOT NULL REFERENCES team(id) ON DELETE CASCADE,
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        role_type NOT NULL,
  is_captain  BOOLEAN NOT NULL DEFAULT FALSE,
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (team_id, user_id)
);

CREATE TABLE IF NOT EXISTS vacancy (
  id           SERIAL PRIMARY KEY,
  team_id      INT NOT NULL REFERENCES team(id) ON DELETE CASCADE,
  role         role_type NOT NULL,
  description  TEXT,
  skills       JSONB DEFAULT '[]'::jsonb,
  status       vacancy_status NOT NULL DEFAULT 'open',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invite (
  id             SERIAL PRIMARY KEY,
  team_id        INT NOT NULL REFERENCES team(id) ON DELETE CASCADE,
  application_id INT NOT NULL REFERENCES application(id) ON DELETE CASCADE,
  invited_role   role_type NOT NULL,
  status         invite_status NOT NULL DEFAULT 'pending',
  expires_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS response (
  id             SERIAL PRIMARY KEY,
  vacancy_id     INT NOT NULL REFERENCES vacancy(id) ON DELETE CASCADE,
  desired_role   role_type NOT NULL DEFAULT 'Analytics',
  status         response_status NOT NULL DEFAULT 'pending',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notification (
  id         SERIAL PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       notif_type NOT NULL default 'info',
  payload    JSONB DEFAULT '{}'::jsonb,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS achievements (
  id         SERIAL PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,                        
  role       role_type NOT NULL,
  place      achiev_place NOT NULL DEFAULT 'participant',
  hackLink   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
