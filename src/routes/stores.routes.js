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
 *             $ref: '#/components/schemas/StoreCreateRequest'
 *     responses:
 *       201:
 *         description: Loja cadastrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StoreResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', storesController.getById);

module.exports = router;