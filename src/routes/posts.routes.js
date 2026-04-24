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

router.post('/', postsController.create);
router.get('/:id', postsController.getById);
router.put('/:id', postsController.update);
router.delete('/:id', postsController.remove);

module.exports = router;