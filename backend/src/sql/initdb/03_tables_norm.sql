CREATE TABLE IF NOT EXISTS role_dict   (id SMALLSERIAL PRIMARY KEY, name TEXT UNIQUE);
CREATE TABLE IF NOT EXISTS skill_dict  (id SMALLSERIAL PRIMARY KEY, name TEXT UNIQUE);

CREATE TABLE IF NOT EXISTS application_roles (
  application_id BIGINT REFERENCES application(id) ON DELETE CASCADE,
  role_id        SMALLINT REFERENCES role_dict(id),
  PRIMARY KEY (application_id, role_id)
);

CREATE TABLE IF NOT EXISTS user_skills (
  user_id  BIGINT REFERENCES "user"(id) ON DELETE CASCADE,
  skill_id SMALLINT REFERENCES skill_dict(id),
  PRIMARY KEY (user_id, skill_id)
);
