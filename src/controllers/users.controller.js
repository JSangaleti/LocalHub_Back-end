const pool = require('../config/db');

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
  }
};

module.exports = usersController;