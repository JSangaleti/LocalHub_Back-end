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

/**
 * @swagger
 * /api/stores/{id}:
 *   put:
 *     summary: Atualiza os dados de uma loja
 *     tags: [Stores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *       200:
 *         description: Loja atualizada com sucesso
 */
router.put('/:id', storesController.update);

/**
 * @swagger
 * /api/stores/{id}:
 *   delete:
 *     summary: Remove uma loja
 *     tags: [Stores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Loja removida com sucesso
 */
router.delete('/:id', storesController.remove);

module.exports = router;