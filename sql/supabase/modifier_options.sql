CREATE TABLE public.modifier_options (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    modifier_group_id UUID REFERENCES public.modifier_groups(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- Ej: "Coca-Cola", "Papas Extra", "Sin Cebolla"
    extra_price DECIMAL(10, 2) DEFAULT 0.00, -- Costo extra (ej: 15.00)
    is_available BOOLEAN DEFAULT true NOT NULL,
);
