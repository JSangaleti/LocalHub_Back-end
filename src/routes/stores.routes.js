const { Router } = require('express');
const storesController = require('../controllers/stores.controller');

const router = Router();

/**
 * @swagger
 * /api/stores:
 *   get:
 *     summary: Lista todas as lojas cadastradas
 *     tags: [Stores]
 *     responses:
 *       200:
 *         description: Lista de lojas retornada com sucesso
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