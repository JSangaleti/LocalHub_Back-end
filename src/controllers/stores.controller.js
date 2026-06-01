const pool = require('../config/db');
const { normalizeCnpj, isValidCnpj } = require('../utils/cnpj');

const parsePositiveInteger = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const parseCoordinate = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
};

const validateCoordinates = (latitude, longitude) => {
  const parsedLatitude = parseCoordinate(latitude);
  const parsedLongitude = parseCoordinate(longitude);

  if (Number.isNaN(parsedLatitude) || Number.isNaN(parsedLongitude)) {
    return {
      error: 'latitude e longitude devem ser números válidos.'
    };
  }

  if (
    (parsedLatitude === null && parsedLongitude !== null)
    || (parsedLatitude !== null && parsedLongitude === null)
  ) {
    return {
      error: 'latitude e longitude devem ser informadas juntas.'
    };
  }

  if (parsedLatitude !== null && (parsedLatitude < -90 || parsedLatitude > 90)) {
    return {
      error: 'latitude deve estar entre -90 e 90.'
    };
  }

  if (parsedLongitude !== null && (parsedLongitude < -180 || parsedLongitude > 180)) {
    return {
      error: 'longitude deve estar entre -180 e 180.'
    };
  }

  return {
    latitude: parsedLatitude,
    longitude: parsedLongitude
  };
};

const buildFormattedAddress = (store) => {
  const streetLine = [store.address, store.addressNumber]
    .filter(Boolean)
    .join(', ');

  const cityLine = [
    store.neighborhood,
    store.city && store.state ? `${store.city} - ${store.state}` : store.city || store.state
  ]
    .filter(Boolean)
    .join(' - ');

  return [streetLine, cityLine]
    .filter(Boolean)
    .join(' - ') || null;
};

const buildMapLinks = (latitude, longitude) => {
  if (latitude === null || longitude === null) {
    return null;
  }

  const destination = `${latitude},${longitude}`;

  return {
    googleMaps: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`,
    waze: `https://waze.com/ul?ll=${encodeURIComponent(destination)}&navigate=yes`
  };
};

const mapStoreResponse = (store) => {
  const latitude = store.latitude !== null && store.latitude !== undefined
    ? Number(store.latitude)
    : null;

  const longitude = store.longitude !== null && store.longitude !== undefined
    ? Number(store.longitude)
    : null;

  const mappedStore = {
    ...store,
    latitude,
    longitude
  };

  return {
    ...mappedStore,
    formattedAddress: buildFormattedAddress(mappedStore),
    mapLinks: buildMapLinks(latitude, longitude)
  };
};

const validateAndNormalizeCnpj = (cnpj) => {
  const normalizedCnpj = normalizeCnpj(cnpj);

  if (!normalizedCnpj) {
    return {
      error: 'CNPJ é obrigatório.'
    };
  }

  if (!isValidCnpj(normalizedCnpj)) {
    return {
      error: 'CNPJ inválido.'
    };
  }

  return {
    cnpj: normalizedCnpj
  };
};

