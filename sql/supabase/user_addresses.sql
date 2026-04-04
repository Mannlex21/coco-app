drop table if exists public.user_addresses cascade;

CREATE TABLE public.user_addresses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL, -- Ej: "Casa", "Trabajo", "Ubicación actual"
    address TEXT NOT NULL, -- Dirección en texto para mostrarla fácil
    location JSONB NOT NULL, -- Coordenadas {lat: x, lng: y} para el mapa y repartidor
    is_default BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitamos tiempo real por si el usuario edita algo desde otro dispositivo
alter publication supabase_realtime add table user_addresses;