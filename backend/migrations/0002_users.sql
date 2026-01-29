-- 0002_users.sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','uploader','viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- optional: index
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);