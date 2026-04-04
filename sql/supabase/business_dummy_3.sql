-- ==========================================================
-- SCRIPT DE DATOS REALISTAS: TAQUERÍA (VOLUMEN MASIVO)
-- ==========================================================

DO $$ 
DECLARE
    v_owner_id UUID := '56baf86b-c7a8-4f69-97dc-d3dfe6624bf4';
    v_business_id UUID;
    
    -- Secciones
    v_sec_tacos UUID;
    v_sec_costras UUID;
    v_sec_entradas UUID;
    v_sec_bebidas UUID;
    v_sec_postres UUID;
    
    -- Grupos de Modificadores
    v_grp_tortilla UUID;
    v_grp_con UUID;
    v_grp_extras UUID;
    v_grp_salsas UUID;
    
    -- Productos (16 en total)
    v_p_pastor UUID; v_p_asada UUID; v_p_suadero UUID; v_p_campechano UUID;
    v_p_costra_pastor UUID; v_p_costra_asada UUID; v_p_gringa UUID; v_p_volcan UUID;
    v_p_guacamole UUID; v_p_frijoles UUID; v_p_cebollitas UUID;
    v_p_horchata UUID; v_p_jamaica UUID; v_p_coca UUID;
    v_p_flan UUID; v_p_arroz UUID;
