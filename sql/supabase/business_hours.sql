-- 1. Borramos la tabla actual por si ya tenía datos de prueba viejos
drop table if exists public.business_hours cascade;

CREATE TABLE public.business_hours (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    day_of_week INT NOT NULL, -- 0 (Domingo) a 6 (Sábado)
    open_time TIME NOT NULL,  -- Ej: "09:00:00"
    close_time TIME NOT NULL, -- Ej: "22:00:00"
    is_closed BOOLEAN DEFAULT false NOT NULL -- Por si cierran todo el día
);