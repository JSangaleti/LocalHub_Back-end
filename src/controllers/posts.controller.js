const pool = require('../config/db');

const parsePositiveInteger = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const canManagePost = async (postId, actingUserId) => {
  const userId = parsePositiveInteger(actingUserId);
  if (!userId) return false;
  const { rows } = await pool.query(
    `
      SELECT 1
      FROM posts p
      JOIN stores s ON s.id = p.store_id
      JOIN users u ON u.id = $2
      WHERE p.id = $1
        AND (s.owner_user_id = $2 OR u.user_type = 'admin')
    `,
    [postId, userId]
  );
  return rows.length > 0;
};

const canCreateForStore = async (storeId, actingUserId) => {
  const userId = parsePositiveInteger(actingUserId);
  if (!userId) return false;
  const { rows } = await pool.query(
    `
      SELECT 1
      FROM stores s
      JOIN users u ON u.id = $2
      WHERE s.id = $1
        AND (s.owner_user_id = $2 OR u.user_type = 'admin')
    `,
    [storeId, userId]
  );
  return rows.length > 0;
};

const engagementSelect = (userId, startParamIndex) => {
  const likedByMe = userId
    ? `EXISTS(
        SELECT 1 FROM post_likes pl
        WHERE pl.post_id = p.id AND pl.user_id = $${startParamIndex}
      ) AS "likedByMe"`
    : 'false AS "likedByMe"';

  return `
    COALESCE((SELECT COUNT(*)::int FROM post_likes pl WHERE pl.post_id = p.id), 0) AS likes,
    COALESCE((SELECT COUNT(*)::int FROM post_comments pc WHERE pc.post_id = p.id), 0) AS comments,
    ${likedByMe}
  `;
};

