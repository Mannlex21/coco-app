-- 1. Creamos el tipo ENUM con las dos opciones de visualización
CREATE TYPE visualization_type AS ENUM ('list', 'grid');

-- 2. Agregamos la columna a la tabla con el valor por defecto 'list'
ALTER TABLE public.sections 
ADD COLUMN visualization_type visualization_type DEFAULT 'list' NOT NULL;