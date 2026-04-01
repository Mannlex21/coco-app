-- Borramos las políticas anteriores para no duplicar
DROP POLICY IF EXISTS "Permitir insercion a autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Permitir update a autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Permitir select a autenticados" ON storage.objects;

-- Creamos una política que permita TODO en el bucket coco-media a usuarios logueados
CREATE POLICY "Acceso total a coco-media para autenticados" 
ON storage.objects 
FOR ALL 
TO authenticated 
USING (bucket_id = 'coco-media')
WITH CHECK (bucket_id = 'coco-media');