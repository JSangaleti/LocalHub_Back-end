const pool = require('../config/db');

const parsePositiveInteger = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const storesController = {
  getAll: async (req, res) => {
    try {
      const { rows } = await pool.query(
        `
          SELECT
            s.id,
            s.owner_user_id AS "ownerUserId",
            s.category_id AS "categoryId",
            s.name,
            s.description,
            c.name AS category,
            s.address,
            s.opening_hours AS "openingHours",
            s.contact
          FROM stores s
          LEFT JOIN categories c ON c.id = s.category_id
          ORDER BY s.name ASC, s.id ASC
        `
      );

      return res.status(200).json(rows);
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao listar lojas.',
        error: error.message
      });
    }
  },

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
      const id = parsePositiveInteger(req.params.id);

      if (!id) {
        return res.status(400).json({
          message: 'ID inválido.'
        });
      }

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
  },

  update: async (req, res) => {
    try {
      const id = parsePositiveInteger(req.params.id);

      if (!id) {
        return res.status(400).json({
          message: 'ID inválido.'
        });
      }

      const {
        ownerUserId,
        categoryId,
        name,
        description,
        address,
        openingHours,
        contact
      } = req.body;

      const updates = [];
      const values = [];

      if (ownerUserId !== undefined) {
        values.push(ownerUserId);
        updates.push(`owner_user_id = $${values.length}`);
      }

      if (categoryId !== undefined) {
        values.push(categoryId);
        updates.push(`category_id = $${values.length}`);
      }

      if (name !== undefined) {
        values.push(name);
        updates.push(`name = $${values.length}`);
      }

      if (description !== undefined) {
        values.push(description);
        updates.push(`description = $${values.length}`);
      }

      if (address !== undefined) {
        values.push(address);
        updates.push(`address = $${values.length}`);
      }

      if (openingHours !== undefined) {
        values.push(openingHours);
        updates.push(`opening_hours = $${values.length}`);
      }

      if (contact !== undefined) {
        values.push(contact);
        updates.push(`contact = $${values.length}`);
      }

      if (updates.length === 0) {
        return res.status(400).json({
          message: 'Informe ao menos um campo para atualização.'
        });
      }

      values.push(id);

      const { rows } = await pool.query(
        `
          UPDATE stores
          SET ${updates.join(', ')}
          WHERE id = $${values.length}
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
        values
      );

      if (rows.length === 0) {
        return res.status(404).json({
          message: 'Loja não encontrada.'
        });
      }

      return res.status(200).json({
        message: 'Loja atualizada com sucesso.',
        store: rows[0]
      });
    } catch (error) {
      if (error.code === '23503') {
        return res.status(400).json({
          message: 'ownerUserId ou categoryId inválido.'
        });
      }

      return res.status(500).json({
        message: 'Erro ao atualizar loja.',
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
          DELETE FROM stores
          WHERE id = $1
          RETURNING id
        `,
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          message: 'Loja não encontrada.'
        });
      }

      return res.status(200).json({
        message: 'Loja removida com sucesso.'
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao remover loja.',
        error: error.message
      });
    }
  }
};

module.exports = storesController;