# Arquitetura do Backend

O backend do **LocalHub** foi desenvolvido com **Node.js**, **Express**, **PostgreSQL**, **Swagger**, **Docker** e **Docker Compose**.

A aplicação segue uma organização simples em camadas, separando responsabilidades entre configurações, rotas, controllers, middlewares e banco de dados.

## Estrutura geral

A estrutura principal do backend está organizada dentro da pasta `src/`:

```text
src/
├── config/
├── controllers/
├── database/
├── middlewares/
├── routes/
├── app.js
└── server.js
```

Além da pasta `src/`, o projeto possui arquivos importantes na raiz:

```text
Dockerfile
docker-compose.yml
package.json
README.md
docs/
```

---

## Execução com Docker

O backend está dockerizado.

A raiz do projeto possui um `Dockerfile`, responsável por construir a imagem da aplicação Node.js.

O `docker-compose.yml` define dois serviços principais:

- `postgres`: container do banco PostgreSQL;
- `backend`: container da API Node.js/Express.

Fluxo simplificado:

```text
docker compose up --build
  ↓
cria/sobe container do PostgreSQL
  ↓
constrói/sobe container do backend
  ↓
API disponível em http://localhost:3000
```

Dentro do Docker, o backend deve acessar o banco pelo nome do serviço:

```env
DB_HOST=postgres
```

Isso é necessário porque, dentro do container do backend, `localhost` aponta para o próprio container da API, e não para o container do banco.

---

## `server.js`

O arquivo `src/server.js` é o ponto de entrada da aplicação.

Ele carrega as variáveis de ambiente, importa a aplicação configurada em `app.js` e inicia o servidor na porta definida em `process.env.PORT`. Caso essa variável não exista, a aplicação utiliza a porta `3000`.

Responsabilidades principais:

- carregar variáveis de ambiente;
- importar a aplicação Express;
- iniciar o servidor HTTP;
- exibir no terminal as URLs principais da API e do Swagger.

Fluxo simplificado:

```text
server.js → carrega app.js → inicia servidor na porta configurada
```

---

## `app.js`

O arquivo `src/app.js` é responsável por configurar a aplicação Express.

Nele são registrados:

- o Express;
- o CORS;
- o parser de JSON;
- a rota raiz `/`;
- a documentação Swagger em `/docs`;
- as rotas da API em `/api`;
- o middleware global de erro.

A documentação Swagger é disponibilizada em:

```text
GET /docs
```

As rotas principais da API são registradas a partir de:

```text
/api
```

Assim, uma rota definida como `/users` dentro da pasta `routes` fica acessível como:

```text
/api/users
```

Fluxo simplificado:

```text
requisição HTTP → app.js → middlewares → /api → routes
```

---

## Pasta `routes`

A pasta `src/routes/` contém os arquivos responsáveis por definir os endpoints da API.

Esses arquivos não devem concentrar regra de negócio. A função principal deles é associar uma URL e um método HTTP a uma função de controller.

Exemplo geral:

```js
router.get('/', controller.getAll);
router.post('/', controller.create);
router.get('/:id', controller.getById);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);
```

O arquivo `src/routes/index.js` centraliza os grupos de rotas da aplicação.

Atualmente, ele registra rotas para:

- `health`;
- `auth`;
- `posts`;
- `stores`;
- `categories`;
- `users`.

A partir disso, os endpoints principais ficam organizados assim:

```text
/api/health
/api/auth
/api/posts
/api/stores
/api/categories
/api/users
```

---

## Pasta `controllers`

A pasta `src/controllers/` contém a lógica responsável por processar as requisições recebidas pelas rotas.

Os controllers recebem os objetos `req` e `res` do Express e são responsáveis por:

- ler parâmetros da URL;
- ler dados do corpo da requisição;
- validar dados básicos;
- executar consultas no banco;
- retornar respostas HTTP;
- tratar erros esperados.

Exemplo de responsabilidades de um controller:

```text
receber requisição → validar dados → consultar banco → retornar resposta
```

Exemplos de controllers do projeto:

```text
auth.controller.js
categories.controller.js
health.controller.js
posts.controller.js
stores.controller.js
users.controller.js
```

Cada controller está relacionado a um conjunto de rotas.

Exemplos:

```text
users.routes.js → users.controller.js
stores.routes.js → stores.controller.js
posts.routes.js → posts.controller.js
```

