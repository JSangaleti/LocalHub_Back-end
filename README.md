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
	git clone https://github.com/JSangaleti/LocalHub_Back-end.git
	cd LocalHub_Back-end
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

- `npm run db:schema`: aplica apenas a modelagem;
- `npm run db:migrate`: aplica apenas as migrations pendentes;
- `npm run db:seed`: aplica apenas dados iniciais;
- `npm run db:init`: aplica migrations + seed.

## End-points iniciais implementados

Todos os *end-points* estão documentados no Swagger em `localhost:3000/docs`.