-- ==========================================================
-- SCRIPT DE DATOS REALISTAS: COMIDA CHINA (VOLUMEN MASIVO)
-- ==========================================================

DO $$ 
DECLARE
    v_owner_id UUID := '56baf86b-c7a8-4f69-97dc-d3dfe6624bf4';
    v_business_id UUID;
    
    -- Secciones
    v_sec_entradas UUID;
    v_sec_pollo UUID;
    v_sec_res_cerdo UUID;
    v_sec_arroz_tallarin UUID;
    v_sec_paquetes UUID;
    
    -- Grupos de Modificadores
    v_grp_acompanamiento UUID;
    v_grp_proteina_extra UUID;
    v_grp_bebida_paquete UUID;
    v_grp_salsas UUID;
    
    -- Productos (16 en total)
    v_p_rollos UUID; v_p_dumplings UUID; v_p_wontons UUID;
    v_p_orange UUID; v_p_kungpao UUID; v_p_agridulce UUID;
    v_p_broccoli UUID; v_p_cerdo_bbq UUID;
    v_p_f_arroz UUID; v_p_f_tallarin UUID; v_p_arroz_blanco UUID;
    v_p_paq_1 UUID; v_p_paq_2 UUID; v_p_familiar UUID;
    v_p_te_jazmin UUID; v_p_coca UUID;

    -- Auxiliares para Venta Cruzada
    v_cs_grupo UUID;