BEGIN

    -- 1. INSERTAR NEGOCIO
    INSERT INTO public.businesses (
        "ownerId", "name", "description", "category", "address", "phone", 
        "logoUrl", "coverUrl", "isOpen", "deliveryCost", "plan", "status", "rating"
    ) VALUES (
        v_owner_id, 
        'Gran Taquería "El Trompo Loco"', 
        'Los mejores tacos al pastor de la ciudad, volcanes, costras y aguas frescas naturales.', 
        'food', 
        'Av. Revolución #88, Col. Escandón', 
        '5551234567', 
        'https://placehold.co/400x400/1A7D78/FFFFFF?text=Trompo+Logo', 
        'https://placehold.co/1200x600/1E1E1E/FFFFFF?text=Tacos+Cover', 
        true, 
        20.00, 
        'premium', 
        'active', 
        4.7
    ) RETURNING id INTO v_business_id;


    -- 2. HORARIOS (Horario de taquería nocturna)
    INSERT INTO public.business_hours (business_id, day_of_week, open_time, close_time, is_closed)
    VALUES 
        (v_business_id, 0, '17:00:00', '02:00:00', false),
        (v_business_id, 1, '17:00:00', '01:00:00', false),
        (v_business_id, 2, '17:00:00', '01:00:00', false),
        (v_business_id, 3, '17:00:00', '01:00:00', false),
        (v_business_id, 4, '17:00:00', '03:00:00', false),
        (v_business_id, 5, '15:00:00', '04:00:00', false), -- Fin de semana desde temprano
        (v_business_id, 6, '15:00:00', '04:00:00', false);


    -- 3. SECCIONES DEL MENÚ (5 Secciones)
    INSERT INTO public.sections (business_id, name, description, position, is_available)
    VALUES (v_business_id, 'Tacos Clásicos', 'Servidos con copia de tortilla y la carne de tu elección.', 0, true) RETURNING id INTO v_sec_tacos;

    INSERT INTO public.sections (business_id, name, description, position, is_available)
    VALUES (v_business_id, 'Especialidades y Costras', 'Con base de queso fundido a la plancha.', 1, true) RETURNING id INTO v_sec_costras;

    INSERT INTO public.sections (business_id, name, description, position, is_available)
    VALUES (v_business_id, 'Entradas y Guarniciones', 'Para empezar o acompañar tus tacos.', 2, true) RETURNING id INTO v_sec_entradas;

    INSERT INTO public.sections (business_id, name, description, position, is_available)
    VALUES (v_business_id, 'Bebidas y Aguas Frescas', 'Hechas diario con fruta natural.', 3, true) RETURNING id INTO v_sec_bebidas;

    INSERT INTO public.sections (business_id, name, description, position, is_available)
    VALUES (v_business_id, 'Postres', 'El toque dulce para cerrar.', 4, true) RETURNING id INTO v_sec_postres;


    -- 4. GRUPOS DE MODIFICADORES
    -- Obligatorio: Tipo de Tortilla (min 1, max 1)
    INSERT INTO public.modifier_groups (business_id, name, internal_name, min_selectable, max_selectable, is_available)
    VALUES (v_business_id, 'Tipo de Tortilla', 'tipo_tortilla', 1, 1, true) RETURNING id INTO v_grp_tortilla;

    -- Obligatorio: Con o sin verdura (min 1, max 1)
    INSERT INTO public.modifier_groups (business_id, name, internal_name, min_selectable, max_selectable, is_available)
    VALUES (v_business_id, '¿Cómo los prefieres?', 'con_o_sin', 1, 1, true) RETURNING id INTO v_grp_con;

    -- Opcional Múltiple: Extras (min 0, max 6) - Perfecto para probar desbordamiento
    INSERT INTO public.modifier_groups (business_id, name, internal_name, min_selectable, max_selectable, is_available)
    VALUES (v_business_id, '¿Deseas algún extra?', 'extras_tacos', 0, 6, true) RETURNING id INTO v_grp_extras;

    -- Opcional Múltiple: Salsas directo al taco (min 0, max 2)
    INSERT INTO public.modifier_groups (business_id, name, internal_name, min_selectable, max_selectable, is_available)
    VALUES (v_business_id, 'Báñalos en salsa (Máx 2)', 'salsas_taco', 0, 2, true) RETURNING id INTO v_grp_salsas;


    -- 5. OPCIONES DE MODIFICADORES
    -- Tortillas
    INSERT INTO public.modifier_options (modifier_group_id, name, extra_price, is_available) VALUES 
        (v_grp_tortilla, 'Maíz Amarillo (Clásica)', 0.00, true),
        (v_grp_tortilla, 'Harina de Trigo', 5.00, true),
        (v_grp_tortilla, 'Tortilla de Maíz Azul', 3.00, true);

    -- Con o Sin
    INSERT INTO public.modifier_options (modifier_group_id, name, extra_price, is_available) VALUES 
        (v_grp_con, 'Con todo (Cebolla, cilantro y piña)', 0.00, true),
        (v_grp_con, 'Solo carne', 0.00, true),
        (v_grp_con, 'Sin piña', 0.00, true);

    -- Extras para los Tacos (¡Muchos para probar el "+ X"!)
    INSERT INTO public.modifier_options (modifier_group_id, name, extra_price, is_available) VALUES 
        (v_grp_extras, 'Queso Oaxaca Fundido', 15.00, true),
        (v_grp_extras, 'Aguacate en rebanadas', 12.00, true),
        (v_grp_extras, 'Doble porción de carne', 20.00, true),
        (v_grp_extras, 'Chicharrón de queso', 15.00, true),
        (v_grp_extras, 'Tocino picado', 14.00, true),
        (v_grp_extras, 'Nopales asados', 8.00, true);

    -- Salsas
    INSERT INTO public.modifier_options (modifier_group_id, name, extra_price, is_available) VALUES 
        (v_grp_salsas, 'Verde cremosa (No pica)', 0.00, true),
        (v_grp_salsas, 'Roja de árbol 🔥', 0.00, true),
        (v_grp_salsas, 'Habanero extrema 🔥🔥🔥', 0.00, true),
        (v_grp_salsas, 'Salsa Macha', 5.00, true);


    -- 6. PRODUCTOS (16 Productos)
    
    -- Sección: Tacos Clásicos (4)
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Taco al Pastor', 'Carne de cerdo marinada en adobo clásico.', 18.00, 'https://placehold.co/600x400/1A7D78/FFFFFF?text=Pastor', true, 0) RETURNING id INTO v_p_pastor;
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Taco de Bistec (Asada)', 'Bistec de res de primera calidad a la plancha.', 22.00, 'https://placehold.co/600x400/1A7D78/FFFFFF?text=Bistec', true, 1) RETURNING id INTO v_p_asada;
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Taco de Suadero', 'Suadero de res confitado lentamente.', 20.00, 'https://placehold.co/600x400/1A7D78/FFFFFF?text=Suadero', true, 2) RETURNING id INTO v_p_suadero;
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Taco Campechano', 'La gloriosa mezcla de bistec, longaniza y chicharrón.', 24.00, 'https://placehold.co/600x400/1A7D78/FFFFFF?text=Campechano', true, 3) RETURNING id INTO v_p_campechano;

    -- Sección: Especialidades y Costras (4)
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Costra de Pastor', 'Carne al pastor envuelta en una costra crujiente de queso.', 55.00, 'https://placehold.co/600x400/1A7D78/FFFFFF?text=Costra+Pastor', true, 0) RETURNING id INTO v_p_costra_pastor;
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Costra de Asada', 'Bistec de res sobre una cama crujiente de queso fundido.', 60.00, 'https://placehold.co/600x400/1A7D78/FFFFFF?text=Costra+Asada', true, 1) RETURNING id INTO v_p_costra_asada;
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Gringa Clásica', 'Tortilla de harina con queso fundido y carne al pastor.', 65.00, 'https://placehold.co/600x400/1A7D78/FFFFFF?text=Gringa', true, 2) RETURNING id INTO v_p_gringa;
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Volcán de Suadero', 'Tortilla tostada a las brasas con queso y suadero.', 45.00, 'https://placehold.co/600x400/1A7D78/FFFFFF?text=Volcan', true, 3) RETURNING id INTO v_p_volcan;

    -- Sección: Entradas y Guarniciones (3)
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Orden de Guacamole', 'Aguacate machacado con pico de gallo y totopos.', 70.00, 'https://placehold.co/600x400/1A7D78/FFFFFF?text=Guacamole', true, 0) RETURNING id INTO v_p_guacamole;
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Frijoles Charros', 'Caldo de frijol con tocino, salchicha y un toque de chile.', 40.00, 'https://placehold.co/600x400/1A7D78/FFFFFF?text=Frijoles', true, 1) RETURNING id INTO v_p_frijoles;
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Cebollitas Cambray Asadas', 'Orden de cebollitas asadas al carbón con limón.', 30.00, 'https://placehold.co/600x400/1A7D78/FFFFFF?text=Cebollitas', true, 2) RETURNING id INTO v_p_cebollitas;

    -- Sección: Bebidas (3)
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Agua de Horchata Grande (1L)', 'Agua de horchata cremosa hecha en casa.', 45.00, 'https://placehold.co/600x400/1A7D78/FFFFFF?text=Horchata', true, 0) RETURNING id INTO v_p_horchata;
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Agua de Jamaica Grande (1L)', 'Refrescante agua de jamaica natural.', 45.00, 'https://placehold.co/600x400/1A7D78/FFFFFF?text=Jamaica', true, 1) RETURNING id INTO v_p_jamaica;
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Coca-Cola de Vidrio 500ml', 'La de vidrio sabe mejor.', 35.00, 'https://placehold.co/600x400/1A7D78/FFFFFF?text=Coca+Vidrio', true, 2) RETURNING id INTO v_p_coca;

    -- Sección: Postres (2)
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Flan Napolitano', 'Tradicional flan casero de vainilla con caramelo.', 50.00, 'https://placehold.co/600x400/1A7D78/FFFFFF?text=Flan', true, 0) RETURNING id INTO v_p_flan;
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Arroz con Leche', 'Arroz dulce con canela y pasas.', 40.00, 'https://placehold.co/600x400/1A7D78/FFFFFF?text=Arroz+Con+Leche', true, 1) RETURNING id INTO v_p_arroz;


    -- 7. VINCULACIÓN PRODUCTOS <-> SECCIONES (Soporta N:N)
    -- Tacos
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_pastor, v_sec_tacos);
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_asada, v_sec_tacos);
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_suadero, v_sec_tacos);
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_campechano, v_sec_tacos);
    
    -- Costras y Especialidades
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_costra_pastor, v_sec_costras);
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_costra_asada, v_sec_costras);
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_gringa, v_sec_costras);
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_volcan, v_sec_costras);
    
    -- Entradas
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_guacamole, v_sec_entradas);
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_frijoles, v_sec_entradas);
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_cebollitas, v_sec_entradas);
    
    -- Bebidas
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_horchata, v_sec_bebidas);
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_jamaica, v_sec_bebidas);
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_coca, v_sec_bebidas);
    
    -- Postres
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_flan, v_sec_postres);
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_arroz, v_sec_postres);


    -- 8. VINCULACIÓN PRODUCTOS <-> GRUPOS DE MODIFICADORES
    -- A todos los tacos clásicos les aplica: Tortilla, Con/Sin, Extras y Salsas (Asignación en masa)
    INSERT INTO public.product_modifiers (product_id, modifier_group_id) 
    SELECT p.id, m.id 
    FROM public.products p, public.modifier_groups m
    WHERE p.id IN (v_p_pastor, v_p_asada, v_p_suadero, v_p_campechano)
      AND m.id IN (v_grp_tortilla, v_grp_con, v_grp_extras, v_grp_salsas);

    -- A las costras y volcanes les aplican: Con/Sin, Extras y Salsas (La tortilla no, porque es de queso)
    INSERT INTO public.product_modifiers (product_id, modifier_group_id) 
    SELECT p.id, m.id 
    FROM public.products p, public.modifier_groups m
    WHERE p.id IN (v_p_costra_pastor, v_p_costra_asada, v_p_volcan, v_p_gringa)
      AND m.id IN (v_grp_con, v_grp_extras, v_grp_salsas);

END $$;