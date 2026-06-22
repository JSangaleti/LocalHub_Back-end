CREATE TABLE IF NOT EXISTS favorite_stores (
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, store_id)
);

CREATE INDEX IF NOT EXISTS idx_favorite_stores_store_id
  ON favorite_stores(store_id);
