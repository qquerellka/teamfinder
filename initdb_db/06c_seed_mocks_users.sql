INSERT INTO users 
(telegram_id, username, first_name, last_name, language_code, bio, avatar_url, city, university, link)
VALUES
(101001, 'andrey_dev', 'Andrey', 'Kuznetsov', 'ru', 'Backend dev, loves Go', 'https://picsum.photos/200?1', 'Moscow', 'HSE', 'https://t.me/andrey'),
(101002, 'masha_front', 'Maria', 'Petrova', 'ru', 'Frontend React student', 'https://picsum.photos/200?2', 'Saint Petersburg', 'SPbSU', 'https://github.com/maria'),
(101003, 'ivan_ml', 'Ivan', 'Smirnov', 'ru', 'ML engineer intern', 'https://picsum.photos/200?3', 'Novosibirsk', 'NSU', 'https://t.me/ivan'),
(101004, 'julia_pm', 'Julia', 'Volkova', 'en', 'Product manager in edtech', 'https://picsum.photos/200?4', 'Berlin', 'TU Berlin', 'https://linkedin.com/julia'),
(101005, 'max_qa', 'Maxim', 'Egorov', 'ru', 'QA engineer', 'https://picsum.photos/200?5', 'Kazan', 'KFU', 'https://github.com/maxqa'),
(101006, 'sergey_ds', 'Sergey', 'Morozov', 'ru', 'Data Science enjoyer', 'https://picsum.photos/200?6', 'Ekaterinburg', 'UrFU', NULL),
(101007, 'kate_design', 'Ekaterina', 'Lebedeva', 'ru', 'UI/UX designer', 'https://picsum.photos/200?7', 'Moscow', 'Bauman Moscow State Tech', 'https://figma.com/@kate'),
(101008, 'tim_js', 'Timur', 'Ismailov', 'ru', 'Fullstack JS dev', 'https://picsum.photos/200?8', 'Krasnodar', NULL, NULL),
(101009, 'vlad_ops', 'Vladislav', 'Kozlov', 'en', 'DevOps junior', 'https://picsum.photos/200?9', 'Tomsk', 'TPU', 'https://t.me/vladops'),
(101010, 'alisa_ai', 'Alisa', 'Romanova', 'ru', 'AI researcher beginner', 'https://picsum.photos/200?10', 'Moscow', 'MIPT', 'https://github.com/alisa');

