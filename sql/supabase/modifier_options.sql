CREATE TABLE public.modifier_options (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    modifier_group_id UUID REFERENCES public.modifier_groups(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- Ej: "Coca-Cola", "Papas Extra", "Sin Cebolla"
    price_override DECIMAL(10, 2) DEFAULT 0.00, -- Costo extra (ej: 15.00)
    status TEXT DEFAULT 'active' -- Para cuando se agote un ingrediente
);