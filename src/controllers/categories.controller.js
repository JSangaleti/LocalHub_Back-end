const pool = require('../config/db');

const parsePositiveInteger = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const categoriesController = {
  getAll: async (req, res) => {
    try {
      const { rows } = await pool.query(
        `
          SELECT id, name
          FROM categories
          ORDER BY name ASC
        `
      );

      return res.status(200).json(rows);
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao buscar categorias.',
        error: error.message
      });
    }
  },

  create: async (req, res) => {
    try {
      const name = req.body.name?.trim();

      if (!name) {
        return res.status(400).json({
          message: 'name é obrigatório.'
        });
      }

      const { rows } = await pool.query(
        `
          INSERT INTO categories (name)
          VALUES ($1)
          RETURNING
            id,
            name,
            created_at AS "createdAt"
        `,
        [name]
      );

      return res.status(201).json({
        message: 'Categoria cadastrada com sucesso.',
        category: rows[0]
      });
    } catch (error) {
      if (error.code === '23505') {
        return res.status(409).json({
          message: 'Já existe uma categoria com esse nome.'
        });
      }

      return res.status(500).json({
        message: 'Erro ao cadastrar categoria.',
        error: error.message
      });
    }
  },

  getById: async (req, res) => {
    try {
      const id = parsePositiveInteger(req.params.id);

      if (!id) {
        return res.status(400).json({
          message: 'ID inválido.'
        });
      }

      const { rows } = await pool.query(
        `
          SELECT
            id,
            name,
            created_at AS "createdAt"
          FROM categories
          WHERE id = $1
        `,
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          message: 'Categoria não encontrada.'
        });
      }

      return res.status(200).json(rows[0]);
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao buscar categoria.',
        error: error.message
      });
    }
  },

  update: async (req, res) => {
    try {
      const id = parsePositiveInteger(req.params.id);
      const name = req.body.name?.trim();

      if (!id) {
        return res.status(400).json({
          message: 'ID inválido.'
        });
      }

      if (!name) {
        return res.status(400).json({
          message: 'name é obrigatório.'
        });
      }

      const { rows } = await pool.query(
        `
          UPDATE categories
          SET name = $1
          WHERE id = $2
          RETURNING
            id,
            name,
            created_at AS "createdAt"
        `,
        [name, id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          message: 'Categoria não encontrada.'
        });
      }

      return res.status(200).json({
        message: 'Categoria atualizada com sucesso.',
        category: rows[0]
      });
    } catch (error) {
      if (error.code === '23505') {
        return res.status(409).json({
          message: 'Já existe uma categoria com esse nome.'
        });
      }

      return res.status(500).json({
        message: 'Erro ao atualizar categoria.',
        error: error.message
      });
    }
  },

  remove: async (req, res) => {
    try {
      const id = parsePositiveInteger(req.params.id);

      if (!id) {
        return res.status(400).json({
          message: 'ID inválido.'
        });
      }

      const { rows } = await pool.query(
        `
          DELETE FROM categories
          WHERE id = $1
          RETURNING id
        `,
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          message: 'Categoria não encontrada.'
        });
      }

      return res.status(200).json({
        message: 'Categoria removida com sucesso.'
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao remover categoria.',
        error: error.message
      });
    }
  }
};

module.exports = categoriesController;
