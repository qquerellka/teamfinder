-- 09_demo_data.sql
-- Демонстрационные данные: пользователи и их навыки.
-- Файл идемпотентный (ON CONFLICT / PK), можно запускать повторно.

-- ====== USERS ======
INSERT INTO users (telegram_id, username, first_name, last_name, language_code, bio, avatar_url, city, university, link)
VALUES
  (279058397, 'vdkfrost', 'Max',      'Uskov',   'ru', 'Backend & Mini Apps', NULL,        'Berlin',  'TU Berlin', 'https://github.com/vdkfrost'),
  (100000001, 'alice_dev','Alice',    'Ivanova', 'ru', 'Frontend React/TS',   NULL,        'Moscow',  'HSE',       'https://t.me/alice_dev'),
  (100000002, 'bob.p',    'Bob',      'Petrov',  'ru', 'Data Engineer',       NULL,        'SPb',     'ITMO',      NULL),
  (100000003, 'charlie',  'Charlie',  'Smith',   'en', 'Pythonist',           NULL,        'London',  'UCL',       'https://charlie.dev'),
  (100000004, 'daria',    'Daria',    'Sokolova','ru', 'Full-stack',          NULL,        'Kazan',   'KFU',       NULL),
  (100000005, 'erik',     'Erik',     'Johans',  'en', 'DevOps / Docker',     NULL,        'Stockholm','KTH',      NULL),
  (100000006, 'yuki',     'Yuki',     'Tanaka',  'en', 'Asyncio enjoyer',     NULL,        'Tokyo',   'UTokyo',    NULL),
  (100000007, 'igor',     'Igor',     'Sidorov', 'ru', 'Kafka/Streams',       NULL,        'Novosib', 'NSU',       NULL)
ON CONFLICT (telegram_id) DO NOTHING;


-- ====== USER_SKILL helper inserts ======
-- Хелпер: вставка пары (user by telegram_id) × (skill by slug).
-- Пример:
-- INSERT INTO user_skill(user_id, skill_id)
-- SELECT u.id, s.id FROM users u JOIN skill s ON s.slug='python'
-- WHERE u.telegram_id=279058397
-- ON CONFLICT DO NOTHING;

-- Max (279058397): python, fastapi, sqlalchemy, postgres, react, typescript
INSERT INTO user_skill(user_id, skill_id)
SELECT u.id, s.id FROM users u JOIN skill s ON s.slug='python'     WHERE u.telegram_id=279058397
ON CONFLICT DO NOTHING;
INSERT INTO user_skill(user_id, skill_id)
SELECT u.id, s.id FROM users u JOIN skill s ON s.slug='fastapi'    WHERE u.telegram_id=279058397
ON CONFLICT DO NOTHING;
INSERT INTO user_skill(user_id, skill_id)
SELECT u.id, s.id FROM users u JOIN skill s ON s.slug='sqlalchemy' WHERE u.telegram_id=279058397
ON CONFLICT DO NOTHING;
INSERT INTO user_skill(user_id, skill_id)
SELECT u.id, s.id FROM users u JOIN skill s ON s.slug='postgres'   WHERE u.telegram_id=279058397
ON CONFLICT DO NOTHING;
INSERT INTO user_skill(user_id, skill_id)
SELECT u.id, s.id FROM users u JOIN skill s ON s.slug='react'      WHERE u.telegram_id=279058397
ON CONFLICT DO NOTHING;
INSERT INTO user_skill(user_id, skill_id)
SELECT u.id, s.id FROM users u JOIN skill s ON s.slug='typescript' WHERE u.telegram_id=279058397
ON CONFLICT DO NOTHING;

-- Alice (100000001): react, typescript, docker
INSERT INTO user_skill(user_id, skill_id)
SELECT u.id, s.id FROM users u JOIN skill s ON s.slug='react'      WHERE u.telegram_id=100000001
ON CONFLICT DO NOTHING;
INSERT INTO user_skill(user_id, skill_id)
SELECT u.id, s.id FROM users u JOIN skill s ON s.slug='typescript' WHERE u.telegram_id=100000001
ON CONFLICT DO NOTHING;
INSERT INTO user_skill(user_id, skill_id)
SELECT u.id, s.id FROM users u JOIN skill s ON s.slug='docker'     WHERE u.telegram_id=100000001
ON CONFLICT DO NOTHING;

