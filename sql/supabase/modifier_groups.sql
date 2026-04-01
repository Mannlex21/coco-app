CREATE TABLE IF NOT EXISTS public.modifier_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- Ej: "Escoge tu refresco"
    internal_name TEXT, -- Nombre interno para control del negocio
    min_selectable INT DEFAULT 0, -- 1 si es obligatorio, 0 si es opcional
    max_selectable INT DEFAULT 1, -- Cuántos puede elegir máximo
    status TEXT DEFAULT 'active'
);