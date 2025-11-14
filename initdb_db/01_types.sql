DO $$ BEGIN
  CREATE TYPE hackathon_mode AS ENUM ('online','offline','hybrid');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE hackathon_status AS ENUM ('open','closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE team_status AS ENUM ('forming','ready');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE application_status AS ENUM ('draft','published','hidden');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE vacancy_status AS ENUM ('open','closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE invite_status AS ENUM ('pending','accepted','rejected','expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE response_status AS ENUM ('pending','accepted','rejected','withdrawn');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE achiev_place AS ENUM ('1','2', '3', 'finalyst', 'participant');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE role_type AS ENUM ('DevOps','GameDev',
  'MobileDev','Product manager','DS','ML','Fullstack',
  'Backend','Frontend','Designer','Analytics','QA');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notif_type AS ENUM ('info', 'warning', -- новые хаки и предуупреждения
  'response:accept', 'response:decline', -- заявка на вступление - принятие \ отказ (user)
  'invitation:new',  -- новое приглашение (user)
  'invitation:reject', 'invitation:accept', -- приглашение на вступление - отказ \ принятие (capitain)
  'team:entry','team:leave',-- (capitain)
  'team:kicked' -- кикнули из тимы (user)
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

