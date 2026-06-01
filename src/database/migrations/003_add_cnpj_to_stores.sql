ALTER TABLE
    stores
ADD
    COLUMN cnpj VARCHAR(14);

UPDATE
    stores
SET
    cnpj = '11222333000181'
WHERE
    name = 'Mundo da Panela'
    AND cnpj IS NULL;

ALTER TABLE
    stores
ALTER COLUMN
    cnpj
SET
    NOT NULL;

ALTER TABLE
    stores
ADD
    CONSTRAINT uq_stores_cnpj UNIQUE (cnpj);

ALTER TABLE
    stores
ADD
    CONSTRAINT chk_stores_cnpj_format CHECK (cnpj ~ '^[0-9]{14}$');