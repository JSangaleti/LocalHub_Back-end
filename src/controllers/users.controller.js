const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const ALLOWED_USER_TYPES = new Set(['cliente', 'comercio', 'admin']);

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 42;
const SALT_ROUNDS = 10;

const parsePositiveInteger = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const validatePassword = (password) => {
  if (typeof password !== 'string' || password.trim().length === 0) {
    return 'A senha é obrigatória.';
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    return `A senha deve ter no máximo ${MAX_PASSWORD_LENGTH} caracteres.`;
  }

  return null;
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
            image_url AS "profileImageUrl",
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
            image_url AS "profileImageUrl",
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

  getFavoriteStores: async (req, res) => {
    try {
      const userId = parsePositiveInteger(req.params.id);
      if (!userId) {
        return res.status(400).json({ message: 'ID de usuário inválido.' });
      }

      const userResult = await pool.query('SELECT 1 FROM users WHERE id = $1', [userId]);
      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
      }

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
            s.contact,
            s.profile_image_url AS "profileImageUrl",
            s.is_active AS "isActive"
          FROM favorite_stores fs
          JOIN stores s ON s.id = fs.store_id
          LEFT JOIN categories c ON c.id = s.category_id
          WHERE fs.user_id = $1
          ORDER BY fs.created_at DESC
        `,
        [userId]
      );

      return res.status(200).json(rows);
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao listar lojas favoritas.',
        error: error.message
      });
    }
  },

  addFavoriteStore: async (req, res) => {
    try {
      const userId = parsePositiveInteger(req.params.id);
      const storeId = parsePositiveInteger(req.params.storeId);
      if (!userId || !storeId) {
        return res.status(400).json({ message: 'ID de usuário ou loja inválido.' });
      }

      const { rows } = await pool.query(
        `
          INSERT INTO favorite_stores (user_id, store_id)
          SELECT $1, $2
          WHERE EXISTS (SELECT 1 FROM users WHERE id = $1)
            AND EXISTS (SELECT 1 FROM stores WHERE id = $2)
          ON CONFLICT (user_id, store_id) DO NOTHING
          RETURNING user_id, store_id
        `,
        [userId, storeId]
      );

      if (rows.length > 0) {
        return res.status(201).json({ message: 'Loja adicionada aos favoritos.' });
      }

      const existing = await pool.query(
        `
          SELECT
            EXISTS (SELECT 1 FROM users WHERE id = $1) AS "userExists",
            EXISTS (SELECT 1 FROM stores WHERE id = $2) AS "storeExists"
        `,
        [userId, storeId]
      );

      if (!existing.rows[0].userExists || !existing.rows[0].storeExists) {
        return res.status(404).json({ message: 'Usuário ou loja não encontrado.' });
      }

      return res.status(200).json({ message: 'Loja já está nos favoritos.' });
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao favoritar loja.',
        error: error.message
      });
    }
  },

  removeFavoriteStore: async (req, res) => {
    try {
      const userId = parsePositiveInteger(req.params.id);
      const storeId = parsePositiveInteger(req.params.storeId);
      if (!userId || !storeId) {
        return res.status(400).json({ message: 'ID de usuário ou loja inválido.' });
      }

      const { rows } = await pool.query(
        `DELETE FROM favorite_stores
         WHERE user_id = $1 AND store_id = $2
         RETURNING user_id`,
        [userId, storeId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Loja não estava nos favoritos.' });
      }

      return res.status(200).json({ message: 'Loja removida dos favoritos.' });
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao remover loja dos favoritos.',
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
        const passwordError = validatePassword(password);

        if (passwordError) {
          return res.status(400).json({
            message: passwordError
          });
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        values.push(passwordHash);
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
            image_url AS "profileImageUrl",
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
