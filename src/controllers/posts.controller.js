const pool = require('../config/db');

const parsePositiveInteger = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const postsController = {
  getAll: async (req, res) => {
    try {
      const { rows } = await pool.query(`
      SELECT
        p.id,
        p.store_id AS "storeId",
        s.name AS "storeName",
        p.category_id AS "categoryId",
        c.name AS category,
        p.title,
        p.description,
        p.image_url AS "imageUrl"
      FROM posts p
      JOIN stores s ON s.id = p.store_id
      LEFT JOIN categories c ON c.id = p.category_id
      ORDER BY p.id DESC
    `);

      return res.status(200).json(rows);
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao buscar posts.',
        error: error.message
      });
    }
  },

  create: async (req, res) => {
    try {
      const { storeId, categoryId, title, description, imageUrl } = req.body;

      if (!storeId || !title || !description) {
        return res.status(400).json({
          message: 'storeId, title e description são obrigatórios.'
        });
      }

      const { rows } = await pool.query(
        `
          INSERT INTO posts (store_id, category_id, title, description, image_url)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING
            id,
            store_id AS "storeId",
            category_id AS "categoryId",
            title,
            description,
            image_url AS "imageUrl"
        `,
        [storeId, categoryId ?? null, title, description, imageUrl ?? null]
      );

      return res.status(201).json({
        message: 'Post cadastrado com sucesso.',
        post: rows[0]
      });
    } catch (error) {
      if (error.code === '23503') {
        return res.status(400).json({
          message: 'storeId ou categoryId inválido.'
        });
      }

      return res.status(500).json({
        message: 'Erro ao cadastrar post.',
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
            p.id,
            p.store_id AS "storeId",
            s.name AS "storeName",
            p.category_id AS "categoryId",
            c.name AS category,
            p.title,
            p.description,
            p.image_url AS "imageUrl"
          FROM posts p
          JOIN stores s ON s.id = p.store_id
          LEFT JOIN categories c ON c.id = p.category_id
          WHERE p.id = $1
        `,
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          message: 'Post não encontrado.'
        });
      }

      return res.status(200).json(rows[0]);
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao buscar post.',
        error: error.message
      });
    }
  },

  update: async (req, res) => {
    try {
      const id = parsePositiveInteger(req.params.id);

      if (!id) {
        return res.status(400).json({
          message: 'ID inválido.'
        });
      }

      const { storeId, categoryId, title, description, imageUrl } = req.body;
      const updates = [];
      const values = [];

      if (storeId !== undefined) {
        values.push(storeId);
        updates.push(`store_id = $${values.length}`);
      }
      if (categoryId !== undefined) {
        values.push(categoryId);
        updates.push(`category_id = $${values.length}`);
      }
      if (title !== undefined) {
        values.push(title);
        updates.push(`title = $${values.length}`);
      }
      if (description !== undefined) {
        values.push(description);
        updates.push(`description = $${values.length}`);
      }
      if (imageUrl !== undefined) {
        values.push(imageUrl);
        updates.push(`image_url = $${values.length}`);
      }

      if (updates.length === 0) {
        return res.status(400).json({
          message: 'Informe ao menos um campo para atualização.'
        });
      }

      values.push(id);

      const { rows } = await pool.query(
        `
          UPDATE posts
          SET ${updates.join(', ')}
          WHERE id = $${values.length}
          RETURNING
            id,
            store_id AS "storeId",
            category_id AS "categoryId",
            title,
            description,
            image_url AS "imageUrl"
        `,
        values
      );

      if (rows.length === 0) {
        return res.status(404).json({
          message: 'Post não encontrado.'
        });
      }

      return res.status(200).json({
        message: 'Post atualizado com sucesso.',
        post: rows[0]
      });
    } catch (error) {
      if (error.code === '23503') {
        return res.status(400).json({
          message: 'storeId ou categoryId inválido.'
        });
      }

      return res.status(500).json({
        message: 'Erro ao atualizar post.',
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
          DELETE FROM posts
          WHERE id = $1
          RETURNING id
        `,
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          message: 'Post não encontrado.'
        });
      }

      return res.status(200).json({
        message: 'Post removido com sucesso.'
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao remover post.',
        error: error.message
      });
    }
  }
};

module.exports = postsController;