BEGIN

    -- 1. INSERTAR NEGOCIO
    INSERT INTO public.businesses (
        "ownerId", "name", "description", "category", "address", "phone", 
        "logoUrl", "coverUrl", "isOpen", "deliveryCost", "plan", "status", "rating"
    ) VALUES (
        v_owner_id, 
        'Gran Dragón Cantón', 
        'Auténtica comida cantonesa. Especialistas en Pollo Naranja, Arroz Frito y Dim Sum.', 
        'food', 
        'Av. Paseo de los Leones #404, Col. Cumbres', 
        '5557778881', 
        '', -- logoUrl vacío
        '', -- coverUrl vacío
        true, 
        25.00, 
        'premium', 
        'active', 
        4.8
    ) RETURNING id INTO v_business_id;


    -- 2. HORARIOS (Abierto todos los días de 12:00 PM a 10:00 PM)
    INSERT INTO public.business_hours (business_id, day_of_week, open_time, close_time, is_closed)
    VALUES 
        (v_business_id, 0, '12:00:00', '22:00:00', false),
        (v_business_id, 1, '12:00:00', '22:00:00', false),
        (v_business_id, 2, '12:00:00', '22:00:00', false),
        (v_business_id, 3, '12:00:00', '22:00:00', false),
        (v_business_id, 4, '12:00:00', '22:30:00', false),
        (v_business_id, 5, '12:00:00', '23:00:00', false),
        (v_business_id, 6, '12:00:00', '23:00:00', false);


    -- 3. SECCIONES DEL MENÚ (5 Secciones)
    INSERT INTO public.sections (business_id, name, description, position, is_available)
    VALUES (v_business_id, 'Entradas y Dim Sum', 'Para comenzar tu experiencia.', 0, true) RETURNING id INTO v_sec_entradas;

    INSERT INTO public.sections (business_id, name, description, position, is_available)
    VALUES (v_business_id, 'Especialidades de Pollo', 'Servidos en porciones generosas.', 1, true) RETURNING id INTO v_sec_pollo;

    INSERT INTO public.sections (business_id, name, description, position, is_available)
    VALUES (v_business_id, 'Res y Cerdo', 'Clásicos cantoneses al wok.', 2, true) RETURNING id INTO v_sec_res_cerdo;

    INSERT INTO public.sections (business_id, name, description, position, is_available)
    VALUES (v_business_id, 'Arroz y Tallarines', 'La base perfecta para tus platillos.', 3, true) RETURNING id INTO v_sec_arroz_tallarin;

    INSERT INTO public.sections (business_id, name, description, position, is_available)
    VALUES (v_business_id, 'Paquetes Combo', 'La mejor combinación para compartir.', 4, true) RETURNING id INTO v_sec_paquetes;


    -- 4. GRUPOS DE MODIFICADORES
    -- Obligatorio: Elegir base para platillos (min 1, max 1)
    INSERT INTO public.modifier_groups (business_id, name, internal_name, min_selectable, max_selectable, is_available)
    VALUES (v_business_id, 'Selecciona tu Guarnición', 'base_platillo', 1, 1, true) RETURNING id INTO v_grp_acompanamiento;

    -- Opcional Múltiple: Agregar proteínas extra (min 0, max 3)
    INSERT INTO public.modifier_groups (business_id, name, internal_name, min_selectable, max_selectable, is_available)
    VALUES (v_business_id, '¿Deseas agregar proteína extra?', 'proteina_extra', 0, 3, true) RETURNING id INTO v_grp_proteina_extra;

    -- Obligatorio: Bebida de paquete (min 1, max 1)
    INSERT INTO public.modifier_groups (business_id, name, internal_name, min_selectable, max_selectable, is_available)
    VALUES (v_business_id, 'Elige la bebida de tu combo', 'bebida_combo', 1, 1, true) RETURNING id INTO v_grp_bebida_paquete;

    -- Opcional Múltiple: Salsas extras (min 0, max 4)
    INSERT INTO public.modifier_groups (business_id, name, internal_name, min_selectable, max_selectable, is_available)
    VALUES (v_business_id, 'Salsas Extras Gratis', 'salsas_comida_china', 0, 4, true) RETURNING id INTO v_grp_salsas;


    -- 5. OPCIONES DE MODIFICADORES
    -- Guarniciones
    INSERT INTO public.modifier_options (modifier_group_id, name, extra_price, is_available) VALUES 
        (v_grp_acompanamiento, 'Arroz Frito Especial', 0.00, true),
        (v_grp_acompanamiento, 'Tallarines Chow Mein', 0.00, true),
        (v_grp_acompanamiento, 'Arroz Blanco al Vapor', 0.00, true),
        (v_grp_acompanamiento, 'Vegetales al Vapor', 10.00, true);

    -- Proteínas Extra
    INSERT INTO public.modifier_options (modifier_group_id, name, extra_price, is_available) VALUES 
        (v_grp_proteina_extra, 'Extra Pollo Kung Pao', 35.00, true),
        (v_grp_proteina_extra, 'Extra Res con Brócoli', 45.00, true),
        (v_grp_proteina_extra, 'Extra Camarones al Wok', 55.00, true);

    -- Bebidas
    INSERT INTO public.modifier_options (modifier_group_id, name, extra_price, is_available) VALUES 
        (v_grp_bebida_paquete, 'Té de Jazmín Helado', 0.00, true),
        (v_grp_bebida_paquete, 'Coca-Cola Original 355ml', 0.00, true),
        (v_grp_bebida_paquete, 'Agua Embotellada', 0.00, true);

    -- Salsas
    INSERT INTO public.modifier_options (modifier_group_id, name, extra_price, is_available) VALUES 
        (v_grp_salsas, 'Salsa Agridulce Roja', 0.00, true),
        (v_grp_salsas, 'Salsa de Soya Clásica', 0.00, true),
        (v_grp_salsas, 'Salsa Sriracha Picante', 0.00, true),
        (v_grp_salsas, 'Aceite de Chile con Ajo 🔥', 5.00, true),
        (v_grp_salsas, 'Salsa Hoisin', 0.00, true);


    -- 6. PRODUCTOS (16 Productos) - image_url vacío ('') en todos
    
    -- Sección: Entradas (3)
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Rollos Primavera (3 pzas)', 'Crujientes rollos rellenos de vegetales frescos. Incluye salsa agridulce.', 55.00, '', true, 0) RETURNING id INTO v_p_rollos;
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Dumplings de Cerdo (6 pzas)', 'Hechos al vapor o fritos, rellenos de carne y cebollín.', 85.00, '', true, 1) RETURNING id INTO v_p_dumplings;
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Wontons Fritos (5 pzas)', 'Rellenos de queso crema y cangrejo.', 75.00, '', true, 2) RETURNING id INTO v_p_wontons;

    -- Sección: Pollo (3)
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Pollo Naranja Legendario', 'Pechuga de pollo crujiente en salsa agridulce de naranja picante.', 145.00, '', true, 0) RETURNING id INTO v_p_orange;
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Pollo Kung Pao 🌶️', 'Salteado con cacahuates, chiles secos y pimientos.', 140.00, '', true, 1) RETURNING id INTO v_p_kungpao;
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Pollo Agridulce Clásico', 'Con piña, pimientos y cebolla en salsa roja tradicional.', 135.00, '', true, 2) RETURNING id INTO v_p_agridulce;

    -- Sección: Res y Cerdo (2)
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Res con Brócoli', 'Láminas de res suaves salteadas con brócoli fresco en salsa de soya.', 160.00, '', true, 0) RETURNING id INTO v_p_broccoli;
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Cerdo BBQ Estilo Cantón', 'Lomo de cerdo marinado y horneado en salsa dulce de cinco especias.', 150.00, '', true, 1) RETURNING id INTO v_p_cerdo_bbq;

    -- Sección: Arroz y Tallarines (3)
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Arroz Frito Especial', 'Con huevo, chícharos, zanahoria, pollo, res y camarón.', 110.00, '', true, 0) RETURNING id INTO v_p_f_arroz;
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Tallarines Chow Mein', 'Salteados al wok con vegetales mixtos y salsa de soya oscura.', 115.00, '', true, 1) RETURNING id INTO v_p_f_tallarin;
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Arroz Blanco al Vapor', 'Arroz jazmín cocido al vapor, ideal para bañar en salsas.', 45.00, '', true, 2) RETURNING id INTO v_p_arroz_blanco;

    -- Sección: Paquetes (3)
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Paquete Individual (1 Especialidad)', 'Elige 1 guarnición y 1 especialidad de pollo o res.', 165.00, '', true, 0) RETURNING id INTO v_p_paq_1;
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Paquete Doble (2 Especialidades)', 'Elige 1 guarnición grande y 2 especialidades a elegir.', 260.00, '', true, 1) RETURNING id INTO v_p_paq_2;
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Banquete Familiar (3 Especialidades)', 'Rinde para 4 personas. Incluye 2 guarniciones grandes y 3 especialidades.', 480.00, '', true, 2) RETURNING id INTO v_p_familiar;

    -- Sección: Bebidas (2)
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Té de Jazmín Embotellado', 'Bebida fría y refrescante tradicional.', 35.00, '', true, 0) RETURNING id INTO v_p_te_jazmin;
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Coca-Cola Sin Azúcar 355ml', 'Refresco de lata.', 30.00, '', true, 1) RETURNING id INTO v_p_coca;


    -- 7. VINCULACIÓN PRODUCTOS <-> SECCIONES
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_rollos, v_sec_entradas);
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_dumplings, v_sec_entradas);
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_wontons, v_sec_entradas);
    
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_orange, v_sec_pollo);
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_kungpao, v_sec_pollo);
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_agridulce, v_sec_pollo);
    
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_broccoli, v_sec_res_cerdo);
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_cerdo_bbq, v_sec_res_cerdo);
    
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_f_arroz, v_sec_arroz_tallarin);
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_f_tallarin, v_sec_arroz_tallarin);
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_arroz_blanco, v_sec_arroz_tallarin);
    
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_paq_1, v_sec_paquetes);
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_paq_2, v_sec_paquetes);
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_familiar, v_sec_paquetes);

    -- Vinculando bebidas a la sección de bebidas (Asumimos que v_sec_arroz_tallarin fue un typo en tu original)
    -- Lo corregimos para que vayan a su sección o a la de Arroz (siguiendo tu lógica N:N)
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_te_jazmin, v_sec_arroz_tallarin);
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_coca, v_sec_arroz_tallarin);


    -- 8. VINCULACIÓN PRODUCTOS <-> GRUPOS DE MODIFICADORES
    INSERT INTO public.product_modifiers (product_id, modifier_group_id) 
    SELECT p.id, m.id 
    FROM public.products p, public.modifier_groups m
    WHERE p.id IN (v_p_orange, v_p_kungpao, v_p_agridulce, v_p_broccoli, v_p_cerdo_bbq)
      AND m.id IN (v_grp_acompanamiento, v_grp_proteina_extra, v_grp_salsas);

    INSERT INTO public.product_modifiers (product_id, modifier_group_id) 
    SELECT p.id, m.id 
    FROM public.products p, public.modifier_groups m
    WHERE p.id IN (v_p_paq_1, v_p_paq_2, v_p_familiar)
      AND m.id IN (v_grp_acompanamiento, v_grp_bebida_paquete, v_grp_salsas);


    -- 9. GRUPOS DE VENTA CRUZADA (NUEVO)

    -- ====== A) EN EL POLLO NARANJA ======
    -- Sugerir Entradas (Formato Grid)
    INSERT INTO public.product_cross_sell_groups (origin_product_id, name, position, is_available, visualization_type)
    VALUES (v_p_orange, '¿Gustas una entrada?', 0, true, 'grid') RETURNING id INTO v_cs_grupo;

    INSERT INTO public.product_cross_sell_items (group_id, suggested_product_id, override_price, position) VALUES 
        (v_cs_grupo, v_p_rollos, 45.00, 0),        -- Descuento de $55 a $45
        (v_cs_grupo, v_p_dumplings, NULL, 1);      -- Precio normal

    -- ====== B) EN EL ARROZ FRITO ESPECIAL ======
    -- Sugerir Dumplings o Wontons (Formato Lista)
    INSERT INTO public.product_cross_sell_groups (origin_product_id, name, position, is_available, visualization_type)
    VALUES (v_p_f_arroz, 'Perfecto para acompañar', 0, true, 'list') RETURNING id INTO v_cs_grupo;

    INSERT INTO public.product_cross_sell_items (group_id, suggested_product_id, override_price, position) VALUES 
        (v_cs_grupo, v_p_dumplings, 75.00, 0),     -- Descuento de $85 a $75
        (v_cs_grupo, v_p_wontons, NULL, 1);        -- Precio normal


    -- ====== C) EN EL PAQUETE INDIVIDUAL ======
    -- Sugerir Bebida Premium Tradicional (Formato Lista)
    INSERT INTO public.product_cross_sell_groups (origin_product_id, name, position, is_available, visualization_type)
    VALUES (v_p_paq_1, '¿Prefieres la bebida tradicional?', 0, true, 'list') RETURNING id INTO v_cs_grupo;

    INSERT INTO public.product_cross_sell_items (group_id, suggested_product_id, override_price, position) VALUES 
        (v_cs_grupo, v_p_te_jazmin, 20.00, 0);     -- Descuento de $35 a $20


    -- ====== D) EN EL BANQUETE FAMILIAR ======
    -- Sugerir Entradas en Volumen (Formato Grid)
    INSERT INTO public.product_cross_sell_groups (origin_product_id, name, position, is_available, visualization_type)
    VALUES (v_p_familiar, 'Para compartir mientras esperan', 0, true, 'grid') RETURNING id INTO v_cs_grupo;

    INSERT INTO public.product_cross_sell_items (group_id, suggested_product_id, override_price, position) VALUES 
        (v_cs_grupo, v_p_rollos, 50.00, 0),
        (v_cs_grupo, v_p_wontons, 65.00, 1);

END $$;