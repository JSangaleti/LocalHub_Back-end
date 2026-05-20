const { Router } = require('express');
const multer = require('multer');
const uploadsController = require('../controllers/uploads.controller');

const router = Router();

// Armazenamento temporario na memoria
const upload = multer({ storage: multer.memoryStorage() });

// Upload sem id: POST /api/uploads/:type
router.post('/:type', upload.single('file'), uploadsController.upload);

// Upload com ID: POST /api/uploads/:type/:id
router.post('/:type/:id', upload.single('file'), uploadsController.upload);

module.exports = router;
