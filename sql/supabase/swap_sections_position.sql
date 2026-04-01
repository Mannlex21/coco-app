CREATE OR REPLACE FUNCTION swap_sections_position(
  current_id UUID,
  current_pos INT,
  target_id UUID,
  target_pos INT
)
RETURNS VOID AS $$
BEGIN
  -- Actualizamos la primera sección
  UPDATE sections 
  SET position = target_pos 
  WHERE id = current_id;

  -- Actualizamos la segunda sección
  UPDATE sections 
  SET position = current_pos 
  WHERE id = target_id;
END;
$$ LANGUAGE plpgsql;