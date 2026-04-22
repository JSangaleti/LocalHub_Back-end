const pool = require('../config/db');

const ALLOWED_USER_TYPES = new Set(['cliente', 'comercio', 'admin']);

const authController = {
  register: async (req, res) => {
    try {
      const { name, email, password, userType } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          message: 'name, email e password são obrigatórios.'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          message: 'A senha deve ter pelo menos 6 caracteres.'
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const normalizedUserType = userType ? userType.trim().toLowerCase() : 'cliente';

      if (!ALLOWED_USER_TYPES.has(normalizedUserType)) {
        return res.status(400).json({
          message: 'userType inválido. Valores permitidos: cliente, comercio, admin.'
        });
      }

      const { rows } = await pool.query(
        `
          INSERT INTO users (name, email, password, user_type)
          VALUES ($1, $2, $3, $4)
          RETURNING
            id,
            name,
            email,
            user_type AS "userType"
        `,
        [name.trim(), normalizedEmail, password, normalizedUserType]
      );

      return res.status(201).json({
        message: 'Usuário cadastrado com sucesso.',
        user: rows[0]
      });
    } catch (error) {
      if (error.code === '23505') {
        return res.status(409).json({
          message: 'E-mail já cadastrado.'
        });
      }

      return res.status(500).json({
        message: 'Erro ao cadastrar usuário.',
        error: error.message
      });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message: 'E-mail e senha são obrigatórios.'
        });
      }

      const normalizedEmail = email.trim().toLowerCase();

      const { rows } = await pool.query(
        `
          SELECT
            id,
            name,
            email,
            password,
            user_type AS "userType"
          FROM users
          WHERE email = $1
          LIMIT 1
        `,
        [normalizedEmail]
      );

      if (rows.length === 0 || password !== rows[0].password) {
        return res.status(401).json({
          message: 'Credenciais inválidas.'
        });
      }

      const user = {
        id: rows[0].id,
        name: rows[0].name,
        email: rows[0].email,
        userType: rows[0].userType
      };

      return res.status(200).json({
        message: 'Login realizado com sucesso.',
        user
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao realizar login.',
        error: error.message
      });
    }
  }
};

module.exports = authController;