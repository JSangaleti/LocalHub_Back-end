const { Router } = require('express');
const usersController = require('../controllers/users.controller');

const router = Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lista os usuários cadastrados
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 */
router.get('/', usersController.getAll);

module.exports = router;