const postsController = {
  getAll: async (req, res) => {
    try {
      const {
        search,
        categoryId,
        storeId,
        userId,
        includeInactive,
        limit = 20,
        offset = 0
      } = req.query;
      const userIdParsed = parsePositiveInteger(userId);
      const storeIdParsed = parsePositiveInteger(storeId);
      let maySeeInactive = false;

      if (includeInactive === 'true' && userIdParsed) {
        const { rows } = await pool.query(
          `
            SELECT u.user_type AS "userType",
              EXISTS(
                SELECT 1 FROM stores s
                WHERE s.id = $2 AND s.owner_user_id = $1
              ) AS "ownsStore"
            FROM users u
            WHERE u.id = $1
          `,
          [userIdParsed, storeIdParsed]
        );
        maySeeInactive = rows[0]?.userType === 'admin' || rows[0]?.ownsStore === true;
      }

      let query = `
        SELECT
          p.id,
          p.store_id AS "storeId",
          s.name AS "storeName",
          p.category_id AS "categoryId",
          c.name AS category,
          p.title,
          p.description,
          p.image_url AS "imageUrl",
          p.is_active AS "isActive",
          ${engagementSelect(userIdParsed, 'PARAM')}
        FROM posts p
        JOIN stores s ON s.id = p.store_id
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE 1=1
      `;

      const params = [];
      if (userIdParsed) {
        params.push(userIdParsed);
      }
      query = query.replace('PARAM', userIdParsed ? String(params.length) : '0');

      if (!maySeeInactive) {
        query += ' AND p.is_active = TRUE AND s.is_active = TRUE';
      }

      // Filtro de busca por título, descrição ou nome da loja
      if (search && search.trim()) {
        query += ` AND (p.title ILIKE $${params.length + 1} OR p.description ILIKE $${params.length + 2} OR s.name ILIKE $${params.length + 3})`;
        params.push(`%${search.trim()}%`, `%${search.trim()}%`, `%${search.trim()}%`);
      }

      // Filtro por categoria
      if (categoryId) {
        const categoryIdParsed = parsePositiveInteger(categoryId);
        if (categoryIdParsed) {
          query += ` AND p.category_id = $${params.length + 1}`;
          params.push(categoryIdParsed);
        }
      }

      // Filtro por loja
      if (storeIdParsed) {
          query += ` AND p.store_id = $${params.length + 1}`;
          params.push(storeIdParsed);
      }

      query += ` ORDER BY p.id DESC`;

      // Paginação
      const limitParsed = parsePositiveInteger(limit) || 20;
      const offsetParsed = parsePositiveInteger(offset) || 0;

      query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limitParsed, offsetParsed);

      const { rows } = await pool.query(query, params);

      return res.status(200).json({
        data: rows,
        pagination: {
          limit: limitParsed,
          offset: offsetParsed,
          count: rows.length
        }
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao buscar posts.',
        error: error.message
      });
    }
  },

  create: async (req, res) => {
    try {
      const {
        storeId,
        categoryId,
        title,
        description,
        imageUrl,
        actingUserId
      } = req.body;

      if (!storeId || !title || !description) {
        return res.status(400).json({
          message: 'storeId, title e description são obrigatórios.'
        });
      }

      if (!(await canCreateForStore(storeId, actingUserId))) {
        return res.status(403).json({
          message: 'Apenas o dono da loja pode publicar nela.'
        });
      }

      const { rows } = await pool.query(
        `
          INSERT INTO posts (store_id, category_id, title, description, image_url)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING
            id,
            store_id AS "storeId",
            category_id AS "categoryId",
            title,
            description,
            image_url AS "imageUrl",
            is_active AS "isActive"
        `,
        [storeId, categoryId ?? null, title, description, imageUrl ?? null]
      );

      return res.status(201).json({
        message: 'Post cadastrado com sucesso.',
        post: rows[0]
      });
    } catch (error) {
      if (error.code === '23503') {
        return res.status(400).json({
          message: 'storeId ou categoryId inválido.'
        });
      }

      return res.status(500).json({
        message: 'Erro ao cadastrar post.',
        error: error.message
      });
    }
  },

  getById: async (req, res) => {
    try {
      const id = parsePositiveInteger(req.params.id);
      const userIdParsed = parsePositiveInteger(req.query.userId);

      if (!id) {
        return res.status(400).json({
          message: 'ID inválido.'
        });
      }

      const params = [id];
      if (userIdParsed) {
        params.push(userIdParsed);
      }

      const { rows } = await pool.query(
        `
          SELECT
            p.id,
            p.store_id AS "storeId",
            s.name AS "storeName",
            p.category_id AS "categoryId",
            c.name AS category,
            p.title,
            p.description,
            p.image_url AS "imageUrl",
            p.is_active AS "isActive",
            ${engagementSelect(userIdParsed, userIdParsed ? 2 : 0)}
          FROM posts p
          JOIN stores s ON s.id = p.store_id
          LEFT JOIN categories c ON c.id = p.category_id
          WHERE p.id = $1
        `,
        params
      );

      if (rows.length === 0) {
        return res.status(404).json({
          message: 'Post não encontrado.'
        });
      }

      return res.status(200).json(rows[0]);
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao buscar post.',
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
        storeId,
        categoryId,
        title,
        description,
        imageUrl,
        isActive,
        actingUserId
      } = req.body;

      if (!(await canManagePost(id, actingUserId))) {
        return res.status(403).json({
          message: 'Apenas o dono da loja ou um administrador pode editar este post.'
        });
      }
      const updates = [];
      const values = [];

      if (storeId !== undefined) {
        values.push(storeId);
        updates.push(`store_id = $${values.length}`);
      }
      if (categoryId !== undefined) {
        values.push(categoryId);
        updates.push(`category_id = $${values.length}`);
      }
      if (title !== undefined) {
        values.push(title);
        updates.push(`title = $${values.length}`);
      }
      if (description !== undefined) {
        values.push(description);
        updates.push(`description = $${values.length}`);
      }
      if (imageUrl !== undefined) {
        values.push(imageUrl);
        updates.push(`image_url = $${values.length}`);
      }
      if (isActive !== undefined) {
        values.push(Boolean(isActive));
        updates.push(`is_active = $${values.length}`);
      }

      if (updates.length === 0) {
        return res.status(400).json({
          message: 'Informe ao menos um campo para atualização.'
        });
      }

      values.push(id);

      const { rows } = await pool.query(
        `
          UPDATE posts
          SET ${updates.join(', ')}
          WHERE id = $${values.length}
          RETURNING
            id,
            store_id AS "storeId",
            category_id AS "categoryId",
            title,
            description,
            image_url AS "imageUrl",
            is_active AS "isActive"
        `,
        values
      );

      if (rows.length === 0) {
        return res.status(404).json({
          message: 'Post não encontrado.'
        });
      }

      return res.status(200).json({
        message: 'Post atualizado com sucesso.',
        post: rows[0]
      });
    } catch (error) {
      if (error.code === '23503') {
        return res.status(400).json({
          message: 'storeId ou categoryId inválido.'
        });
      }

      return res.status(500).json({
        message: 'Erro ao atualizar post.',
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
          DELETE FROM posts
          WHERE id = $1
          RETURNING id
        `,
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          message: 'Post não encontrado.'
        });
      }

      return res.status(200).json({
        message: 'Post removido com sucesso.'
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao remover post.',
        error: error.message
      });
    }
  }
};

module.exports = postsController;
