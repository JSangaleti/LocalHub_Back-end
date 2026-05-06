const pool = require('../config/db');

const ALLOWED_USER_TYPES = new Set(['cliente', 'comercio', 'admin']);

const parsePositiveInteger = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const usersController = {
  getAll: async (req, res) => {
    try {
      const { rows } = await pool.query(
        `
          SELECT
            id,
            name,
            email,
            user_type AS "userType",
            created_at AS "createdAt",
            updated_at AS "updatedAt"
          FROM users
          ORDER BY id DESC
        `
      );

      return res.status(200).json(rows);
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao listar usuários.',
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
            email,
            user_type AS "userType",
            created_at AS "createdAt",
            updated_at AS "updatedAt"
          FROM users
          WHERE id = $1
        `,
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          message: 'Usuário não encontrado.'
        });
      }

      return res.status(200).json(rows[0]);
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao buscar usuário.',
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

      const { name, email, password, userType } = req.body;
      const updates = [];
      const values = [];

      if (name !== undefined) {
        values.push(name.trim());
        updates.push(`name = $${values.length}`);
      }

      if (email !== undefined) {
        values.push(email.trim().toLowerCase());
        updates.push(`email = $${values.length}`);
      }

      if (password !== undefined) {
        if (password.length < 6) {
          return res.status(400).json({
            message: 'A senha deve ter pelo menos 6 caracteres.'
          });
        }
        values.push(password);
        updates.push(`password = $${values.length}`);
      }

      if (userType !== undefined) {
        const normalizedUserType = userType.trim().toLowerCase();

        if (!ALLOWED_USER_TYPES.has(normalizedUserType)) {
          return res.status(400).json({
            message: 'userType inválido. Valores permitidos: cliente, comercio, admin.'
          });
        }

        values.push(normalizedUserType);
        updates.push(`user_type = $${values.length}`);
      }

      if (updates.length === 0) {
        return res.status(400).json({
          message: 'Informe ao menos um campo para atualização.'
        });
      }

      values.push(id);

      const { rows } = await pool.query(
        `
          UPDATE users
          SET ${updates.join(', ')}
          WHERE id = $${values.length}
          RETURNING
            id,
            name,
            email,
            user_type AS "userType",
            created_at AS "createdAt",
            updated_at AS "updatedAt"
        `,
        values
      );

      if (rows.length === 0) {
        return res.status(404).json({
          message: 'Usuário não encontrado.'
        });
      }

      return res.status(200).json({
        message: 'Usuário atualizado com sucesso.',
        user: rows[0]
      });
    } catch (error) {
      if (error.code === '23505') {
        return res.status(409).json({
          message: 'E-mail já cadastrado.'
        });
      }

      return res.status(500).json({
        message: 'Erro ao atualizar usuário.',
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
          DELETE FROM users
          WHERE id = $1
          RETURNING id
        `,
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          message: 'Usuário não encontrado.'
        });
      }

      return res.status(200).json({
        message: 'Usuário removido com sucesso.'
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao remover usuário.',
        error: error.message
      });
    }
  }
};

module.exports = usersController;