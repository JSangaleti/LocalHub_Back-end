# Banco de Dados

O backend do LocalHub utiliza **PostgreSQL** como banco de dados relacional.

A configuração de conexão fica no arquivo:

```text
src/config/db.js
```

Os arquivos relacionados à estrutura e inicialização do banco ficam em:

```text
src/database/
```

---

## Estrutura da pasta `database`

A pasta `src/database/` contém os arquivos responsáveis por criar, migrar e popular o banco de dados.

Estrutura geral:

```text
src/database/
├── migrations/
├── run-sql.js
├── schema.sql
└── seed.sql
```

---

## `migrations/`

A pasta `migrations/` armazena scripts SQL versionados.

As migrations servem para aplicar alterações incrementais no banco de dados, mantendo um histórico das mudanças estruturais.

Exemplo de nomenclatura:

```text
001_initial_schema.sql
002_add_location_to_stores.sql
003_create_favorites_table.sql
```

Esse padrão ajuda a organizar a evolução do banco durante o desenvolvimento.

---

## `seed.sql`

O arquivo `seed.sql` é utilizado para inserir dados iniciais no banco.

Esses dados ajudam nos testes manuais, na demonstração do sistema e na integração com o front-end.

Exemplos de dados que podem aparecer no seed:

- usuários de teste;
- categorias comerciais;
- lojas/comércios;
- publicações/posts.

---

## `run-sql.js`

O arquivo `run-sql.js` é um script Node.js usado para executar arquivos SQL no banco de dados.

Ele permite rodar comandos para:

- aplicar schema;
- executar migrations;
- aplicar seed;
- executar tudo de uma vez.

O script também cria uma tabela chamada `schema_migrations`, usada para registrar quais migrations já foram aplicadas.

Isso evita que a mesma migration seja executada repetidamente.

---

## Scripts disponíveis

Os scripts relacionados ao banco ficam no `package.json`.

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

---

## Inicialização do banco com Docker

Como o backend está dockerizado, o fluxo recomendado é executar o script de banco dentro do container do backend.

Depois de subir os serviços:

```bash
docker compose up -d --build
```

execute:

```bash
docker compose exec backend npm run db:init
```

Esse comando prepara o banco para uso pela API.

Fluxo geral:

```text
docker compose up --build
  ↓
PostgreSQL sobe no container postgres
  ↓
backend sobe no container backend
  ↓
docker compose exec backend npm run db:init
  ↓
migrations são aplicadas
  ↓
seed é executado
  ↓
API pode consultar os dados
```

---

## Inicialização do banco em modo local

Se a API estiver rodando fora do Docker com `npm run dev`, suba apenas o serviço do PostgreSQL:

```bash
docker compose up -d postgres
```

Depois execute:

```bash
npm run db:init
```

Nesse modo, o `.env` deve usar:

```env
DB_HOST=localhost
```

---

## Diferença entre `localhost` e `postgres`

Em modo local:

```env
DB_HOST=localhost
```

Em modo Docker:

```env
DB_HOST=postgres
```

Dentro de um container, `localhost` aponta para o próprio container. Por isso, quando o backend roda em container, ele deve acessar o banco pelo nome do serviço definido no `docker-compose.yml`.

---

## Relação com os controllers

Os controllers acessam o banco por meio do pool exportado em:

```text
src/config/db.js
```

O fluxo é:

```text
controller → pool.query(...) → PostgreSQL
```

Exemplo conceitual:

```js
const { rows } = await pool.query('SELECT * FROM users');
```

---

## Cuidados importantes

Antes de testar endpoints que dependem do banco, é necessário garantir que as migrations foram aplicadas.

Endpoints como usuários, categorias, lojas e posts dependem das tabelas criadas corretamente.

Caso o banco não esteja inicializado, podem ocorrer erros como:

```text
relation "users" does not exist
```

Esse erro significa que a API tentou consultar uma tabela que ainda não existe no banco conectado.

---

## Reset do banco local

Para apagar o volume do PostgreSQL e recriar o banco do zero:

```bash
docker compose down -v
docker compose up -d --build
docker compose exec backend npm run db:init
```

> Atenção: `docker compose down -v` remove os dados locais armazenados no volume do PostgreSQL.
