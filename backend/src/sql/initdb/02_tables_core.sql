CREATE TABLE IF NOT EXISTS "user" (
  id              BIGSERIAL PRIMARY KEY,
  telegram_id     BIGINT UNIQUE NOT NULL,
  username        TEXT,
  name            TEXT,
  surname         TEXT,
  bio             TEXT,
  
  avatar_url      TEXT,
  city            TEXT,
  university      TEXT,
  link            TEXT,
  -- achievements    JSONB DEFAULT '[]'::jsonb,


  skills          JSONB DEFAULT '[]'::jsonb,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hackathon (
  id                    BIGSERIAL PRIMARY KEY,
  name                  TEXT NOT NULL,
  description           TEXT,
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
  id            BIGSERIAL PRIMARY KEY,
  hackathon_id  BIGINT NOT NULL REFERENCES hackathon(id) ON DELETE CASCADE,
  user_id       BIGINT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  roles         JSONB  NOT NULL,
  about         TEXT,
  status        application_status NOT NULL DEFAULT 'published',
  joined        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT roles_is_array CHECK (jsonb_typeof(roles) = 'array'),
  CONSTRAINT app_unique_per_hack UNIQUE (hackathon_id, user_id)
);

CREATE TABLE IF NOT EXISTS team (
  id             BIGSERIAL PRIMARY KEY,
  hackathon_id   BIGINT NOT NULL REFERENCES hackathon(id) ON DELETE CASCADE,
  captain_id     BIGINT NOT NULL REFERENCES "user"(id),
  name           TEXT NOT NULL,
  description    TEXT,
  links          JSONB DEFAULT '{}'::jsonb,
  status         team_status NOT NULL DEFAULT 'forming',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS team_member (
  team_id     BIGINT NOT NULL REFERENCES team(id) ON DELETE CASCADE,
  user_id     BIGINT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  role        TEXT NOT NULL,
  is_captain  BOOLEAN NOT NULL DEFAULT FALSE,
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (team_id, user_id)
);

CREATE TABLE IF NOT EXISTS vacancy (
  id           BIGSERIAL PRIMARY KEY,
  team_id      BIGINT NOT NULL REFERENCES team(id) ON DELETE CASCADE,
  role         TEXT NOT NULL,
  description  TEXT,
  skills       JSONB DEFAULT '[]'::jsonb,
  seniority    TEXT,
  status       vacancy_status NOT NULL DEFAULT 'open',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invite (
  id             BIGSERIAL PRIMARY KEY,
  team_id        BIGINT NOT NULL REFERENCES team(id) ON DELETE CASCADE,
  application_id BIGINT NOT NULL REFERENCES application(id) ON DELETE CASCADE,
  invited_role   TEXT NOT NULL,
  message        TEXT,
  status         invite_status NOT NULL DEFAULT 'pending',
  expires_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS response (
  id             BIGSERIAL PRIMARY KEY,
  vacancy_id     BIGINT NOT NULL REFERENCES vacancy(id) ON DELETE CASCADE,
  desired_role   TEXT NOT NULL,
  message        TEXT,
  status         response_status NOT NULL DEFAULT 'pending',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notification (
  id         BIGSERIAL PRIMARY KEY,
  user_id    BIGINT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  channel    notif_channel NOT NULL DEFAULT 'in_app',
  payload    JSONB DEFAULT '{}'::jsonb,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
