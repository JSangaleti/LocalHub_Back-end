const NOMINATIM_BASE_URL = process.env.NOMINATIM_BASE_URL || 'https://nominatim.openstreetmap.org';
const NOMINATIM_USER_AGENT =
    process.env.NOMINATIM_USER_AGENT
    || 'LocalHub_Back-end/1.0 (https://github.com/JSangaleti/LocalHub_Back-end)';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const reverseGeocodingCache = new Map();

const BRAZILIAN_STATES = {
    acre: 'AC',
    alagoas: 'AL',
    amapá: 'AP',
    amapa: 'AP',
    amazonas: 'AM',
    bahia: 'BA',
    ceará: 'CE',
    ceara: 'CE',
    'distrito federal': 'DF',
    'espírito santo': 'ES',
    'espirito santo': 'ES',
    goiás: 'GO',
    goias: 'GO',
    maranhão: 'MA',
    maranhao: 'MA',
    'mato grosso': 'MT',
    'mato grosso do sul': 'MS',
    'minas gerais': 'MG',
    pará: 'PA',
    para: 'PA',
    paraíba: 'PB',
    paraiba: 'PB',
    paraná: 'PR',
    parana: 'PR',
    pernambuco: 'PE',
    piauí: 'PI',
    piaui: 'PI',
    'rio de janeiro': 'RJ',
    'rio grande do norte': 'RN',
    'rio grande do sul': 'RS',
    rondônia: 'RO',
    rondonia: 'RO',
    roraima: 'RR',
    'santa catarina': 'SC',
    'são paulo': 'SP',
    'sao paulo': 'SP',
    sergipe: 'SE',
    tocantins: 'TO'
};

const getQueryValue = (value) => {
    if (Array.isArray(value)) {
        return value[0];
    }

    return value;
};

const parseRequiredCoordinate = (value) => {
    if (value === undefined || value === null || value === '') {
        return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : NaN;
};

const validateCoordinates = (lat, lng) => {
    const latitude = parseRequiredCoordinate(lat);
    const longitude = parseRequiredCoordinate(lng);

    if (latitude === null || longitude === null) {
        return {
            error: 'lat e lng são obrigatórios.'
        };
    }

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
        return {
            error: 'lat e lng devem ser números válidos.'
        };
    }

    if (latitude < -90 || latitude > 90) {
        return {
            error: 'lat deve estar entre -90 e 90.'
        };
    }

    if (longitude < -180 || longitude > 180) {
        return {
            error: 'lng deve estar entre -180 e 180.'
        };
    }

    return {
        latitude,
        longitude
    };
};

const normalizeBrazilianState = (state, countryCode) => {
    if (!state) {
        return null;
    }

    if (state.length === 2) {
        return state.toUpperCase();
    }

    if (countryCode?.toLowerCase() !== 'br') {
        return state;
    }

    return BRAZILIAN_STATES[state.toLowerCase()] || state;
};

const buildFormattedAddress = (location) => {
    const streetLine = [location.address, location.addressNumber]
        .filter(Boolean)
        .join(', ');

    const cityLine = [
        location.neighborhood,
        location.city && location.state ? `${location.city} - ${location.state}` : location.city || location.state
    ]
        .filter(Boolean)
        .join(' - ');

    return [streetLine, cityLine]
        .filter(Boolean)
        .join(' - ') || null;
};

const getCacheKey = (latitude, longitude) => {
    return `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
};

const getCachedReverseGeocoding = (key) => {
    const cached = reverseGeocodingCache.get(key);

    if (!cached) {
        return null;
    }

    const isExpired = Date.now() - cached.createdAt > CACHE_TTL_MS;

    if (isExpired) {
        reverseGeocodingCache.delete(key);
        return null;
    }

    return cached.data;
};

const setCachedReverseGeocoding = (key, data) => {
    reverseGeocodingCache.set(key, {
        createdAt: Date.now(),
        data
    });
};

const extractStreet = (address) => {
    return (
        address.road
        || address.pedestrian
        || address.footway
        || address.cycleway
        || address.path
        || address.residential
        || null
    );
};

const extractNeighborhood = (address) => {
    return (
        address.neighbourhood
        || address.suburb
        || address.quarter
        || address.city_district
        || address.district
        || null
    );
};

const extractCity = (address) => {
    return (
        address.city
        || address.town
        || address.village
        || address.municipality
        || address.county
        || null
    );
};

const mapNominatimResponse = (data, latitude, longitude) => {
    const address = data.address || {};

    const mappedLocation = {
        address: extractStreet(address),
        addressNumber: address.house_number || null,
        neighborhood: extractNeighborhood(address),
        city: extractCity(address),
        state: normalizeBrazilianState(address.state, address.country_code),
        postalCode: address.postcode || null,
        country: address.country || null,
        latitude,
        longitude,
        formattedAddress: null,
        provider: {
            name: 'Nominatim',
            displayName: data.display_name || null,
            licence: data.licence || null
        }
    };

    mappedLocation.formattedAddress = buildFormattedAddress(mappedLocation);

    return mappedLocation;
};

const locationsController = {
    reverse: async (req, res) => {
        try {
            const rawLat = getQueryValue(req.query.lat);
            const rawLng = getQueryValue(req.query.lng ?? req.query.lon);

            const coordinates = validateCoordinates(rawLat, rawLng);

            if (coordinates.error) {
                return res.status(400).json({
                    message: coordinates.error
                });
            }

            const { latitude, longitude } = coordinates;
            const cacheKey = getCacheKey(latitude, longitude);
            const cachedLocation = getCachedReverseGeocoding(cacheKey);

            if (cachedLocation) {
                return res.status(200).json(cachedLocation);
            }

            const url = new URL('/reverse', NOMINATIM_BASE_URL);

            url.search = new URLSearchParams({
                format: 'jsonv2',
                lat: String(latitude),
                lon: String(longitude),
                addressdetails: '1',
                zoom: '18',
                layer: 'address'
            }).toString();

            const response = await fetch(url, {
                headers: {
                    Accept: 'application/json',
                    'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.5',
                    'User-Agent': NOMINATIM_USER_AGENT
                }
            });

            if (response.status === 429) {
                return res.status(429).json({
                    message: 'Limite de requisições do serviço de geocodificação atingido. Tente novamente mais tarde.'
                });
            }

            if (!response.ok) {
                return res.status(502).json({
                    message: 'Serviço de geocodificação indisponível no momento.'
                });
            }

            const data = await response.json();

            if (data.error) {
                return res.status(404).json({
                    message: 'Endereço não encontrado para as coordenadas informadas.'
                });
            }

            const mappedLocation = mapNominatimResponse(data, latitude, longitude);

            setCachedReverseGeocoding(cacheKey, mappedLocation);

            return res.status(200).json(mappedLocation);
        } catch (error) {
            return res.status(500).json({
                message: 'Erro ao realizar geocodificação reversa.',
                error: error.message
            });
        }
    }
};

module.exports = locationsController;