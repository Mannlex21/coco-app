-- Volver a crear la tabla intermedia por si se borró con el CASCADE anterior
DROP TABLE IF EXISTS product_sections CASCADE;

CREATE TABLE product_sections (
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    PRIMARY KEY (product_id, section_id)
);

ALTER TABLE product_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura pública de relaciones" ON product_sections FOR SELECT USING (true);
CREATE POLICY "Permitir inserción a usuarios autenticados" ON product_sections FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Permitir eliminación a usuarios autenticados" ON product_sections FOR DELETE USING (auth.role() = 'authenticated');