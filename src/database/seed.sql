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
    'Administrador',
    'admin@admin.com',
    '$2b$10$7L83xfQ.WjyKYvlkITfP4O6vFiPSFMNGWN.fI94dHIF01nfqXvH6S',
    'admin'
  ),
  (
    'Mundo da Panela',
    'mundo.panela@localhub.dev',
    '$2b$10$8a0uwSeIyWgs/rO6QanhPODmMrcpsKn5BHy5TapuIgOaRy57WuvzC',
    'comercio'
  ) ON CONFLICT (email) DO NOTHING;

INSERT INTO
  stores (
    owner_user_id,
    category_id,
    cnpj,
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
  '11222333000181',
  'Mundo da Panela',
  'Restaurante de comida caseira, marmitas e pratos feitos.',
  'Rua Brasil',
  '123',
  'Centro',
  'Campo Mourão',
  'PR',
  '87300-000',
  'Brasil',
  -24.04630000,
  -52.37800000,
  '10:30 às 14:30',
  '(44) 99999-9999'
FROM
  users u
  JOIN categories c ON c.name = 'Comida'
WHERE
  u.email = 'mundo.panela@localhub.dev'
  AND NOT EXISTS (
    SELECT
      1
    FROM
      stores s
    WHERE
      s.cnpj = '11222333000181'
  );

UPDATE
  stores
SET
  cnpj = '11222333000181',
  description = 'Restaurante de comida caseira, marmitas e pratos feitos.',
  address = 'Rua Brasil',
  address_number = '123',
  neighborhood = 'Centro',
  city = 'Campo Mourão',
  state = 'PR',
  postal_code = '87300-000',
  country = 'Brasil',
  latitude = -24.04630000,
  longitude = -52.37800000,
  opening_hours = '10:30 às 14:30',
  contact = '(44) 99999-9999'
WHERE
  name = 'Mundo da Panela';

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
  'Prato feito do dia',
  'Arroz, feijão, bife acebolado, batata frita e salada da casa.',
  ''
FROM
  stores s
  JOIN categories c ON c.name = 'Comida'
WHERE
  s.name = 'Mundo da Panela'
  AND NOT EXISTS (
    SELECT
      1
    FROM
      posts p
    WHERE
      p.title = 'Prato feito do dia'
      AND p.store_id = s.id
  );