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
            user_type AS "userType",
            image_url AS "profileImageUrl"
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
            user_type AS "userType",
            image_url AS "profileImageUrl"
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
        userType: userRecord.userType,
        profileImageUrl: userRecord.profileImageUrl ?? null
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
  },

  forgotPassword: async (req, res) => {
    try {
      const email = typeof req.body.email === 'string'
        ? req.body.email.trim().toLowerCase()
        : '';

      if (!email) {
        return res.status(400).json({ message: 'Informe o e-mail da conta.' });
      }

      const { rows } = await pool.query(
        'SELECT id FROM users WHERE email = $1 LIMIT 1',
        [email]
      );

      if (rows.length === 0) {
        return res.status(200).json({
          message: 'Se o e-mail estiver cadastrado, um código será gerado.'
        });
      }

      const code = String(Math.floor(100000 + Math.random() * 900000));
      await pool.query(
        `
          INSERT INTO password_reset_codes (user_id, code, expires_at)
          VALUES ($1, $2, NOW() + INTERVAL '15 minutes')
        `,
        [rows[0].id, code]
      );

      return res.status(200).json({
        message: 'Código gerado. Ele expira em 15 minutos.',
        code
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao iniciar recuperação de senha.',
        error: error.message
      });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const email = typeof req.body.email === 'string'
        ? req.body.email.trim().toLowerCase()
        : '';
      const code = typeof req.body.code === 'string' ? req.body.code.trim() : '';
      const { newPassword } = req.body;
      const passwordError = validatePassword(newPassword);

      if (!email || !code) {
        return res.status(400).json({ message: 'E-mail e código são obrigatórios.' });
      }
      if (passwordError) {
        return res.status(400).json({ message: passwordError });
      }

      const { rows } = await pool.query(
        `
          SELECT prc.id, prc.user_id AS "userId"
          FROM password_reset_codes prc
          JOIN users u ON u.id = prc.user_id
          WHERE u.email = $1
            AND prc.code = $2
            AND prc.used_at IS NULL
            AND prc.expires_at > NOW()
          ORDER BY prc.created_at DESC
          LIMIT 1
        `,
        [email, code]
      );

      if (rows.length === 0) {
        return res.status(400).json({ message: 'Código inválido ou expirado.' });
      }

      const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(
          'UPDATE users SET password = $1 WHERE id = $2',
          [passwordHash, rows[0].userId]
        );
        await client.query(
          'UPDATE password_reset_codes SET used_at = NOW() WHERE id = $1',
          [rows[0].id]
        );
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }

      return res.status(200).json({ message: 'Senha alterada com sucesso.' });
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao redefinir senha.',
        error: error.message
      });
    }
  }
};

module.exports = authController;
