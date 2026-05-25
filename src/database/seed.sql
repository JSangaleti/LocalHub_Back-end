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
  ),
  (
    'Estilo Urbano',
    'estilo.urbano@localhub.dev',
    '$2b$10$8a0uwSeIyWgs/rO6QanhPODmMrcpsKn5BHy5TapuIgOaRy57WuvzC',
    'comercio'
  ),
  (
    'Mercado Bom Preço',
    'mercado.bompreco@localhub.dev',
    '$2b$10$8a0uwSeIyWgs/rO6QanhPODmMrcpsKn5BHy5TapuIgOaRy57WuvzC',
    'comercio'
  ),
  (
    'Cine Diversão',
    'cine.diversao@localhub.dev',
    '$2b$10$8a0uwSeIyWgs/rO6QanhPODmMrcpsKn5BHy5TapuIgOaRy57WuvzC',
    'comercio'
  ),
  (
    'Café Central',
    'cafe.central@localhub.dev',
    '$2b$10$8a0uwSeIyWgs/rO6QanhPODmMrcpsKn5BHy5TapuIgOaRy57WuvzC',
    'comercio'
  ),
  (
    'Farmácia Saúde Mais',
    'saude.mais@localhub.dev',
    '$2b$10$8a0uwSeIyWgs/rO6QanhPODmMrcpsKn5BHy5TapuIgOaRy57WuvzC',
    'comercio'
  ),
  (
    'Academia Corpo Ativo',
    'corpo.ativo@localhub.dev',
    '$2b$10$8a0uwSeIyWgs/rO6QanhPODmMrcpsKn5BHy5TapuIgOaRy57WuvzC',
    'comercio'
  )
ON CONFLICT (email) DO NOTHING;

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
    SELECT 1 FROM stores s WHERE s.name = 'Mundo da Panela'
  );

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
  'Estilo Urbano',
  'Loja de roupas masculinas e femininas com peças casuais e modernas.',
  'Avenida Capitão Índio Bandeira',
  '850',
  'Centro',
  'Campo Mourão',
  'PR',
  '87300-005',
  'Brasil',
  -24.04390000,
  -52.38120000,
  '09:00 às 18:00',
  '(44) 98888-1111'
FROM
  users u
  JOIN categories c ON c.name = 'Roupas'
WHERE
  u.email = 'estilo.urbano@localhub.dev'
  AND NOT EXISTS (
    SELECT 1 FROM stores s WHERE s.name = 'Estilo Urbano'
  );

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
  'Mercado Bom Preço',
  'Mercado de bairro com hortifruti, padaria, açougue e produtos do dia a dia.',
  'Rua São Paulo',
  '455',
  'Jardim Lar Paraná',
  'Campo Mourão',
  'PR',
  '87305-140',
  'Brasil',
  -24.06180000,
  -52.36690000,
  '08:00 às 20:00',
  '(44) 97777-2222'
FROM
  users u
  JOIN categories c ON c.name = 'Mercado'
WHERE
  u.email = 'mercado.bompreco@localhub.dev'
  AND NOT EXISTS (
    SELECT 1 FROM stores s WHERE s.name = 'Mercado Bom Preço'
  );

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
  'Cine Diversão',
  'Espaço de lazer com cinema, pipoca, sessões especiais e programação para famílias.',
  'Rua Harrison José Borges',
  '1200',
  'Centro',
  'Campo Mourão',
  'PR',
  '87300-380',
  'Brasil',
  -24.04480000,
  -52.37950000,
  '14:00 às 22:30',
  '(44) 96666-3333'
FROM
  users u
  JOIN categories c ON c.name = 'Lazer'
WHERE
  u.email = 'cine.diversao@localhub.dev'
  AND NOT EXISTS (
    SELECT 1 FROM stores s WHERE s.name = 'Cine Diversão'
  );

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
  'Café Central',
  'Cafeteria local com cafés especiais, bolos caseiros, salgados e ambiente para encontros.',
  'Rua Francisco Ferreira Albuquerque',
  '610',
  'Centro',
  'Campo Mourão',
  'PR',
  '87300-450',
  'Brasil',
  -24.04570000,
  -52.38080000,
  '07:30 às 19:00',
  '(44) 95555-4444'
