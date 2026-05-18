ALTER TABLE
    stores
ADD
    COLUMN address_number VARCHAR(20),
ADD
    COLUMN neighborhood VARCHAR(100),
ADD
    COLUMN city VARCHAR(100),
ADD
    COLUMN state VARCHAR(2),
ADD
    COLUMN postal_code VARCHAR(20),
ADD
    COLUMN country VARCHAR(80) DEFAULT 'Brasil',
ADD
    COLUMN latitude NUMERIC(10, 8),
ADD
    COLUMN longitude NUMERIC(11, 8);

ALTER TABLE
    stores
ADD
    CONSTRAINT chk_stores_latitude_range CHECK (
        latitude IS NULL
        OR (
            latitude >= -90
            AND latitude <= 90
        )
    );

ALTER TABLE
    stores
ADD
    CONSTRAINT chk_stores_longitude_range CHECK (
        longitude IS NULL
        OR (
            longitude >= -180
            AND longitude <= 180
        )
    );

ALTER TABLE
    stores
ADD
    CONSTRAINT chk_stores_coordinates_pair CHECK (
        (
            latitude IS NULL
            AND longitude IS NULL
        )
        OR (
            latitude IS NOT NULL
            AND longitude IS NOT NULL
        )
    );