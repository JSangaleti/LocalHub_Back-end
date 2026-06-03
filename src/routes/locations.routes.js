const { Router } = require('express');
const locationsController = require('../controllers/locations.controller');

const router = Router();

/**
 * @swagger
 * /api/locations/reverse:
 *   get:
 *     summary: Busca endereço aproximado por latitude e longitude
 *     description: >
 *       Realiza geocodificação reversa usando OpenStreetMap/Nominatim.
 *       Esse endpoint deve ser chamado após o usuário confirmar um ponto no mapa,
 *       não durante o arraste do mapa.
 *     tags: [Locations]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *           format: double
 *           minimum: -90
 *           maximum: 90
 *         example: -24.0463
 *         description: Latitude do ponto selecionado.
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *           format: double
 *           minimum: -180
 *           maximum: 180
 *         example: -52.378
 *         description: Longitude do ponto selecionado.
 *     responses:
 *       200:
 *         description: Endereço encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LocationReverseResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       429:
 *         description: Limite de requisições do serviço de geocodificação atingido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       502:
 *         description: Serviço externo de geocodificação indisponível
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/reverse', locationsController.reverse);

module.exports = router;