-- USER SKILLS (используем твои slug'и из большого списка скиллов)

INSERT INTO user_skill (user_id, skill_id)
VALUES
  -- Andrey (101001): Go backend + DevOps
  ((SELECT id FROM users WHERE telegram_id = 101001), (SELECT id FROM skill WHERE slug = 'go')),
  ((SELECT id FROM users WHERE telegram_id = 101001), (SELECT id FROM skill WHERE slug = 'python')),
  ((SELECT id FROM users WHERE telegram_id = 101001), (SELECT id FROM skill WHERE slug = 'fastapi')),
  ((SELECT id FROM users WHERE telegram_id = 101001), (SELECT id FROM skill WHERE slug = 'postgres')),
  ((SELECT id FROM users WHERE telegram_id = 101001), (SELECT id FROM skill WHERE slug = 'docker')),
  ((SELECT id FROM users WHERE telegram_id = 101001), (SELECT id FROM skill WHERE slug = 'kafka')),
  ((SELECT id FROM users WHERE telegram_id = 101001), (SELECT id FROM skill WHERE slug = 'linux')),
  ((SELECT id FROM users WHERE telegram_id = 101001), (SELECT id FROM skill WHERE slug = 'git')),

  -- Maria (101002): фронт React
  ((SELECT id FROM users WHERE telegram_id = 101002), (SELECT id FROM skill WHERE slug = 'javascript')),
  ((SELECT id FROM users WHERE telegram_id = 101002), (SELECT id FROM skill WHERE slug = 'typescript')),
  ((SELECT id FROM users WHERE telegram_id = 101002), (SELECT id FROM skill WHERE slug = 'react')),
  ((SELECT id FROM users WHERE telegram_id = 101002), (SELECT id FROM skill WHERE slug = 'html')),
  ((SELECT id FROM users WHERE telegram_id = 101002), (SELECT id FROM skill WHERE slug = 'css')),
  ((SELECT id FROM users WHERE telegram_id = 101002), (SELECT id FROM skill WHERE slug = 'figma')),

  -- Ivan (101003): ML / DS
  ((SELECT id FROM users WHERE telegram_id = 101003), (SELECT id FROM skill WHERE slug = 'python')),
  ((SELECT id FROM users WHERE telegram_id = 101003), (SELECT id FROM skill WHERE slug = 'sql')),
  ((SELECT id FROM users WHERE telegram_id = 101003), (SELECT id FROM skill WHERE slug = 'numpy')),
  ((SELECT id FROM users WHERE telegram_id = 101003), (SELECT id FROM skill WHERE slug = 'pandas')),
  ((SELECT id FROM users WHERE telegram_id = 101003), (SELECT id FROM skill WHERE slug = 'scikit-learn')),
  ((SELECT id FROM users WHERE telegram_id = 101003), (SELECT id FROM skill WHERE slug = 'pytorch')),
  ((SELECT id FROM users WHERE telegram_id = 101003), (SELECT id FROM skill WHERE slug = 'jupyter')),

  -- Julia (101004): продукт / аналитика
  ((SELECT id FROM users WHERE telegram_id = 101004), (SELECT id FROM skill WHERE slug = 'excel')),
  ((SELECT id FROM users WHERE telegram_id = 101004), (SELECT id FROM skill WHERE slug = 'powerbi')),
  ((SELECT id FROM users WHERE telegram_id = 101004), (SELECT id FROM skill WHERE slug = 'amplitude')),
  ((SELECT id FROM users WHERE telegram_id = 101004), (SELECT id FROM skill WHERE slug = 'mixpanel')),
  ((SELECT id FROM users WHERE telegram_id = 101004), (SELECT id FROM skill WHERE slug = 'ga4')),

  -- Max (101005): QA
  ((SELECT id FROM users WHERE telegram_id = 101005), (SELECT id FROM skill WHERE slug = 'pytest')),
  ((SELECT id FROM users WHERE telegram_id = 101005), (SELECT id FROM skill WHERE slug = 'unittest')),
  ((SELECT id FROM users WHERE telegram_id = 101005), (SELECT id FROM skill WHERE slug = 'selenium')),
  ((SELECT id FROM users WHERE telegram_id = 101005), (SELECT id FROM skill WHERE slug = 'cypress')),
  ((SELECT id FROM users WHERE telegram_id = 101005), (SELECT id FROM skill WHERE slug = 'git')),

  -- Sergey (101006): DS
  ((SELECT id FROM users WHERE telegram_id = 101006), (SELECT id FROM skill WHERE slug = 'python')),
  ((SELECT id FROM users WHERE telegram_id = 101006), (SELECT id FROM skill WHERE slug = 'sql')),
  ((SELECT id FROM users WHERE telegram_id = 101006), (SELECT id FROM skill WHERE slug = 'numpy')),
  ((SELECT id FROM users WHERE telegram_id = 101006), (SELECT id FROM skill WHERE slug = 'pandas')),
  ((SELECT id FROM users WHERE telegram_id = 101006), (SELECT id FROM skill WHERE slug = 'tableau')),
  ((SELECT id FROM users WHERE telegram_id = 101006), (SELECT id FROM skill WHERE slug = 'metabase')),
  ((SELECT id FROM users WHERE telegram_id = 101006), (SELECT id FROM skill WHERE slug = 'superset')),

  -- Ekaterina (101007): дизайн
  ((SELECT id FROM users WHERE telegram_id = 101007), (SELECT id FROM skill WHERE slug = 'figma')),
  ((SELECT id FROM users WHERE telegram_id = 101007), (SELECT id FROM skill WHERE slug = 'adobe-xd')),
  ((SELECT id FROM users WHERE telegram_id = 101007), (SELECT id FROM skill WHERE slug = 'illustrator')),
  ((SELECT id FROM users WHERE telegram_id = 101007), (SELECT id FROM skill WHERE slug = 'css')),

  -- Timur (101008): fullstack JS
  ((SELECT id FROM users WHERE telegram_id = 101008), (SELECT id FROM skill WHERE slug = 'javascript')),
  ((SELECT id FROM users WHERE telegram_id = 101008), (SELECT id FROM skill WHERE slug = 'typescript')),
  ((SELECT id FROM users WHERE telegram_id = 101008), (SELECT id FROM skill WHERE slug = 'react')),
  ((SELECT id FROM users WHERE telegram_id = 101008), (SELECT id FROM skill WHERE slug = 'nodejs')),
  ((SELECT id FROM users WHERE telegram_id = 101008), (SELECT id FROM skill WHERE slug = 'postgres')),
  ((SELECT id FROM users WHERE telegram_id = 101008), (SELECT id FROM skill WHERE slug = 'docker')),

  -- Vlad (101009): DevOps
  ((SELECT id FROM users WHERE telegram_id = 101009), (SELECT id FROM skill WHERE slug = 'linux')),
  ((SELECT id FROM users WHERE telegram_id = 101009), (SELECT id FROM skill WHERE slug = 'docker')),
  ((SELECT id FROM users WHERE telegram_id = 101009), (SELECT id FROM skill WHERE slug = 'kubernetes')),
  ((SELECT id FROM users WHERE telegram_id = 101009), (SELECT id FROM skill WHERE slug = 'helm')),
  ((SELECT id FROM users WHERE telegram_id = 101009), (SELECT id FROM skill WHERE slug = 'terraform')),
  ((SELECT id FROM users WHERE telegram_id = 101009), (SELECT id FROM skill WHERE slug = 'nginx')),
  ((SELECT id FROM users WHERE telegram_id = 101009), (SELECT id FROM skill WHERE slug = 'grafana')),
  ((SELECT id FROM users WHERE telegram_id = 101009), (SELECT id FROM skill WHERE slug = 'prometheus')),
  ((SELECT id FROM users WHERE telegram_id = 101009), (SELECT id FROM skill WHERE slug = 'gitlab-ci')),

  -- Alisa (101010): AI researcher
  ((SELECT id FROM users WHERE telegram_id = 101010), (SELECT id FROM skill WHERE slug = 'python')),
  ((SELECT id FROM users WHERE telegram_id = 101010), (SELECT id FROM skill WHERE slug = 'numpy')),
  ((SELECT id FROM users WHERE telegram_id = 101010), (SELECT id FROM skill WHERE slug = 'pandas')),
  ((SELECT id FROM users WHERE telegram_id = 101010), (SELECT id FROM skill WHERE slug = 'tensorflow')),
  ((SELECT id FROM users WHERE telegram_id = 101010), (SELECT id FROM skill WHERE slug = 'pytorch')),
  ((SELECT id FROM users WHERE telegram_id = 101010), (SELECT id FROM skill WHERE slug = 'xgboost')),
  ((SELECT id FROM users WHERE telegram_id = 101010), (SELECT id FROM skill WHERE slug = 'mlflow'));


-- APPLICATIONS (анкеты)
-- предполагаем, что hackathons вставлены как в твоём INSERT (id = 1..11) и users как выше (id = 1..10)

INSERT INTO application (hackathon_id, user_id, role, status, joined)
VALUES
  -- МосТех Хак 2026 (1)
  (1, 1, 'Backend',   'published', TRUE),
  (1, 2, 'Frontend',  'published', TRUE),
  (1, 7, 'Frontend',  'published', TRUE),
  (1, 9, 'DevOps',    'published', TRUE),
  (1, 4, 'Analytics', 'published', FALSE),

  -- Neva Data Challenge (2)
  (2, 1, 'Backend',   'published', TRUE),
  (2, 3, 'Analytics', 'published', TRUE),
  (2, 6, 'Analytics', 'published', TRUE),
  (2,10, 'ML',        'published', TRUE),
  (2, 5, 'QA',        'published', FALSE),

  -- Tatarstan AI Weekend (3)
  (3, 3,  'ML',       'published', TRUE),
  (3,10, 'ML',        'published', TRUE),
  (3, 2, 'Frontend',  'published', TRUE),
  (3, 8, 'Backend',   'published', FALSE),

  -- Siberia Cloud & DevOps (4)
  (4, 9, 'DevOps',    'published', TRUE),
  (4, 1, 'Backend',   'published', TRUE),
  (4, 5, 'QA',        'published', TRUE),
  (4, 6, 'Analytics', 'published', FALSE),

  -- Volga Mobility Hack (5)
  (5, 8, 'Backend',   'published', TRUE),
  (5, 2, 'Frontend',  'published', TRUE),
  (5, 7, 'Designer',  'published', TRUE),
  (5, 3, 'Analytics', 'published', FALSE);


-- TEAMS (команды)

INSERT INTO team (hackathon_id, captain_id, name, description, is_private, status)
VALUES
  (1, 1, 'Mostech Monoliths',
      'Команда по городским сервисам и транспорту для МосТех Хак 2026.',
      FALSE, 'forming'),
  (2, 3, 'Neva Lakehouse',
      'Data-platform команда под Lakehouse и real-time витрины.',
      FALSE, 'forming'),
  (3,10, 'Tatarstan AI Cats',
      'ML-команда для промышленного AI на Tatarstan AI Weekend.',
      FALSE, 'forming'),
  (4, 9, 'Siberian Observability',
      'DevOps/observability команда для облачного трека.',
      FALSE, 'forming'),
  (5, 8, 'Volga Mobile Crew',
      'Мобильная команда под Volga Mobility Hack.',
      FALSE, 'forming');


-- TEAM MEMBERS (участники команд)

INSERT INTO team_member (team_id, user_id, role, is_captain)
VALUES
  -- team 1: Mostech Monoliths (hackathon 1)
  (1, 1, 'Backend',   TRUE),
  (1, 2, 'Frontend',  FALSE),
  (1, 7, 'Designer',  FALSE),
  (1, 9, 'DevOps',    FALSE),

  -- team 2: Neva Lakehouse (hackathon 2)
  (2, 3, 'Analytics', TRUE),
  (2, 1, 'Backend',   FALSE),
  (2, 6, 'Analytics', FALSE),
  (2,10, 'ML',        FALSE),

  -- team 3: Tatarstan AI Cats (hackathon 3)
  (3,10, 'ML',        TRUE),
  (3, 3, 'ML',        FALSE),
  (3, 2, 'Frontend',  FALSE),

  -- team 4: Siberian Observability (hackathon 4)
  (4, 9, 'DevOps',    TRUE),
  (4, 1, 'Backend',   FALSE),
  (4, 5, 'QA',        FALSE),

  -- team 5: Volga Mobile Crew (hackathon 5)
  (5, 8, 'Backend',   TRUE),
  (5, 2, 'Frontend',  FALSE),
  (5, 7, 'Designer',  FALSE);


-- VACANCIES (вакансии в командах, skills = массив slug'ов)

INSERT INTO vacancy (team_id, role, description, skills)
VALUES
  (1, 'Backend',
      'Backend-разработчик для сервисов МосТех (Go + FastAPI + PostgreSQL).',
      '["go","python","fastapi","postgres","docker"]'::jsonb),
  (1, 'Analytics',
      'Аналитик по городским данным и метрикам (BI).',
      '["sql","powerbi","excel"]'::jsonb),

  (2, 'Frontend',
      'Frontend-разработчик для дашбордов Neva Data Challenge.',
      '["react","typescript","redux","javascript"]'::jsonb),

  (3, 'Backend',
      'Backend-разработчик для AI-сервисов (Python + ML).',
      '["python","fastapi","pandas","numpy"]'::jsonb),

  (4, 'Analytics',
      'Аналитик по метрикам и мониторингу (логирование, APM).',
      '["sql","tableau","superset"]'::jsonb),

  (5, 'Frontend',
      'Фронтенд/мобильный разработчик для суперприложения.',
      '["react-native","typescript","figma"]'::jsonb);


-- ACHIEVEMENTS (ачивки по хакатонам)

INSERT INTO achievements (user_id, hackathon_id, role, place)
VALUES
  -- участники МосТех Хак 2026
  (1, 1, 'Backend',   'participant'),
  (2, 1, 'Frontend',  'participant'),
  (7, 1, 'Designer',  'participant'),
  (9, 1, 'DevOps',    'participant'),

  -- команда Neva Lakehouse взяла 2 место
  (3, 2, 'Analytics', 'secondPlace'),
  (1, 2, 'Backend',   'secondPlace'),
  (6, 2, 'Analytics', 'secondPlace'),
  (10,2, 'ML',        'secondPlace'),

  -- команда Tatarstan AI Cats взяла 1 место
  (10,3, 'ML',        'firstPlace'),
  (3, 3, 'ML',        'firstPlace'),
  (2, 3, 'Frontend',  'firstPlace');
