# LocalHub - Backend

Backend da aplicação **LocalHub**, uma plataforma mobile de divulgação e descoberta de comércios locais com funcionamento inspirado em redes sociais.

A proposta do sistema é permitir que o usuário, com base em sua localização, visualize estabelecimentos comerciais próximos e explore publicações feitas por esses comércios em categorias como restaurantes, lojas de roupas, shoppings, mercados, entre outras.

## Sobre

O backend do LocalHub é responsável por fornecer a infraestrutura da aplicação, incluindo:

- gerenciamento de dados dos comércios;
- organização por categorias;
- disponibilização de publicações para o feed;
- integração com banco de dados PostgreSQL;
- documentação da API com Swagger.

A documentação técnica complementar fica em:

```text
docs/
├── README.md
├── backend-architecture.md
└── database.md
```

## Tecnologias utilizadas

- **Node.js**
- **Express**
- **PostgreSQL**
- **Swagger**
- **Docker**
- **Docker Compose**

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

| Campo | Valor |
|-------|-------|
| E-mail | `admin@admin.com` |
| Senha | `admin123` |

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
```

Em modo local, o `DB_HOST` deve ser `localhost`, pois a aplicação está rodando fora do Docker.

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
```

---

## Documentação técnica

A documentação técnica do backend fica na pasta `docs/`.

Arquivos principais:

- [`docs/backend-architecture.md`](./docs/backend-architecture.md)
- [`docs/database.md`](./docs/database.md)