const storesController = {
  getAll: async (req, res) => {
    try {
      const { rows } = await pool.query(
        `
          SELECT
            s.id,
            s.cnpj,
            s.owner_user_id AS "ownerUserId",
            s.category_id AS "categoryId",
            s.name,
            s.description,
            c.name AS category,
            s.address,
            s.address_number AS "addressNumber",
            s.neighborhood,
            s.city,
            s.state,
            s.postal_code AS "postalCode",
            s.country,
            s.latitude,
            s.longitude,
            s.opening_hours AS "openingHours",
            s.contact
          FROM stores s
          LEFT JOIN categories c ON c.id = s.category_id
          ORDER BY s.name ASC, s.id ASC
        `
      );

      return res.status(200).json(rows.map(mapStoreResponse));
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao listar lojas.',
        error: error.message
      });
    }
  },

  create: async (req, res) => {
    try {
      const {
        ownerUserId,
        categoryId,
        cnpj,
        name,
        description,
        address,
        addressNumber,
        neighborhood,
        city,
        state,
        postalCode,
        country,
        latitude,
        longitude,
        openingHours,
        contact
      } = req.body;

      if (!ownerUserId || !categoryId || !name) {
        return res.status(400).json({
          message: 'ownerUserId, categoryId e name são obrigatórios.'
        });
      }

      const cnpjValidation = validateAndNormalizeCnpj(cnpj);

      if (cnpjValidation.error) {
        return res.status(400).json({
          message: cnpjValidation.error
        });
      }

      const coordinates = validateCoordinates(latitude, longitude);

      if (coordinates.error) {
        return res.status(400).json({
          message: coordinates.error
        });
      }

      const { rows } = await pool.query(
        `
    INSERT INTO stores (
      owner_user_id,
      category_id,
      cnpj,
      name,
      description,
      address,
      address_number,
      neighborhood,
      city,
      state,
      postal_code,
      country,
      latitude,
      longitude,
      opening_hours,
      contact
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    RETURNING
      id,
      cnpj,
      owner_user_id AS "ownerUserId",
      category_id AS "categoryId",
      name,
      description,
      address,
      address_number AS "addressNumber",
      neighborhood,
      city,
      state,
      postal_code AS "postalCode",
      country,
      latitude,
      longitude,
      opening_hours AS "openingHours",
      contact
  `,
        [
          ownerUserId,
          categoryId,
          cnpjValidation.cnpj,
          name,
          description ?? null,
          address ?? null,
          addressNumber ?? null,
          neighborhood ?? null,
          city ?? null,
          state ?? null,
          postalCode ?? null,
          country ?? 'Brasil',
          coordinates.latitude,
          coordinates.longitude,
          openingHours ?? null,
          contact ?? null
        ]
      );

      return res.status(201).json({
        message: 'Loja cadastrada com sucesso.',
        store: mapStoreResponse(rows[0])
      });
    } catch (error) {
      if (error.code === '23503') {
        return res.status(400).json({
          message: 'ownerUserId ou categoryId inválido.'
        });
      }

      if (error.code === '23505' && error.constraint === 'uq_stores_cnpj') {
        return res.status(409).json({
          message: 'CNPJ já cadastrado.'
        });
      }

      return res.status(500).json({
        message: 'Erro ao cadastrar loja.',
        error: error.message
      });
    }
  },

  getById: async (req, res) => {
    try {
      const id = parsePositiveInteger(req.params.id);

      if (!id) {
        return res.status(400).json({ message: 'ID inválido.' });
      }

      const { rows } = await pool.query(
        `
        SELECT
          s.id,
          s.cnpj,
          s.owner_user_id AS "ownerUserId",
          s.category_id AS "categoryId",
          s.name,
          s.description,
          c.name AS category,
          s.address,
          s.address_number AS "addressNumber",
          s.neighborhood,
          s.city,
          s.state,
          s.postal_code AS "postalCode",
          s.country,
          s.latitude,
          s.longitude,
          s.opening_hours AS "openingHours",
          s.contact
        FROM stores s
        LEFT JOIN categories c ON c.id = s.category_id
        WHERE s.id = $1
      `,
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Loja não encontrada.' });
      }

      return res.status(200).json(mapStoreResponse(rows[0]));
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao buscar loja.',
        error: error.message
      });
    }
  },

  update: async (req, res) => {
    try {
      const id = parsePositiveInteger(req.params.id);

      if (!id) {
        return res.status(400).json({
          message: 'ID inválido.'
        });
      }

      const {
        ownerUserId,
        categoryId,
        cnpj,
        name,
        description,
        address,
        addressNumber,
        neighborhood,
        city,
        state,
        postalCode,
        country,
        latitude,
        longitude,
        openingHours,
        contact
      } = req.body;

      const updates = [];
      const values = [];

      if (cnpj !== undefined) {
        const cnpjValidation = validateAndNormalizeCnpj(cnpj);

        if (cnpjValidation.error) {
          return res.status(400).json({
            message: cnpjValidation.error
          });
        }

        values.push(cnpjValidation.cnpj);
        updates.push(`cnpj = $${values.length}`);
      }

      let coordinates = null;

      if (latitude !== undefined || longitude !== undefined) {
        coordinates = validateCoordinates(latitude, longitude);

        if (coordinates.error) {
          return res.status(400).json({
            message: coordinates.error
          });
        }
      }

      if (ownerUserId !== undefined) {
        values.push(ownerUserId);
        updates.push(`owner_user_id = $${values.length}`);
      }

      if (categoryId !== undefined) {
        values.push(categoryId);
        updates.push(`category_id = $${values.length}`);
      }

      if (name !== undefined) {
        values.push(name);
        updates.push(`name = $${values.length}`);
      }

      if (description !== undefined) {
        values.push(description);
        updates.push(`description = $${values.length}`);
      }

      if (address !== undefined) {
        values.push(address);
        updates.push(`address = $${values.length}`);
      }

      if (openingHours !== undefined) {
        values.push(openingHours);
        updates.push(`opening_hours = $${values.length}`);
      }

      if (contact !== undefined) {
        values.push(contact);
        updates.push(`contact = $${values.length}`);
      }

      if (addressNumber !== undefined) {
        values.push(addressNumber);
        updates.push(`address_number = $${values.length}`);
      }

      if (neighborhood !== undefined) {
        values.push(neighborhood);
        updates.push(`neighborhood = $${values.length}`);
      }

      if (city !== undefined) {
        values.push(city);
        updates.push(`city = $${values.length}`);
      }

      if (state !== undefined) {
        values.push(state);
        updates.push(`state = $${values.length}`);
      }

      if (postalCode !== undefined) {
        values.push(postalCode);
        updates.push(`postal_code = $${values.length}`);
      }

      if (country !== undefined) {
        values.push(country);
        updates.push(`country = $${values.length}`);
      }

      if (coordinates) {
        values.push(coordinates.latitude);
        updates.push(`latitude = $${values.length}`);

        values.push(coordinates.longitude);
        updates.push(`longitude = $${values.length}`);
      }

      if (updates.length === 0) {
        return res.status(400).json({
          message: 'Informe ao menos um campo para atualização.'
        });
      }

      values.push(id);

      const { rows } = await pool.query(
        `
          UPDATE stores
          SET ${updates.join(', ')}
          WHERE id = $${values.length}
          RETURNING
            id,
            cnpj,
            owner_user_id AS "ownerUserId",
            category_id AS "categoryId",
            name,
            description,
            address,
            address_number AS "addressNumber",
            neighborhood,
            city,
            state,
            postal_code AS "postalCode",
            country,
            latitude,
            longitude,
            opening_hours AS "openingHours",
            contact
        `,
        values
      );

      if (rows.length === 0) {
        return res.status(404).json({
          message: 'Loja não encontrada.'
        });
      }

      return res.status(200).json({
        message: 'Loja atualizada com sucesso.',
        store: mapStoreResponse(rows[0])
      });
    } catch (error) {
      if (error.code === '23503') {
        return res.status(400).json({
          message: 'ownerUserId ou categoryId inválido.'
        });
      }

      if (error.code === '23505' && error.constraint === 'uq_stores_cnpj') {
        return res.status(409).json({
          message: 'CNPJ já cadastrado.'
        });
      }

      return res.status(500).json({
        message: 'Erro ao atualizar loja.',
        error: error.message
      });
    }
  },

  remove: async (req, res) => {
    try {
      const id = parsePositiveInteger(req.params.id);

      if (!id) {
        return res.status(400).json({
          message: 'ID inválido.'
        });
      }

      const { rows } = await pool.query(
        `
          DELETE FROM stores
          WHERE id = $1
          RETURNING id
        `,
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          message: 'Loja não encontrada.'
        });
      }

      return res.status(200).json({
        message: 'Loja removida com sucesso.'
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao remover loja.',
        error: error.message
      });
    }
  }
};

module.exports = storesController;