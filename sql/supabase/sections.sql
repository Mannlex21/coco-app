-- 1. Borramos la tabla si ya existe para evitar conflictos de duplicados
DROP TABLE IF EXISTS public.sections CASCADE;

-- 2. Creamos la tabla limpia con el campo booleano
CREATE TABLE public.sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,                  -- Ej: "Hamburguesas"
    description TEXT,                    -- Ej: "Todas incluyen papas"
    position INT DEFAULT 0,              -- Para ordenar las categorías manualmente
    is_available BOOLEAN DEFAULT true,   -- 👈 Cambiado de status TEXT a BOOLEAN
    created_at TIMESTAMPTZ DEFAULT now(),-- Control de auditoría
    updated_at TIMESTAMPTZ DEFAULT now() -- Control de auditoría
);