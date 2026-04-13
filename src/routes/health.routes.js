const { Router } = require('express');
const controller = require('../controllers/health.controller');

const router = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Verifica se a API está online
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API online
 */
router.get('/', controller.check);

module.exports = router;