# Documentação do Backend

Esta pasta reúne documentos técnicos relacionados ao backend do projeto **LocalHub**.

## Arquivos

- [`backend-architecture.md`](./backend-architecture.md): explica a arquitetura geral do backend, incluindo rotas, controllers, configurações, Docker e fluxo das requisições.
- [`database.md`](./database.md): explica a organização dos arquivos relacionados ao banco de dados, migrations, seed e inicialização do banco em ambiente local ou Docker.

## Objetivo

O objetivo desta documentação é facilitar o entendimento da estrutura interna do backend, ajudando novos integrantes do projeto a compreenderem como a API está organizada e como suas principais partes se comunicam.

## Localização no projeto

A pasta `docs/` deve ficar na raiz do repositório, no mesmo nível de `src/`, `package.json`, `README.md`, `Dockerfile` e `docker-compose.yml`.

Exemplo:

```text
LocalHub_Back-end/
├── docs/
│   ├── README.md
│   ├── backend-architecture.md
│   └── database.md
├── src/
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```