FROM
  users u
  JOIN categories c ON c.name = 'Comida'
WHERE
  u.email = 'cafe.central@localhub.dev'
  AND NOT EXISTS (
    SELECT 1 FROM stores s WHERE s.name = 'Café Central'
  );

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
  'Farmácia Saúde Mais',
  'Farmácia com medicamentos, produtos de higiene, perfumaria e atendimento personalizado.',
  'Avenida Goioerê',
  '980',
  'Centro',
  'Campo Mourão',
  'PR',
  '87300-100',
  'Brasil',
  -24.04710000,
  -52.37640000,
  '08:00 às 21:00',
  '(44) 94444-5555'
FROM
  users u
  JOIN categories c ON c.name = 'Mercado'
WHERE
  u.email = 'saude.mais@localhub.dev'
  AND NOT EXISTS (
    SELECT 1 FROM stores s WHERE s.name = 'Farmácia Saúde Mais'
  );

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
  'Academia Corpo Ativo',
  'Academia com musculação, funcional, personal trainer e planos mensais.',
  'Rua Araruna',
  '300',
  'Jardim Aeroporto',
  'Campo Mourão',
  'PR',
  '87306-220',
  'Brasil',
  -24.05490000,
  -52.39010000,
  '06:00 às 22:00',
  '(44) 93333-6666'
FROM
  users u
  JOIN categories c ON c.name = 'Lazer'
WHERE
  u.email = 'corpo.ativo@localhub.dev'
  AND NOT EXISTS (
    SELECT 1 FROM stores s WHERE s.name = 'Academia Corpo Ativo'
  );

UPDATE
  stores
SET
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

UPDATE
  stores
SET
  description = 'Loja de roupas masculinas e femininas com peças casuais e modernas.',
  address = 'Avenida Capitão Índio Bandeira',
  address_number = '850',
  neighborhood = 'Centro',
  city = 'Campo Mourão',
  state = 'PR',
  postal_code = '87300-005',
  country = 'Brasil',
  latitude = -24.04390000,
  longitude = -52.38120000,
  opening_hours = '09:00 às 18:00',
  contact = '(44) 98888-1111'
WHERE
  name = 'Estilo Urbano';

UPDATE
  stores
SET
  description = 'Mercado de bairro com hortifruti, padaria, açougue e produtos do dia a dia.',
  address = 'Rua São Paulo',
  address_number = '455',
  neighborhood = 'Jardim Lar Paraná',
  city = 'Campo Mourão',
  state = 'PR',
  postal_code = '87305-140',
  country = 'Brasil',
  latitude = -24.06180000,
  longitude = -52.36690000,
  opening_hours = '08:00 às 20:00',
  contact = '(44) 97777-2222'
WHERE
  name = 'Mercado Bom Preço';

UPDATE
  stores
SET
  description = 'Espaço de lazer com cinema, pipoca, sessões especiais e programação para famílias.',
  address = 'Rua Harrison José Borges',
  address_number = '1200',
  neighborhood = 'Centro',
  city = 'Campo Mourão',
  state = 'PR',
  postal_code = '87300-380',
  country = 'Brasil',
  latitude = -24.04480000,
  longitude = -52.37950000,
  opening_hours = '14:00 às 22:30',
  contact = '(44) 96666-3333'
WHERE
  name = 'Cine Diversão';

UPDATE
  stores
SET
  description = 'Cafeteria local com cafés especiais, bolos caseiros, salgados e ambiente para encontros.',
  address = 'Rua Francisco Ferreira Albuquerque',
  address_number = '610',
  neighborhood = 'Centro',
  city = 'Campo Mourão',
  state = 'PR',
  postal_code = '87300-450',
  country = 'Brasil',
  latitude = -24.04570000,
  longitude = -52.38080000,
  opening_hours = '07:30 às 19:00',
  contact = '(44) 95555-4444'
