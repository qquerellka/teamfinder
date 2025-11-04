INSERT INTO role_dict(name) VALUES
  ('DevOps'), ('Game developer'), 
  ('IOS / Android dev'), ('Product manager'), ('DS'), ('ML'), ('Fullstack'),
  ('backend'), ('frontend'), ('designer'), ('analytics'), ('qa')
ON CONFLICT (name) DO NOTHING;

-- DevOps
INSERT INTO skill_dict(name) VALUES
  ('linux'),('bash'),('git'),
  ('docker'),('kubernetes'),('helm'),
  ('terraform'),('ansible'),
  ('nginx'),('grafana'),('prometheus'),
  ('github-actions'),('gitlab-ci'),
  ('aws'),('gcp'),('azure');

-- Backend
INSERT INTO skill_dict(name) VALUES
  ('python'),('go'),('java'),('kotlin'),('swift'),('dart'),
  ('c'),('c++'),('c#'),('php'),('ruby'),('rust'),
  ('nodejs'),('express'),('nestjs'),
  ('spring'),('spring-boot'),('django'),('flask'),('fastapi'),('.net'),('laravel'),('rails'),
  ('mongodb'),('redis'),('kafka'),('rabbitmq'),
  ('postgres'),('mysql'),('mariadb'),('sqlite'),
  ('clickhouse'),('elasticsearch'),
  ('airflow'),('dbt'),('spark'),('hadoop'),('hive');

-- Frontend
INSERT INTO skill_dict(name) VALUES
  ('javascript'),('typescript'),
  ('html'),('css'),('sass'),('tailwind'),('bootstrap'),
  ('react'),('nextjs'),('redux'),('vue'),('nuxt'),('angular'),('svelte'),
  ('android'),('ios'),('swiftui'),('react-native'),('flutter'),
  ('selenium'),('cypress'),('playwright'),
  ('figma'),('adobe-xd'),('illustrator');

-- Data Science / ML
INSERT INTO skill_dict(name) VALUES
  ('sql'),
  ('numpy'),('pandas'),('scikit-learn'),('pytorch'),('tensorflow'),
  ('xgboost'),('catboost'),('jupyter'),('mlflow'),
  ('tableau'),('powerbi'),('metabase'),('superset'),('excel'),
  ('amplitude'),('mixpanel'),('ga4');

-- Testing
INSERT INTO skill_dict(name) VALUES
  ('pytest'),('unittest'),('junit');

ON CONFLICT (name) DO NOTHING;