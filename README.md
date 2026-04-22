# LocalHub - Backend

Backend da aplicação **LocalHub**, uma plataforma mobile de divulgação e descoberta de comércios locais com funcionamento inspirado em redes sociais.

A proposta do sistema é permitir que o usuário, com base em sua localização, visualize estabelecimentos comerciais próximos e explore publicações feitas por esses comércios em categorias como restaurantes, lojas de roupas, shoppings, mercados, entre outras.

## Sobre

### Objetivo

O backend do LocalHub é responsável por fornecer a infraestrutura da aplicação, incluindo:

- gerenciamento de dados dos comércios;
- organização por categorias;
- disponibilização de publicações para o feed;
- integração com banco de dados PostgreSQL;
- documentação da API com Swagger.

### Tecnologias utilizadas

Este projeto utiliza as seguintes tecnologias:

- **Node.js**
- **Express**
- **PostgreSQL**
- **Swagger**
- **Docker Compose**
- **dotenv**

## Como executar

1. Clone o repositório  
	```sh
	git clone <url-do-repositorio>
	cd backend
	```
2. Instale as dependências  
	```sh
	npm install
	```
3. Configure o arquivo `.env`  
	```text
	PORT=3000
	PROJECT_NAME=localhub
	
	DB_HOST=localhost
	DB_PORT=5432
	DB_USER=postgres
	DB_PASSWORD=postgres
	DB_NAME=localhubdb
	```
	> No caso, há um *template* para `.env` já existente como `.env.example`
4. Suba o banco de dados com Docker Compose  
	```sh
	docker compose up -d
	```
5. Aplique a modelagem e carga inicial no banco
	```sh
	npm run db:init
	```
6. Inicie o servidor  
	```sh
	npm run dev
	```

## Modelagem do banco de dados

Os arquivos de modelagem ficam em `src/database`:

- `schema.sql`: estrutura relacional (`users`, `stores`, `categories`, `posts`), índices, triggers e view `v_feed_posts`;
- `seed.sql`: dados iniciais para ambiente local;
- `migrations/*.sql`: migrations versionadas da estrutura do banco;
- `run-sql.js`: executor para aplicar schema/seed usando as variáveis de ambiente do projeto.

Scripts disponíveis:

- `npm run db:schema` → aplica apenas a modelagem;
- `npm run db:migrate` → aplica apenas as migrations pendentes;
- `npm run db:seed` → aplica apenas dados iniciais;
- `npm run db:init` → aplica migrations + seed.

## Endpoints iniciais implementados

- `POST /api/auth/register` → cadastro de usuário;
- `POST /api/auth/login` → login;
- `GET /api/users` → listagem de usuários;
- `GET /api/stores` → listagem de lojas;
- `POST /api/stores` → cadastro de loja;
- `GET /api/stores/:id` → detalhamento de loja;
- `PUT /api/stores/:id` → atualização de loja;
- `DELETE /api/stores/:id` → remoção de loja;
- `GET /api/categories` → listagem de categorias.

Todos os endpoints acima estão documentados no Swagger em `/docs`.

