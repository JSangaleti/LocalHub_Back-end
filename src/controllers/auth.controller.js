const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const ALLOWED_USER_TYPES = new Set(['cliente', 'comercio', 'admin']);
const ADMIN_EMAIL = 'admin@admin.com';

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 42;
const SALT_ROUNDS = 10;

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

const authController = {
  register: async (req, res) => {
    try {
      const { name, email, password, userType } = req.body;

      if (!name || !email) {
        return res.status(400).json({
          message: 'name e email são obrigatórios.'
        });
      }

      const passwordError = validatePassword(password);

      if (passwordError) {
        return res.status(400).json({
          message: passwordError
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const normalizedUserType = userType ? userType.trim().toLowerCase() : 'cliente';

      if (normalizedEmail === ADMIN_EMAIL) {
        return res.status(403).json({
          message: 'Este e-mail é reservado ao administrador do sistema.'
        });
      }

      if (normalizedUserType === 'admin') {
        return res.status(403).json({
          message: 'Não é permitido cadastrar usuários administradores.'
        });
      }

      if (!ALLOWED_USER_TYPES.has(normalizedUserType)) {
        return res.status(400).json({
          message: 'userType inválido. Valores permitidos: cliente, comercio.'
        });
      }

      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

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
        [name.trim(), normalizedEmail, passwordHash, normalizedUserType]
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

      const userRecord = rows[0];

      if (!userRecord) {
        return res.status(401).json({
          message: 'Credenciais inválidas.'
        });
      }

      const isPasswordValid = await bcrypt.compare(password, userRecord.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          message: 'Credenciais inválidas.'
        });
      }

      const user = {
        id: userRecord.id,
        name: userRecord.name,
        email: userRecord.email,
        userType: userRecord.userType
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