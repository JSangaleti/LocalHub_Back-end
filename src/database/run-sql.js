const fs = require('fs/promises');
const path = require('path');
const pool = require('../config/db');

const SQL_FILES = {
  schema: path.resolve(__dirname, 'schema.sql'),
  seed: path.resolve(__dirname, 'seed.sql')
};
const MIGRATIONS_DIR = path.resolve(__dirname, 'migrations');

const runFile = async (filePath) => {
  const sql = await fs.readFile(filePath, 'utf8');
  await pool.query(sql);
};

const ensureMigrationsTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
};

const runMigrations = async () => {
  await ensureMigrationsTable();

  const migrationFiles = (await fs.readdir(MIGRATIONS_DIR))
    .filter((file) => file.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b));

  const { rows } = await pool.query('SELECT name FROM schema_migrations');
  const applied = new Set(rows.map((row) => row.name));

  for (const fileName of migrationFiles) {
    if (applied.has(fileName)) {
      continue;
    }

    const filePath = path.resolve(MIGRATIONS_DIR, fileName);
    const sql = await fs.readFile(filePath, 'utf8');
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [fileName]);
      await client.query('COMMIT');
      console.log(`Migration aplicada: ${fileName}`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  if (migrationFiles.length === 0) {
    console.log('Nenhuma migration encontrada.');
  }
};

const run = async () => {
  const mode = process.argv[2] || 'all';

  if (!['schema', 'seed', 'migrate', 'all'].includes(mode)) {
    console.error('Modo inválido. Use: schema | seed | migrate | all');
    process.exit(1);
  }

  try {
    if (mode === 'schema') {
      await runFile(SQL_FILES.schema);
      console.log('Schema aplicado com sucesso.');
    }

    if (mode === 'seed') {
      await runFile(SQL_FILES.seed);
      console.log('Seed aplicado com sucesso.');
    }

    if (mode === 'migrate' || mode === 'all') {
      await runMigrations();
      console.log('Migrations executadas com sucesso.');
    }

    if (mode === 'all') {
      await runFile(SQL_FILES.seed);
      console.log('Seed aplicado com sucesso.');
    }
  } catch (error) {
    console.error('Falha ao executar SQL:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

run();
