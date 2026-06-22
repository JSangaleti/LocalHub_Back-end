INSERT INTO users (name, email, password, user_type)
VALUES (
  'Administrador',
  'admin@admin.com',
  '$2b$10$7L83xfQ.WjyKYvlkITfP4O6vFiPSFMNGWN.fI94dHIF01nfqXvH6S',
  'admin'
)
ON CONFLICT (email) DO UPDATE
SET
  name = EXCLUDED.name,
  password = EXCLUDED.password,
  user_type = EXCLUDED.user_type;
