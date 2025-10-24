INSERT INTO role_dict(name) VALUES
  ('DevOps'), ('Game developer'), 
  ('IOS / Android dev'), ('Product manager'), , ('DS'), ('ML'),
   ('Fullstack'),
  ('backend'), ('frontend'), ('designer'), ('analytics'), ('qa')
ON CONFLICT (name) DO NOTHING;

INSERT INTO skill_dict(name) VALUES
  ('python'),('go'),('java'),('kotlin'),('swift'),('dart'),
  ('javascript'),('typescript'),('c'),('c++'),('c#'),('php'),('ruby'),('rust'),
  ('html'),('css'),('sass'),('tailwind'),('bootstrap'),
  ('react'),('nextjs'),('redux'),('vue'),('nuxt'),('angular'),('svelte'),
  ('nodejs'),('express'),('nestjs'),
  ('spring'),('spring-boot'),('django'),('flask'),('fastapi'),('.net'),('laravel'),('rails'),
  ('android'),('ios'),('swiftui'),('react-native'),('flutter'),
  ('sql'),('postgres'),('mysql'),('mariadb'),('sqlite'),
  ('mongodb'),('redis'),('clickhouse'),('elasticsearch'),
  ('kafka'),('rabbitmq'),
  ('airflow'),('dbt'),('spark'),('hadoop'),('hive'),
  ('tableau'),('powerbi'),('metabase'),('superset'),('excel'),
  ('numpy'),('pandas'),('scikit-learn'),('pytorch'),('tensorflow'),
  ('xgboost'),('catboost'),('jupyter'),('mlflow'),
  ('linux'),('bash'),('git'),
  ('docker'),('kubernetes'),('helm'),
  ('terraform'),('ansible'),
  ('nginx'),('grafana'),('prometheus'),
  ('github-actions'),('gitlab-ci'),
  ('aws'),('gcp'),('azure'),
  ('pytest'),('unittest'),('junit'),
  ('selenium'),('cypress'),('playwright'),
  ('figma'),('adobe-xd'),('illustrator'),
  ('amplitude'),('mixpanel'),('ga4')
ON CONFLICT (name) DO NOTHING;