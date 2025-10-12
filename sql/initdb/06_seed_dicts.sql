INSERT INTO role_dict(name) VALUES
  ('DevOps'),
  ('Game developer'),
  ('IOS / Android dev'),
  ('Product manager'),
  ('DS'),
  ('ML'),
  ('Fullstack'),
  ('backend'),
  ('frontend'),
  ('designer'),
  ('analytics'),
  ('qa')
ON CONFLICT (name) DO NOTHING;

INSERT INTO skill_dict(name) VALUES
  ('python'),('go'),('java'),('kotlin'),('swift'),('dart'),
  ('javascript'),('typescript'),('c'),('c++'),('c#'),('php'),('ruby'),('rust'),

  -- web basics
  ('html'),('css'),('sass'),('tailwind'),('bootstrap'),

  -- web/mobile frameworks
  ('react'),('nextjs'),('redux'),('vue'),('nuxt'),('angular'),('svelte'),
  ('nodejs'),('express'),('nestjs'),
  ('spring'),('spring-boot'),('django'),('flask'),('fastapi'),('.net'),('laravel'),('rails'),
  ('android'),('ios'),('swiftui'),('react-native'),('flutter'),

  -- data / messaging
  ('sql'),('postgres'),('mysql'),('mariadb'),('sqlite'),
  ('mongodb'),('redis'),('clickhouse'),('elasticsearch'),
  ('kafka'),('rabbitmq'),

  -- data engineering / analytics
  ('airflow'),('dbt'),('spark'),('hadoop'),('hive'),
  ('tableau'),('powerbi'),('metabase'),('superset'),('excel'),

  -- ml/ds
  ('numpy'),('pandas'),('scikit-learn'),('pytorch'),('tensorflow'),
  ('xgboost'),('catboost'),('jupyter'),('mlflow'),

  -- devops / cloud / infra
  ('linux'),('bash'),('git'),
  ('docker'),('kubernetes'),('helm'),
  ('terraform'),('ansible'),
  ('nginx'),
  ('github-actions'),('gitlab-ci'),
  ('aws'),('gcp'),('azure'),

  -- testing / qa
  ('pytest'),('unittest')

  ('figma'),('adobe-xd'),('illustrator')
ON CONFLICT (name) DO NOTHING;

INSERT INTO event_type(code) VALUES
  ('session.start'),
  ('application.create'),('application.publish'),('application.hide'),
  ('team.create'),('vacancy.create'),('vacancy.close'),
  ('invite.create'),('invite.accept'),('invite.reject'),
  ('response.create'),('response.accept'),('response.reject'),('response.withdraw'),
  ('team.member.join'),('team.member.leave'),('captain.transfer')
ON CONFLICT (code) DO NOTHING;

