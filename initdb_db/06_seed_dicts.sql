-- DevOps
INSERT INTO skill(slug, name) VALUES
  ('linux','Linux'),
  ('bash','Bash'),
  ('git','Git'),
  ('docker','Docker'),
  ('kubernetes','Kubernetes'),
  ('helm','Helm'),
  ('terraform','Terraform'),
  ('ansible','Ansible'),
  ('nginx','Nginx'),
  ('grafana','Grafana'),
  ('prometheus','Prometheus'),
  ('github-actions','GitHub Actions'),
  ('gitlab-ci','GitLab CI'),
  ('aws','AWS'),
  ('gcp','GCP'),
  ('azure','Azure')
ON CONFLICT (slug) DO NOTHING;

-- Backend
INSERT INTO skill(slug, name) VALUES
  ('python','Python'),
  ('go','Go'),
  ('java','Java'),
  ('kotlin','Kotlin'),
  ('swift','Swift'),
  ('dart','Dart'),
  ('c','C'),
  ('c++','C++'),
  ('c#','C#'),
  ('php','PHP'),
  ('ruby','Ruby'),
  ('rust','Rust'),
  ('nodejs','Node.js'),
  ('express','Express.js'),
  ('nestjs','NestJS'),
  ('spring','Spring'),
  ('spring-boot','Spring Boot'),
  ('django','Django'),
  ('flask','Flask'),
  ('fastapi','FastAPI'),
  ('.net','.NET'),
  ('laravel','Laravel'),
  ('rails','Ruby on Rails'),
  ('mongodb','MongoDB'),
  ('redis','Redis'),
  ('kafka','Kafka'),
  ('rabbitmq','RabbitMQ'),
  ('postgres','PostgreSQL'),
  ('mysql','MySQL'),
  ('mariadb','MariaDB'),
  ('sqlite','SQLite'),
  ('clickhouse','ClickHouse'),
  ('elasticsearch','Elasticsearch'),
  ('airflow','Airflow'),
  ('dbt','dbt'),
  ('spark','Apache Spark'),
  ('hadoop','Hadoop'),
  ('hive','Hive')
ON CONFLICT (slug) DO NOTHING;

-- Frontend
INSERT INTO skill(slug, name) VALUES
  ('javascript','JavaScript'),
  ('typescript','TypeScript'),
  ('html','HTML'),
  ('css','CSS'),
  ('sass','Sass'),
  ('tailwind','Tailwind CSS'),
  ('bootstrap','Bootstrap'),
  ('react','React'),
  ('nextjs','Next.js'),
  ('redux','Redux'),
  ('vue','Vue'),
  ('nuxt','Nuxt'),
  ('angular','Angular'),
  ('svelte','Svelte'),
  ('android','Android'),
  ('ios','iOS'),
  ('swiftui','SwiftUI'),
  ('react-native','React Native'),
  ('flutter','Flutter'),
  ('selenium','Selenium'),
  ('cypress','Cypress'),
  ('playwright','Playwright'),
  ('figma','Figma'),
  ('adobe-xd','Adobe XD'),
  ('illustrator','Adobe Illustrator')
ON CONFLICT (slug) DO NOTHING;

-- Data Science / ML
INSERT INTO skill(slug, name) VALUES
  ('sql','SQL'),
  ('numpy','NumPy'),
  ('pandas','Pandas'),
  ('scikit-learn','scikit-learn'),
  ('pytorch','PyTorch'),
  ('tensorflow','TensorFlow'),
  ('xgboost','XGBoost'),
  ('catboost','CatBoost'),
  ('jupyter','Jupyter'),
  ('mlflow','MLflow'),
  ('tableau','Tableau'),
  ('powerbi','Power BI'),
  ('metabase','Metabase'),
  ('superset','Apache Superset'),
  ('excel','Excel'),
  ('amplitude','Amplitude'),
  ('mixpanel','Mixpanel'),
  ('ga4','Google Analytics 4')
ON CONFLICT (slug) DO NOTHING;

-- Testing
INSERT INTO skill(slug, name) VALUES
  ('pytest','pytest'),
  ('unittest','unittest'),
  ('junit','JUnit')
ON CONFLICT (slug) DO NOTHING;
