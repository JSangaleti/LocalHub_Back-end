const pool = require('../config/db');

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
  }
};

module.exports = categoriesController;
