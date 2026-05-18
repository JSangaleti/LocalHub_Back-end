INSERT INTO
  categories (name)
VALUES
  ('Roupas'),
  ('Comida'),
  ('Lazer'),
  ('Mercado') ON CONFLICT (name) DO NOTHING;

INSERT INTO
  users (name, email, password, user_type)
VALUES
  (
    'Mundo da Panela',
    'mundo_da_panela@localhub.dev',
    '$2b$10$8a0uwSeIyWgs/rO6QanhPODmMrcpsKn5BHy5TapuIgOaRy57WuvzC',
    'comercio'
  ) ON CONFLICT (email) DO NOTHING;

INSERT INTO
  stores (
    owner_user_id,
    category_id,
    name,
    description,
    address,
    address_number,
    neighborhood,
    city,
    state,
    postal_code,
    country,
    latitude,
    longitude,
    opening_hours,
    contact
  )
SELECT
  u.id,
  c.id,
  'Loja Estilo',
  'Moda casual e acessórios para o dia a dia.',
  'Rua Brasil',
  '123',
  'Centro',
  'Campo Mourão',
  'PR',
  '87300-000',
  'Brasil',
  -24.04630000,
  -52.37800000,
  '08:00 às 18:00',
  '(44) 99999-9999'
FROM
  users u
  JOIN categories c ON c.name = 'Roupas'
WHERE
  u.email = 'loja.estilo@localhub.dev'
  AND NOT EXISTS (
    SELECT
      1
    FROM
      stores s
    WHERE
      s.name = 'Loja Estilo'
  );

UPDATE
  stores
SET
  address = 'Rua Brasil',
  address_number = '123',
  neighborhood = 'Centro',
  city = 'Campo Mourão',
  state = 'PR',
  postal_code = '87300-000',
  country = 'Brasil',
  latitude = -24.04630000,
  longitude = -52.37800000,
  opening_hours = '08:00 às 18:00',
  contact = '(44) 99999-9999'
WHERE
  name = 'Loja Estilo';

INSERT INTO
  posts (
    store_id,
    category_id,
    title,
    description,
    image_url
  )
SELECT
  s.id,
  c.id,
  'Promoção de Camisetas',
  'Camisetas com 20% de desconto nesta semana.',
  ''
FROM
  stores s
  JOIN categories c ON c.name = 'Roupas'
WHERE
  s.name = 'Loja Estilo'
  AND NOT EXISTS (
    SELECT
      1
    FROM
      posts p
    WHERE
      p.title = 'Promoção de Camisetas'
  );