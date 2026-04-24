const { Router } = require('express');
const categoriesController = require('../controllers/categories.controller');

const router = Router();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Lista todas as categorias
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Lista de categorias retornada com sucesso
 */
router.get('/', categoriesController.getAll);

router.post('/', categoriesController.create);
router.get('/:id', categoriesController.getById);
router.put('/:id', categoriesController.update);
router.delete('/:id', categoriesController.remove);

module.exports = router;
