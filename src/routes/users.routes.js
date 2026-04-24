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

router.get('/:id', usersController.getById);
router.put('/:id', usersController.update);
router.delete('/:id', usersController.remove);

module.exports = router;