-- Bob (100000002): python, postgres, kafka
INSERT INTO user_skill(user_id, skill_id)
SELECT u.id, s.id FROM users u JOIN skill s ON s.slug='python'     WHERE u.telegram_id=100000002
ON CONFLICT DO NOTHING;
INSERT INTO user_skill(user_id, skill_id)
SELECT u.id, s.id FROM users u JOIN skill s ON s.slug='postgres'   WHERE u.telegram_id=100000002
ON CONFLICT DO NOTHING;
INSERT INTO user_skill(user_id, skill_id)
SELECT u.id, s.id FROM users u JOIN skill s ON s.slug='kafka'      WHERE u.telegram_id=100000002
ON CONFLICT DO NOTHING;

-- Charlie (100000003): python, asyncio, fastapi
INSERT INTO user_skill(user_id, skill_id)
SELECT u.id, s.id FROM users u JOIN skill s ON s.slug='python'     WHERE u.telegram_id=100000003
ON CONFLICT DO NOTHING;
INSERT INTO user_skill(user_id, skill_id)
SELECT u.id, s.id FROM users u JOIN skill s ON s.slug='asyncio'    WHERE u.telegram_id=100000003
ON CONFLICT DO NOTHING;
INSERT INTO user_skill(user_id, skill_id)
SELECT u.id, s.id FROM users u JOIN skill s ON s.slug='fastapi'    WHERE u.telegram_id=100000003
ON CONFLICT DO NOTHING;

-- Daria (100000004): react, typescript, docker, postgres
INSERT INTO user_skill(user_id, skill_id)
SELECT u.id, s.id FROM users u JOIN skill s ON s.slug='react'      WHERE u.telegram_id=100000004
ON CONFLICT DO NOTHING;
INSERT INTO user_skill(user_id, skill_id)
SELECT u.id, s.id FROM users u JOIN skill s ON s.slug='typescript' WHERE u.telegram_id=100000004
ON CONFLICT DO NOTHING;
INSERT INTO user_skill(user_id, skill_id)
SELECT u.id, s.id FROM users u JOIN skill s ON s.slug='docker'     WHERE u.telegram_id=100000004
ON CONFLICT DO NOTHING;
INSERT INTO user_skill(user_id, skill_id)
SELECT u.id, s.id FROM users u JOIN skill s ON s.slug='postgres'   WHERE u.telegram_id=100000004
ON CONFLICT DO NOTHING;

-- Erik (100000005): docker, postgres
INSERT INTO user_skill(user_id, skill_id)
SELECT u.id, s.id FROM users u JOIN skill s ON s.slug='docker'     WHERE u.telegram_id=100000005
ON CONFLICT DO NOTHING;
INSERT INTO user_skill(user_id, skill_id)
SELECT u.id, s.id FROM users u JOIN skill s ON s.slug='postgres'   WHERE u.telegram_id=100000005
ON CONFLICT DO NOTHING;

-- Yuki (100000006): asyncio, fastapi, python
INSERT INTO user_skill(user_id, skill_id)
SELECT u.id, s.id FROM users u JOIN skill s ON s.slug='asyncio'    WHERE u.telegram_id=100000006
ON CONFLICT DO NOTHING;
INSERT INTO user_skill(user_id, skill_id)
SELECT u.id, s.id FROM users u JOIN skill s ON s.slug='fastapi'    WHERE u.telegram_id=100000006
ON CONFLICT DO NOTHING;
INSERT INTO user_skill(user_id, skill_id)
SELECT u.id, s.id FROM users u JOIN skill s ON s.slug='python'     WHERE u.telegram_id=100000006
ON CONFLICT DO NOTHING;

-- Igor (100000007): kafka, postgres, python
INSERT INTO user_skill(user_id, skill_id)
SELECT u.id, s.id FROM users u JOIN skill s ON s.slug='kafka'      WHERE u.telegram_id=100000007
ON CONFLICT DO NOTHING;
INSERT INTO user_skill(user_id, skill_id)
SELECT u.id, s.id FROM users u JOIN skill s ON s.slug='postgres'   WHERE u.telegram_id=100000007
ON CONFLICT DO NOTHING;
INSERT INTO user_skill(user_id, skill_id)
SELECT u.id, s.id FROM users u JOIN skill s ON s.slug='python'     WHERE u.telegram_id=100000007
ON CONFLICT DO NOTHING;


-- ====== Проверки (по желанию, можно закомментировать) ======
-- SELECT COUNT(*) AS users_cnt FROM users;
-- SELECT COUNT(*) AS skills_cnt FROM skill;
-- SELECT u.username, json_agg(s.slug ORDER BY s.slug) AS skills
-- FROM users u
-- LEFT JOIN user_skill us ON us.user_id = u.id
-- LEFT JOIN skill s ON s.id = us.skill_id
-- GROUP BY u.id, u.username
-- ORDER BY u.username;