WHERE
  name = 'Café Central';

UPDATE
  stores
SET
  description = 'Farmácia com medicamentos, produtos de higiene, perfumaria e atendimento personalizado.',
  address = 'Avenida Goioerê',
  address_number = '980',
  neighborhood = 'Centro',
  city = 'Campo Mourão',
  state = 'PR',
  postal_code = '87300-100',
  country = 'Brasil',
  latitude = -24.04710000,
  longitude = -52.37640000,
  opening_hours = '08:00 às 21:00',
  contact = '(44) 94444-5555'
WHERE
  name = 'Farmácia Saúde Mais';

UPDATE
  stores
SET
  description = 'Academia com musculação, funcional, personal trainer e planos mensais.',
  address = 'Rua Araruna',
  address_number = '300',
  neighborhood = 'Jardim Aeroporto',
  city = 'Campo Mourão',
  state = 'PR',
  postal_code = '87306-220',
  country = 'Brasil',
  latitude = -24.05490000,
  longitude = -52.39010000,
  opening_hours = '06:00 às 22:00',
  contact = '(44) 93333-6666'
WHERE
  name = 'Academia Corpo Ativo';

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
  'Nova coleção casual',
  'Camisetas, calças e vestidos com descontos especiais para a semana.',
  ''
FROM
  stores s
  JOIN categories c ON c.name = 'Roupas'
WHERE
  s.name = 'Estilo Urbano'
  AND NOT EXISTS (
    SELECT
      1
    FROM
      posts p
    WHERE
      p.title = 'Nova coleção casual'
      AND p.store_id = s.id
  );

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
  'Ofertas da semana',
  'Arroz, feijão, óleo, leite e produtos de limpeza com preços promocionais.',
  ''
FROM
  stores s
  JOIN categories c ON c.name = 'Mercado'
WHERE
  s.name = 'Mercado Bom Preço'
  AND NOT EXISTS (
    SELECT
      1
    FROM
      posts p
    WHERE
      p.title = 'Ofertas da semana'
      AND p.store_id = s.id
  );

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
  'Sessão especial de sábado',
  'Filmes para toda a família com combo promocional de pipoca e refrigerante.',
  ''
FROM
  stores s
  JOIN categories c ON c.name = 'Lazer'
WHERE
  s.name = 'Cine Diversão'
  AND NOT EXISTS (
    SELECT
      1
    FROM
      posts p
    WHERE
      p.title = 'Sessão especial de sábado'
      AND p.store_id = s.id
  );

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
  'Café especial da casa',
  'Experimente nosso cappuccino artesanal acompanhado de bolo de cenoura.',
  ''
FROM
  stores s
  JOIN categories c ON c.name = 'Comida'
WHERE
  s.name = 'Café Central'
  AND NOT EXISTS (
    SELECT
      1
    FROM
      posts p
    WHERE
      p.title = 'Café especial da casa'
      AND p.store_id = s.id
  );

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
  'Produtos de higiene em promoção',
  'Sabonetes, shampoos, desodorantes e itens de cuidado pessoal com preços especiais.',
  ''
FROM
  stores s
  JOIN categories c ON c.name = 'Mercado'
WHERE
  s.name = 'Farmácia Saúde Mais'
  AND NOT EXISTS (
    SELECT
      1
    FROM
      posts p
    WHERE
      p.title = 'Produtos de higiene em promoção'
      AND p.store_id = s.id
  );

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
  'Plano mensal promocional',
  'Matricule-se esta semana e ganhe avaliação física gratuita.',
  ''
FROM
  stores s
  JOIN categories c ON c.name = 'Lazer'
WHERE
  s.name = 'Academia Corpo Ativo'
  AND NOT EXISTS (
    SELECT
      1
    FROM
      posts p
    WHERE
      p.title = 'Plano mensal promocional'
      AND p.store_id = s.id
  );