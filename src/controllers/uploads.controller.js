const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

const ALLOWED_TYPES = new Set(['posts', 'stores', 'users']);

const parsePositiveInteger = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const saveFileToDisk = async (type, file) => {
  const uploadsRoot = path.join(__dirname, '..', '..', 'uploads');
  const destDir = path.join(uploadsRoot, type);
  ensureDir(destDir);

  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1e6);
  const ext = path.extname(file.originalname) || '';
  const safeName = `${path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '-')}`;
  const filename = `${safeName}-${timestamp}-${random}${ext}`;
  const filepath = path.join(destDir, filename);

  await fs.promises.writeFile(filepath, file.buffer);

  const webPath = `/uploads/${type}/${filename}`;
  return webPath;
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

    const webPath = await saveFileToDisk(type, req.file);

    // se tiver ID, tenta atualizar o registro correspondente
    if (idParam) {
      const id = parsePositiveInteger(idParam);
      if (!id) {
        return res.status(400).json({ message: 'ID inválido.' });
      }

      const table = type === 'posts' ? 'posts' : type === 'stores' ? 'stores' : 'users';

      try {
        const { rows } = await pool.query(
          `UPDATE ${table} SET image_url = $1 WHERE id = $2 RETURNING id`,
          [webPath, id]
        );

        if (rows.length === 0) {
          return res.status(404).json({ message: `${table.slice(0, -1)} não encontrado.`, path: webPath });
        }

        return res.status(200).json({ message: 'Arquivo enviado e registro atualizado.', path: webPath });
      } catch (dbError) {
        // caso o ID nao seja encontrado
        return res.status(200).json({
          message: 'Arquivo enviado, porém não foi possível atualizar o banco de dados (verifique a coluna image_url).',
          path: webPath,
          dbError: dbError.message
        });
      }
    }

    return res.status(201).json({ message: 'Arquivo enviado com sucesso.', path: webPath });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao processar upload.', error: error.message });
  }
};

module.exports = {
  upload
};
