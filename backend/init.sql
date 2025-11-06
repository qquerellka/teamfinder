CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_id BIGINT UNIQUE NOT NULL,
    username TEXT,
    name TEXT,
    surname TEXT,
    avatar_url TEXT,
    bio TEXT,
    age INTEGER,
    city TEXT,
    university TEXT,
    link TEXT NOT NULL,
    skills JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
