ALTER TABLE
    stores
ADD COLUMN IF NOT EXISTS
    cnpj VARCHAR(14);

-- Preenche CNPJ placeholder único para lojas existentes antes de NOT NULL
UPDATE
    stores
SET
    cnpj = LPAD(id::text, 14, '0')
WHERE
    cnpj IS NULL;

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