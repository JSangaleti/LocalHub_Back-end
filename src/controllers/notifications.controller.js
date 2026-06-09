const pool = require('../config/db');

const parsePositiveInteger = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const notificationsController = {
  getAll: async (req, res) => {
    try {
      const userId = parsePositiveInteger(req.query.userId);
      if (!userId) {
        return res.status(400).json({ message: 'userId é obrigatório.' });
      }

      const { rows } = await pool.query(
        `
          SELECT
            n.id,
            n.actor_user_id AS "actorUserId",
            u.name AS "actorName",
            n.post_id AS "postId",
            p.title AS "postTitle",
            n.interaction_type AS "interactionType",
            n.message,
            n.is_read AS "isRead",
            n.created_at AS "createdAt"
          FROM notifications n
          JOIN users u ON u.id = n.actor_user_id
          JOIN posts p ON p.id = n.post_id
          WHERE n.recipient_user_id = $1
          ORDER BY n.created_at DESC
          LIMIT 100
        `,
        [userId]
      );

      return res.status(200).json({ data: rows });
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao buscar notificações.',
        error: error.message
      });
    }
  },

  markAsRead: async (req, res) => {
    try {
      const id = parsePositiveInteger(req.params.id);
      const userId = parsePositiveInteger(req.body.userId);
      if (!id || !userId) {
        return res.status(400).json({ message: 'ID e userId são obrigatórios.' });
      }

      const { rows } = await pool.query(
        `
          UPDATE notifications
          SET is_read = TRUE
          WHERE id = $1 AND recipient_user_id = $2
          RETURNING id
        `,
        [id, userId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Notificação não encontrada.' });
      }
      return res.status(200).json({ message: 'Notificação marcada como lida.' });
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao atualizar notificação.',
        error: error.message
      });
    }
  },

  markAllAsRead: async (req, res) => {
    try {
      const userId = parsePositiveInteger(req.body.userId);
      if (!userId) {
        return res.status(400).json({ message: 'userId é obrigatório.' });
      }
      await pool.query(
        'UPDATE notifications SET is_read = TRUE WHERE recipient_user_id = $1',
        [userId]
      );
      return res.status(200).json({ message: 'Notificações marcadas como lidas.' });
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao atualizar notificações.',
        error: error.message
      });
    }
  }
};

module.exports = notificationsController;
