const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

const ALLOWED_TYPES = new Set(['posts', 'stores', 'users']);

const TABLE_MAP = { posts: 'posts', stores: 'stores', users: 'users' };

const parsePositiveInteger = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const saveFileToDisk = async (type, file, id = null) => {
  const uploadsRoot = path.join(__dirname, '..', '..', 'uploads');
  const destDir = path.join(uploadsRoot, type);
  ensureDir(destDir);

  const ext = path.extname(file.originalname) || '';
  const filename = id
    ? `${id}${ext}`
    : `${Date.now()}-${Math.floor(Math.random() * 1e6)}${ext}`;

  const filepath = path.join(destDir, filename);
  await fs.promises.writeFile(filepath, file.buffer);

  return `/uploads/${type}/${filename}`;
};

const deleteOldFile = async (webPath) => {
  if (!webPath) return;
  try {
    const abs = path.join(__dirname, '..', '..', webPath);
    await fs.promises.unlink(abs);
  } catch (_) {}
};

const upload = async (req, res) => {
  try {
    const { type } = req.params;
    const idParam = req.params.id;

    if (!ALLOWED_TYPES.has(type)) {
      return res.status(400).json({ message: 'Tipo inválido. Use posts, stores ou users.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado. Use o campo "file" no form-data.' });
    }

    if (!idParam) {
      const webPath = await saveFileToDisk(type, req.file, null);
      return res.status(201).json({ message: 'Arquivo enviado com sucesso.', path: webPath });
    }

    const id = parsePositiveInteger(idParam);
    if (!id) {
      return res.status(400).json({ message: 'ID inválido.' });
    }

    const table = TABLE_MAP[type];

    const { rows: existing } = await pool.query(
      `SELECT image_url FROM ${table} WHERE id = $1`,
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: `${table.slice(0, -1)} não encontrado.` });
    }

    const oldPath = existing[0].image_url;

    // Salva novo arquivo usando o ID como nome
    const webPath = await saveFileToDisk(type, req.file, id);

    if (oldPath && oldPath !== webPath) {
      await deleteOldFile(oldPath);
    }

    // Atualiza o banco
    const { rows } = await pool.query(
      `UPDATE ${table} SET image_url = $1 WHERE id = $2 RETURNING id`,
      [webPath, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Registro não encontrado após atualização.', path: webPath });
    }

    return res.status(200).json({ message: 'Imagem enviada e registro atualizado.', path: webPath });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao processar upload.', error: error.message });
  }
};

module.exports = { upload };
