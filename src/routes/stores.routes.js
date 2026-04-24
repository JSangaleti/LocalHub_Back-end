const { Router } = require('express');
const storesController = require('../controllers/stores.controller');

const router = Router();

/**
 * @swagger
 * /api/stores:
 *   get:
 *     summary: Lista todas as lojas
 *     tags: [Stores]
 *     responses:
 *       200:
 *         description: Lista de lojas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Store'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', storesController.getAll);

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
router.post('/', storesController.create);

/**
 * @swagger
 * /api/stores/{id}:
 *   get:
 *     summary: Busca uma loja pelo ID
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Store'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
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
 *             $ref: '#/components/schemas/StoreUpdateRequest'
 *     responses:
 *       200:
 *         description: Loja atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StoreResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id', storesController.remove);

module.exports = router;