No estado atual do projeto, os controllers concentram tanto a regra simples da aplicação quanto as consultas SQL. Isso é aceitável para o tamanho atual do backend, mas futuramente o projeto pode evoluir para separar melhor essas responsabilidades em camadas de `services` e `repositories`.

---

## Pasta `config`

A pasta `src/config/` concentra configurações técnicas utilizadas pela aplicação.

Atualmente, os principais arquivos são:

```text
db.js
swagger.js
```

---

## `config/db.js`

O arquivo `src/config/db.js` configura a conexão com o banco de dados PostgreSQL.

Ele utiliza o pacote `pg` e cria um `Pool` de conexões.

As configurações são lidas a partir das variáveis de ambiente:

```env
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_NAME
```

Em execução local, normalmente `DB_HOST=localhost`.

Em execução com Docker Compose, o serviço `backend` deve usar `DB_HOST=postgres`.

Responsabilidades principais:

- carregar variáveis de ambiente;
- criar o pool de conexão com PostgreSQL;
- exportar o pool para ser utilizado pelos controllers;
- registrar erro inesperado de conexão.

Fluxo simplificado:

```text
controller → pool.query(...) → PostgreSQL
```

---

## `config/swagger.js`

O arquivo `src/config/swagger.js` configura a documentação da API com Swagger/OpenAPI.

Ele define:

- título da API;
- versão;
- descrição;
- servidor local;
- tags dos grupos de endpoints;
- schemas reutilizáveis;
- responses reutilizáveis;
- arquivos de rotas que serão lidos pelo Swagger.

A documentação é montada a partir dos comentários `@swagger` presentes nos arquivos da pasta `routes`.

O Swagger fica disponível em:

```text
http://localhost:3000/docs
```

---

## Pasta `middlewares`

A pasta `src/middlewares/` contém funções intermediárias utilizadas no fluxo de requisição.

Atualmente, o principal middleware é:

```text
error-handler.js
```

Esse middleware é registrado no final do `app.js`, depois das rotas.

A função dele é centralizar o tratamento de erros não tratados diretamente pelos controllers.

Fluxo simplificado:

```text
requisição → rota → controller → erro → error-handler
```

---

## Pasta `database`

A pasta `src/database/` contém arquivos relacionados à estrutura e inicialização do banco de dados.

Ela possui arquivos como:

```text
schema.sql
seed.sql
run-sql.js
migrations/
```

Esses arquivos são usados para criar tabelas, aplicar migrations e inserir dados iniciais no banco.

---

## Fluxo completo de uma requisição

O fluxo geral de uma requisição no backend do LocalHub funciona assim:

```text
Cliente
  ↓
Requisição HTTP
  ↓
app.js
  ↓
routes/index.js
  ↓
arquivo de rota específico
  ↓
controller correspondente
  ↓
config/db.js
  ↓
PostgreSQL
  ↓
controller monta a resposta
  ↓
cliente recebe JSON
```

---

## Exemplo prático: listagem de posts

Quando o cliente faz a seguinte requisição:

```text
GET /api/posts
```

O fluxo interno é:

```text
app.js
  ↓
routes/index.js
  ↓
posts.routes.js
  ↓
posts.controller.js
  ↓
db.js
  ↓
PostgreSQL
```

O controller consulta os dados dos posts, lojas e categorias no banco e retorna uma resposta JSON.

---

## Responsabilidade de cada camada

| Camada               | Responsabilidade                                       |
| -------------------- | ------------------------------------------------------ |
| `Dockerfile`         | Define como construir a imagem do backend              |
| `docker-compose.yml` | Sobe backend e PostgreSQL juntos                       |
| `server.js`          | Iniciar o servidor                                     |
| `app.js`             | Configurar Express, middlewares, Swagger e rotas       |
| `routes/`            | Definir endpoints da API                               |
| `controllers/`       | Processar requisições e respostas                      |
| `config/`            | Centralizar configurações técnicas                     |
| `database/`          | Organizar scripts de banco de dados                    |
| `middlewares/`       | Executar funções intermediárias no fluxo da requisição |

---

## Possíveis evoluções futuras

Caso o backend cresça, pode ser interessante adicionar novas camadas:

- `services/`: para concentrar regras de negócio;
- `repositories/`: para concentrar acesso ao banco de dados;
- `validators/`: para centralizar validações de entrada;
- `tests/`: para testes automatizados da API.

No estado atual, a arquitetura simples é suficiente para o contexto acadêmico do projeto e para o tamanho atual da aplicação.
