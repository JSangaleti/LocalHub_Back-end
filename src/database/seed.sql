INSERT INTO categories (name)
VALUES
  ('Roupas'),
  ('Comida'),
  ('Lazer'),
  ('Mercado')
ON CONFLICT (name) DO NOTHING;

INSERT INTO users (name, email, password, user_type)
VALUES ('Loja Estilo', 'loja.estilo@localhub.dev', 'dev_hash', 'comercio')
ON CONFLICT (email) DO NOTHING;

INSERT INTO stores (
  owner_user_id,
  category_id,
  name,
  description,
  address,
  opening_hours,
  contact
)
SELECT
  u.id,
  c.id,
  'Loja Estilo',
  'Moda casual e acessórios para o dia a dia.',
  'Centro, Campo Mourão - PR',
  '08:00 às 18:00',
  '(44) 99999-9999'
FROM users u
JOIN categories c ON c.name = 'Roupas'
WHERE u.email = 'loja.estilo@localhub.dev'
  AND NOT EXISTS (
    SELECT 1 FROM stores s WHERE s.name = 'Loja Estilo'
  );

INSERT INTO posts (store_id, category_id, title, description, image_url)
SELECT
  s.id,
  c.id,
  'Promoção de Camisetas',
  'Camisetas com 20% de desconto nesta semana.',
  ''
FROM stores s
JOIN categories c ON c.name = 'Roupas'
WHERE s.name = 'Loja Estilo'
  AND NOT EXISTS (
    SELECT 1 FROM posts p WHERE p.title = 'Promoção de Camisetas'
  );
