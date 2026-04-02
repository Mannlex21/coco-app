-- 1. Borramos la tabla si ya existe (¡CUIDADO! Esto borra todos los datos de products!)
DROP TABLE IF EXISTS products CASCADE;

-- 2. Creamos la tabla de productos limpia
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true NOT NULL,
    position INT DEFAULT 1 NOT NULL, -- Cambiado a INT para que lo controles manualmente en el app
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas básicas de acceso
CREATE POLICY "Permitir lectura pública de productos" 
ON products FOR SELECT USING (true);

CREATE POLICY "Permitir inserción a usuarios autenticados" 
ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir actualización a usuarios autenticados" 
ON products FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir eliminación a usuarios autenticados" 
ON products FOR DELETE USING (auth.role() = 'authenticated');