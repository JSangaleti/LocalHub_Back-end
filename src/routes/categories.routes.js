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

module.exports = router;
