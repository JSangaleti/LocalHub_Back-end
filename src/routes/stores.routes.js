const { Router } = require('express');
const storesController = require('../controllers/stores.controller');

const router = Router();

/**
 * @swagger
 * /api/stores:
 *   post:
 *     summary: Cadastra uma nova loja
 *     tags: [Stores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ownerUserId
 *               - categoryId
 *               - name
 *             properties:
 *               ownerUserId:
 *                 type: integer
 *               categoryId:
 *                 type: integer
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               address:
 *                 type: string
 *               openingHours:
 *                 type: string
 *               contact:
 *                 type: string
 *     responses:
 *       201:
 *         description: Loja cadastrada com sucesso
 */
router.post('/', storesController.create);

/**
 * @swagger
 * /api/stores/{id}:
 *   get:
 *     summary: Busca os dados de uma loja pelo ID
 *     tags: [Stores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Loja encontrada com sucesso
 */
router.get('/:id', storesController.getById);

module.exports = router;