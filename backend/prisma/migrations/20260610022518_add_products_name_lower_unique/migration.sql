-- Garante unicidade do nome do produto de forma case-insensitive.
-- Índice funcional não é representável no schema.prisma; mantido apenas via SQL.
CREATE UNIQUE INDEX "products_name_lower_key" ON "products" (LOWER("name"));
