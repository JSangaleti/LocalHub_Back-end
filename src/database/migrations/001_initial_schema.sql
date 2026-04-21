-- Migration inicial: estrutura principal do LocalHub

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type_enum') THEN
    CREATE TYPE user_type_enum AS ENUM ('cliente', 'comercio', 'admin');
  END IF;
END$$;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  user_type user_type_enum NOT NULL DEFAULT 'cliente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stores (
  id BIGSERIAL PRIMARY KEY,
  owner_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(140) NOT NULL,
  description TEXT,
  address VARCHAR(220),
  opening_hours VARCHAR(120),
  contact VARCHAR(80)
);

CREATE TABLE IF NOT EXISTS posts (
  id BIGSERIAL PRIMARY KEY,
  store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  title VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_stores_owner_user_id ON stores(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_stores_category_id ON stores(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_store_id ON posts(store_id);

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_stores_updated_at ON stores;
DROP TRIGGER IF EXISTS trg_posts_updated_at ON posts;

CREATE OR REPLACE VIEW v_feed_posts AS
SELECT
  p.id,
  s.name AS store_name,
  p.title,
  p.description,
  c.name AS category,
  p.image_url
FROM posts p
JOIN stores s ON s.id = p.store_id
LEFT JOIN categories c ON c.id = p.category_id;
