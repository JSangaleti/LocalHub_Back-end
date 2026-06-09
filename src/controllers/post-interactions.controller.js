const pool = require('../config/db');

const parsePositiveInteger = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const postExists = async (postId) => {
  const { rows } = await pool.query('SELECT id FROM posts WHERE id = $1', [postId]);
  return rows.length > 0;
};

const userExists = async (userId) => {
  const { rows } = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
  return rows.length > 0;
};

const createNotification = async (postId, actorUserId, interactionType) => {
  const { rows } = await pool.query(
    `
      SELECT
        s.owner_user_id AS "ownerUserId",
        p.title,
        u.name AS "actorName"
      FROM posts p
      JOIN stores s ON s.id = p.store_id
      JOIN users u ON u.id = $2
      WHERE p.id = $1
    `,
    [postId, actorUserId]
  );
  const data = rows[0];
  if (!data || Number(data.ownerUserId) === Number(actorUserId)) return;

  const action = interactionType === 'like' ? 'curtiu' : 'comentou em';
  const message = `${data.actorName} ${action} o post "${data.title}".`;
  await pool.query(
    `
      INSERT INTO notifications (
        recipient_user_id, actor_user_id, post_id, interaction_type, message
      )
      VALUES ($1, $2, $3, $4, $5)
    `,
    [data.ownerUserId, actorUserId, postId, interactionType, message]
  );
};

const getPostEngagement = async (postId, userId = null) => {
  const params = [postId];
  let likedByMeSql = 'false AS "likedByMe"';

  if (userId) {
    params.push(userId);
    likedByMeSql = `EXISTS(
      SELECT 1 FROM post_likes pl
      WHERE pl.post_id = $1 AND pl.user_id = $2
    ) AS "likedByMe"`;
  }

  const { rows } = await pool.query(
    `
      SELECT
        COALESCE((SELECT COUNT(*)::int FROM post_likes pl WHERE pl.post_id = $1), 0) AS likes,
        COALESCE((SELECT COUNT(*)::int FROM post_comments pc WHERE pc.post_id = $1), 0) AS comments,
        ${likedByMeSql}
    `,
    params
  );

  return rows[0];
};

const postInteractionsController = {
  addLike: async (req, res) => {
    try {
      const postId = parsePositiveInteger(req.params.id);
      const userId = parsePositiveInteger(req.body.userId);

      if (!postId || !userId) {
        return res.status(400).json({
          message: 'ID do post e userId são obrigatórios.'
        });
      }

      if (!(await postExists(postId))) {
        return res.status(404).json({ message: 'Post não encontrado.' });
      }

      if (!(await userExists(userId))) {
        return res.status(400).json({ message: 'userId inválido.' });
      }

      const insertResult = await pool.query(
        `
          INSERT INTO post_likes (post_id, user_id)
          VALUES ($1, $2)
          ON CONFLICT (post_id, user_id) DO NOTHING
        `,
        [postId, userId]
      );

      if (insertResult.rowCount > 0) {
        await createNotification(postId, userId, 'like');
      }

      const engagement = await getPostEngagement(postId, userId);

      return res.status(201).json({
        message: 'Curtida registrada.',
        engagement,
        ...engagement
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao curtir post.',
        error: error.message
      });
    }
  },

  removeLike: async (req, res) => {
    try {
      const postId = parsePositiveInteger(req.params.id);
      const userId = parsePositiveInteger(req.query.userId);

      if (!postId || !userId) {
        return res.status(400).json({
          message: 'ID do post e userId são obrigatórios.'
        });
      }

      await pool.query(
        'DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2',
        [postId, userId]
      );

      const engagement = await getPostEngagement(postId, userId);

      return res.status(200).json({
        message: 'Curtida removida.',
        engagement,
        ...engagement
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao remover curtida.',
        error: error.message
      });
    }
  },

  getComments: async (req, res) => {
    try {
      const postId = parsePositiveInteger(req.params.id);

      if (!postId) {
        return res.status(400).json({ message: 'ID inválido.' });
      }

      if (!(await postExists(postId))) {
        return res.status(404).json({ message: 'Post não encontrado.' });
      }

      const { rows } = await pool.query(
        `
          SELECT
            c.id,
            c.post_id AS "postId",
            c.user_id AS "userId",
            u.name AS "userName",
            c.content,
            c.created_at AS "createdAt"
          FROM post_comments c
          JOIN users u ON u.id = c.user_id
          WHERE c.post_id = $1
          ORDER BY c.created_at ASC
        `,
        [postId]
      );

      return res.status(200).json({ data: rows });
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao buscar comentários.',
        error: error.message
      });
    }
  },

  addComment: async (req, res) => {
    try {
      const postId = parsePositiveInteger(req.params.id);
      const userId = parsePositiveInteger(req.body.userId);
      const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';

      if (!postId || !userId) {
        return res.status(400).json({
          message: 'ID do post e userId são obrigatórios.'
        });
      }

      if (!content) {
        return res.status(400).json({
          message: 'O conteúdo do comentário é obrigatório.'
        });
      }

      if (content.length > 500) {
        return res.status(400).json({
          message: 'O comentário deve ter no máximo 500 caracteres.'
        });
      }

      if (!(await postExists(postId))) {
        return res.status(404).json({ message: 'Post não encontrado.' });
      }

      if (!(await userExists(userId))) {
        return res.status(400).json({ message: 'userId inválido.' });
      }

      const { rows } = await pool.query(
        `
          INSERT INTO post_comments (post_id, user_id, content)
          VALUES ($1, $2, $3)
          RETURNING id, post_id AS "postId", user_id AS "userId", content, created_at AS "createdAt"
        `,
        [postId, userId, content]
      );

      const { rows: userRows } = await pool.query(
        'SELECT name FROM users WHERE id = $1',
        [userId]
      );

      const engagement = await getPostEngagement(postId, userId);

      await createNotification(postId, userId, 'comment');

      return res.status(201).json({
        message: 'Comentário publicado.',
        comment: {
          ...rows[0],
          userName: userRows[0]?.name ?? 'Usuário'
        },
        engagement
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao comentar post.',
        error: error.message
      });
    }
  }
};

module.exports = postInteractionsController;
