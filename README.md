# LocalHub - Backend

Backend da aplicação **LocalHub**, uma plataforma mobile de divulgação e descoberta de comércios locais com funcionamento inspirado em redes sociais.

A proposta do sistema é permitir que o usuário, com base em sua localização, visualize estabelecimentos comerciais próximos e explore publicações feitas por esses comércios em categorias como restaurantes, lojas de roupas, shoppings, mercados, entre outras.

## Sobre

O backend do LocalHub é responsável por fornecer a infraestrutura da aplicação, incluindo:

- gerenciamento de dados dos comércios;
- organização por categorias;
- disponibilização de publicações para o feed;
- integração com banco de dados PostgreSQL;
- documentação da API com Swagger;
- geocodificação reversa para sugerir endereço a partir de latitude/longitude.

A documentação técnica complementar fica em:

```text
docs/
├── README.md
├── backend-architecture.md
└── database.md
```

## Sumário

- [LocalHub - Backend](#localhub---backend)
  - [Sobre](#sobre)
  - [Sumário](#sumário)
  - [Tecnologias utilizadas](#tecnologias-utilizadas)
  - [Como executar com Docker](#como-executar-com-docker)
    - [1. Clone o repositório](#1-clone-o-repositório)
    - [2. Suba a API e o banco](#2-suba-a-api-e-o-banco)
    - [3. Inicialize o banco de dados](#3-inicialize-o-banco-de-dados)
    - [4. Acesse a aplicação](#4-acesse-a-aplicação)
    - [Conta administrador (seed)](#conta-administrador-seed)
    - [5. Ver logs](#5-ver-logs)
    - [6. Parar os containers](#6-parar-os-containers)
    - [7. Resetar o banco local](#7-resetar-o-banco-local)
  - [Como executar em modo local](#como-executar-em-modo-local)
    - [1. Instale as dependências](#1-instale-as-dependências)
    - [2. Configure o arquivo `.env`](#2-configure-o-arquivo-env)
    - [Variáveis de geocodificação](#variáveis-de-geocodificação)
    - [3. Suba somente o PostgreSQL](#3-suba-somente-o-postgresql)
    - [4. Inicialize o banco](#4-inicialize-o-banco)
    - [5. Inicie a API em desenvolvimento](#5-inicie-a-api-em-desenvolvimento)
  - [Variáveis de ambiente](#variáveis-de-ambiente)
  - [Banco de dados](#banco-de-dados)
  - [Geocodificação reversa](#geocodificação-reversa)
    - [Endpoint](#endpoint)
    - [Exemplo de uso](#exemplo-de-uso)
    - [Exemplo de resposta](#exemplo-de-resposta)
    - [Possíveis erros](#possíveis-erros)
    - [Cuidados de uso](#cuidados-de-uso)
  - [Documentação da API](#documentação-da-api)
  - [Documentação técnica](#documentação-técnica)

## Tecnologias utilizadas

- **Node.js**
- **Express**
- **PostgreSQL**
- **Swagger**
- **Docker**
- **Docker Compose**
- **OpenStreetMap/Nominatim**

## Como executar com Docker

Este é o fluxo recomendado para executar o backend.

O `docker-compose.yml` sobe dois serviços:

- `postgres`: banco de dados PostgreSQL;
- `backend`: aplicação Node.js/Express.

### 1. Clone o repositório

```bash
git clone https://github.com/JSangaleti/LocalHub_Back-end.git
cd LocalHub_Back-end
```

Se estiver trabalhando durante a sprint, utilize a branch de desenvolvimento:

```bash
git checkout development
```

### 2. Suba a API e o banco

```bash
docker compose up -d --build
```

Esse comando constrói a imagem da aplicação e sobe os containers do backend e do PostgreSQL.

### 3. Inicialize o banco de dados

Depois que os containers estiverem rodando, execute:

```bash
docker compose exec backend npm run db:init
```

Esse comando aplica as migrations e executa o seed inicial no banco.

### 4. Acesse a aplicação

- API: <http://localhost:3000>
- Health check: <http://localhost:3000/api/health>
- Swagger: <http://localhost:3000/docs>

### Conta administrador (seed)

Após `npm run db:init` ou `npm run db:seed`, o sistema possui um único usuário administrador:

| Campo  | Valor             |
| ------ | ----------------- |
| E-mail | `admin@admin.com` |
| Senha  | `admin123`        |

Não é possível criar outro usuário `admin` pelo cadastro público (`POST /api/auth/register`).

### 5. Ver logs

Para acompanhar os logs do backend:

```bash
docker compose logs -f backend
```

Para acompanhar os logs do PostgreSQL:

```bash
docker compose logs -f postgres
```

### 6. Parar os containers

```bash
docker compose down
```

### 7. Resetar o banco local

Caso seja necessário apagar o volume do PostgreSQL e recriar o banco do zero:

```bash
docker compose down -v
docker compose up -d --build
docker compose exec backend npm run db:init
```

> Atenção: o comando `docker compose down -v` remove os volumes do Docker, apagando os dados locais do banco.

---

## Como executar em modo local

Use este fluxo apenas se quiser rodar a API diretamente na máquina, fora do container, mantendo somente o PostgreSQL no Docker.

### 1. Instale as dependências

```bash
npm install
```

### 2. Configure o arquivo `.env`

Crie ou ajuste o arquivo `.env` na raiz do projeto:

```env
PORT=3000
PROJECT_NAME=localhub

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=localhubdb

NOMINATIM_BASE_URL=https://nominatim.openstreetmap.org
NOMINATIM_USER_AGENT=LocalHub_Back-end/1.0 (https://github.com/JSangaleti/LocalHub_Back-end)
```

Em modo local, o `DB_HOST` deve ser `localhost`, pois a aplicação está rodando fora do Docker.

### Variáveis de geocodificação

A geocodificação reversa usa OpenStreetMap/Nominatim.

| Variável               | Obrigatória | Valor padrão                                                              | Função                                              |
| ---------------------- | ----------- | ------------------------------------------------------------------------- | --------------------------------------------------- |
| `NOMINATIM_BASE_URL`   | Não         | `https://nominatim.openstreetmap.org`                                     | URL base do serviço de geocodificação reversa.      |
| `NOMINATIM_USER_AGENT` | Não         | `LocalHub_Back-end/1.0 (https://github.com/JSangaleti/LocalHub_Back-end)` | Identificação enviada ao Nominatim nas requisições. |

Mesmo tendo valor padrão no código, é recomendado configurar `NOMINATIM_USER_AGENT` de forma identificável, principalmente em ambientes compartilhados.

### 3. Suba somente o PostgreSQL

```bash
docker compose up -d postgres
```

Não use `docker compose up -d` neste fluxo, pois esse comando também sobe o container do backend e pode causar conflito com o `npm run dev` usando a mesma porta `3000`.

### 4. Inicialize o banco

```bash
npm run db:init
```

### 5. Inicie a API em desenvolvimento

```bash
npm run dev
```

Acesse:

- API: <http://localhost:3000>
- Health check: <http://localhost:3000/api/health>
- Swagger: <http://localhost:3000/docs>

---

## Variáveis de ambiente

No Docker Compose, as variáveis do backend são definidas diretamente no serviço `backend`.

Dentro do Docker, o backend deve se conectar ao banco usando:

```env
DB_HOST=postgres
```

Isso acontece porque `postgres` é o nome do serviço do banco no `docker-compose.yml`.

Em execução local, o backend deve usar:

```env
DB_HOST=localhost
```

---

## Banco de dados

Os arquivos de banco ficam em `src/database`:

- `schema.sql`: estrutura relacional inicial;
- `seed.sql`: dados iniciais para ambiente local;
- `migrations/*.sql`: migrations versionadas da estrutura do banco;
- `run-sql.js`: executor para aplicar schema, migrations e seed usando as variáveis de ambiente do projeto.

Scripts disponíveis:

```bash
npm run db:schema
npm run db:migrate
npm run db:seed
npm run db:init
```

| Script               | Função                       |
| -------------------- | ---------------------------- |
| `npm run db:schema`  | Aplica o schema              |
| `npm run db:migrate` | Executa migrations pendentes |
| `npm run db:seed`    | Insere dados iniciais        |
| `npm run db:init`    | Executa migrations e seed    |

No Docker, execute os scripts dentro do container do backend:

```bash
docker compose exec backend npm run db:init
```

Em modo local, execute diretamente na máquina:

```bash
npm run db:init
```

---

## Geocodificação reversa

O backend possui um endpoint auxiliar para sugerir endereço a partir de latitude e longitude.

Esse recurso foi pensado para o fluxo do frontend em que o usuário seleciona um ponto no mapa. Depois que o ponto é confirmado, o app envia as coordenadas para o backend, e a API retorna uma sugestão de endereço estruturado.

### Endpoint

```http
GET /api/locations/reverse?lat=-24.0463&lng=-52.3780
```

Parâmetros:

| Parâmetro | Obrigatório | Descrição                                                        |
| --------- | ----------- | ---------------------------------------------------------------- |
| `lat`     | Sim         | Latitude do ponto selecionado. Deve estar entre `-90` e `90`.    |
| `lng`     | Sim         | Longitude do ponto selecionado. Deve estar entre `-180` e `180`. |

Também é aceito `lon` como alternativa para `lng`.

### Exemplo de uso

```bash
curl "http://localhost:3000/api/locations/reverse?lat=-24.0463&lng=-52.3780"
```

### Exemplo de resposta

```json
{
  "address": "Rua Brasil",
  "addressNumber": null,
  "neighborhood": "Centro",
  "city": "Campo Mourão",
  "state": "PR",
  "postalCode": "87300-000",
  "country": "Brasil",
  "latitude": -24.0463,
  "longitude": -52.378,
  "formattedAddress": "Rua Brasil - Centro - Campo Mourão - PR",
  "provider": {
    "name": "Nominatim",
    "displayName": "Rua Brasil, Centro, Campo Mourão, Paraná, Brasil",
    "licence": "Data © OpenStreetMap contributors, ODbL 1.0."
  }
}
```

### Possíveis erros

| Status | Quando ocorre                                                      |
| ------ | ------------------------------------------------------------------ |
| `400`  | `lat` ou `lng` ausente, inválido ou fora da faixa permitida.       |
| `404`  | O provedor não encontrou endereço para as coordenadas informadas.  |
| `429`  | O limite de requisições do serviço de geocodificação foi atingido. |
| `502`  | O serviço externo de geocodificação está indisponível.             |
| `500`  | Erro interno ao processar a geocodificação reversa.                |

### Cuidados de uso

- Chame esse endpoint apenas quando o usuário confirmar o ponto no mapa.
- Não chame esse endpoint continuamente durante o arraste do mapa.
- O endereço retornado é uma sugestão e pode precisar de correção manual.
- O número do estabelecimento deve ser confirmado ou preenchido pelo usuário.
- O backend usa cache simples em memória para reduzir chamadas repetidas ao serviço externo.

---

## Documentação da API

Todos os endpoints estão documentados no Swagger:

```text
http://localhost:3000/docs
```

As rotas principais são registradas a partir de `/api`:

```text
/api/health
/api/auth
/api/users
/api/categories
/api/stores
/api/posts
/api/uploads
/api/locations/reverse
```

---

## Documentação técnica

A documentação técnica do backend fica na pasta `docs/`.

Arquivos principais:

- [`docs/backend-architecture.md`](./docs/backend-architecture.md)
- [`docs/database.md`](./docs/database.md)
