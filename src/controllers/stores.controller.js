const pool = require('../config/db');

const storesController = {
  create: async (req, res) => {
    try {
      const {
        ownerUserId,
        categoryId,
        name,
        description,
        address,
        openingHours,
        contact
      } = req.body;

      if (!ownerUserId || !categoryId || !name) {
        return res.status(400).json({
          message: 'ownerUserId, categoryId e name são obrigatórios.'
        });
      }

      const { rows } = await pool.query(
        `
          INSERT INTO stores (
            owner_user_id,
            category_id,
            name,
            description,
            address,
            opening_hours,
            contact
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING
            id,
            owner_user_id AS "ownerUserId",
            category_id AS "categoryId",
            name,
            description,
            address,
            opening_hours AS "openingHours",
            contact
        `,
        [ownerUserId, categoryId, name, description ?? null, address ?? null, openingHours ?? null, contact ?? null]
      );

      return res.status(201).json({
        message: 'Loja cadastrada com sucesso.',
        store: rows[0]
      });
    } catch (error) {
      if (error.code === '23503') {
        return res.status(400).json({
          message: 'ownerUserId ou categoryId inválido.'
        });
      }

      return res.status(500).json({
        message: 'Erro ao cadastrar loja.',
        error: error.message
      });
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const { rows } = await pool.query(
        `
          SELECT
            s.id,
            s.name,
            s.description,
            c.name AS category,
            s.address,
            s.opening_hours AS "openingHours",
            s.contact
          FROM stores s
          LEFT JOIN categories c ON c.id = s.category_id
          WHERE s.id = $1
        `,
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          message: 'Loja não encontrada.'
        });
      }

      return res.status(200).json(rows[0]);
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao buscar loja.',
        error: error.message
      });
    }
  }
};

module.exports = storesController;