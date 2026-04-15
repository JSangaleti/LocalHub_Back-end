const { Router } = require('express');
const postsController = require('../controllers/posts.controller');

const router = Router();

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Lista os posts do feed
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: Lista de posts retornada com sucesso
 */
router.get('/', postsController.getAll);

module.exports = router;