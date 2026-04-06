-- ==========================================================
-- SCRIPT DE DATOS REALISTAS: HAMBURGUESERÍA (CON VENTA CRUZADA)
-- ==========================================================

DO $$ 
DECLARE
    v_owner_id UUID := '56baf86b-c7a8-4f69-97dc-d3dfe6624bf4';
    v_business_id UUID;
    
    -- Secciones
    v_sec_burgers UUID;
    v_sec_entradas UUID;
    v_sec_bebidas UUID;
    v_sec_combos UUID;
    
    -- Grupos de Modificadores
    v_grp_termino UUID;
    v_grp_refrescos UUID;
    v_grp_extras UUID;
    v_grp_salsas UUID;
    
    -- Productos (8 en total)
    v_prod_doble UUID;
    v_prod_chicken UUID;
    v_prod_veggie UUID;
    v_prod_papas UUID;
    v_prod_alitas UUID;
    v_prod_coca UUID;
    v_prod_cerveza UUID;
    v_prod_combo_master UUID;

    -- Auxiliares para Venta Cruzada
    v_cs_grupo UUID;
BEGIN

    -- 1. INSERTAR NEGOCIO
    INSERT INTO public.businesses (
        "ownerId", "name", "description", "category", "address", "phone", 
        "logoUrl", "coverUrl", "isOpen", "deliveryCost", "plan", "status", "rating"
    ) VALUES (
        v_owner_id, 
        'Burgers & Tragos "La Terminal"', 
        'Hamburguesas artesanales al carbón, snacks para compartir y las mejores bebidas frías.', 
        'food', 
        'Av. Insurgentes Sur #4232, Col. Condesa', 
        '5559876543', 
        '', -- logoUrl vacío
        '', -- coverUrl vacío
        true, 
        25.00, 
        'premium', 
        'active', 
        4.9
    ) RETURNING id INTO v_business_id;


    -- 2. HORARIOS (Abierto todos los días con horario quebrado de fin de semana)
    INSERT INTO public.business_hours (business_id, day_of_week, open_time, close_time, is_closed)
    VALUES 
        (v_business_id, 0, '12:00:00', '22:00:00', false),
        (v_business_id, 1, '12:00:00', '21:00:00', false),
        (v_business_id, 2, '12:00:00', '21:00:00', false),
        (v_business_id, 3, '12:00:00', '21:00:00', false),
        (v_business_id, 4, '12:00:00', '23:30:00', false), -- Jueves de promo
        (v_business_id, 5, '11:00:00', '01:00:00', false), -- Viernes extendido
        (v_business_id, 6, '11:00:00', '01:00:00', false); -- Sábado extendido


    -- 3. SECCIONES DEL MENÚ
    INSERT INTO public.sections (business_id, name, description, position, is_available)
    VALUES (v_business_id, 'Hamburguesas', '100% Carne de res selecta de 150g al carbón.', 0, true) RETURNING id INTO v_sec_burgers;

    INSERT INTO public.sections (business_id, name, description, position, is_available)
    VALUES (v_business_id, 'Entradas y Snacks', 'Para calentar motores o compartir con amigos.', 1, true) RETURNING id INTO v_sec_entradas;

    INSERT INTO public.sections (business_id, name, description, position, is_available)
    VALUES (v_business_id, 'Bebidas y Cocteles', 'Bien frías para acompañar.', 2, true) RETURNING id INTO v_sec_bebidas;

    INSERT INTO public.sections (business_id, name, description, position, is_available)
    VALUES (v_business_id, 'Combos Imbatibles', 'La mejor forma de ahorrar en tus comidas.', 3, true) RETURNING id INTO v_sec_combos;


    -- 4. GRUPOS DE MODIFICADORES (Reglas variadas)
    -- Obligatorio (Término de la carne): min 1, max 1
    INSERT INTO public.modifier_groups (business_id, name, internal_name, min_selectable, max_selectable, is_available)
    VALUES (v_business_id, 'Término de la carne', 'termino_res', 1, 1, true) RETURNING id INTO v_grp_termino;

    -- Obligatorio (Bebida del combo): min 1, max 1
    INSERT INTO public.modifier_groups (business_id, name, internal_name, min_selectable, max_selectable, is_available)
    VALUES (v_business_id, 'Elige tu Bebida', 'bebida_combo', 1, 1, true) RETURNING id INTO v_grp_refrescos;

    -- Opcional Múltiple (Toppings extra): min 0, max 5
    INSERT INTO public.modifier_groups (business_id, name, internal_name, min_selectable, max_selectable, is_available)
    VALUES (v_business_id, '¿Deseas algo extra?', 'toppings_hamburguesa', 0, 5, true) RETURNING id INTO v_grp_extras;

    -- Opcional Limitado (Salsas para alitas): min 0, max 2
    INSERT INTO public.modifier_groups (business_id, name, internal_name, min_selectable, max_selectable, is_available)
    VALUES (v_business_id, 'Elige hasta 2 salsas', 'salsas_alitas', 0, 2, true) RETURNING id INTO v_grp_salsas;


    -- 5. OPCIONES DE MODIFICADORES
    -- Términos
    INSERT INTO public.modifier_options (modifier_group_id, name, extra_price, is_available) VALUES 
        (v_grp_termino, 'Término Medio', 0.00, true),
        (v_grp_termino, 'Tres Cuartos', 0.00, true),
        (v_grp_termino, 'Bien Cocida', 0.00, true);

    -- Refrescos / Bebidas
    INSERT INTO public.modifier_options (modifier_group_id, name, extra_price, is_available) VALUES 
        (v_grp_refrescos, 'Coca-Cola Regular 355ml', 0.00, true),
        (v_grp_refrescos, 'Coca-Cola Sin Azúcar 355ml', 0.00, true),
        (v_grp_refrescos, 'Sprite Limón', 0.00, true),
        (v_grp_refrescos, 'Fanta Naranja', 0.00, true),
        (v_grp_refrescos, 'Agua de Jamaica Natural', 5.00, true),
        (v_grp_refrescos, 'Malteada de Vainilla', 25.00, true);

    -- Extras para las Burgers (Para probar el "+ X" en chips)
    INSERT INTO public.modifier_options (modifier_group_id, name, extra_price, is_available) VALUES 
        (v_grp_extras, 'Extra Queso Cheddar', 15.00, true),
        (v_grp_extras, 'Tiras de Tocino Ahumado', 22.00, true),
        (v_grp_extras, 'Huevo Estrellado', 18.00, true),
        (v_grp_extras, 'Champiñones Salteados', 20.00, true),
        (v_grp_extras, 'Guacamole Fresco', 25.00, true),
        (v_grp_extras, 'Doble Carne (150g extra)', 45.00, true);

    -- Salsas para las Alitas
    INSERT INTO public.modifier_options (modifier_group_id, name, extra_price, is_available) VALUES 
        (v_grp_salsas, 'BBQ Clásica', 0.00, true),
        (v_grp_salsas, 'Buffalo Hot', 0.00, true),
        (v_grp_salsas, 'Lemon Pepper', 0.00, true),
        (v_grp_salsas, 'Mango Habanero 🔥', 5.00, true),
        (v_grp_salsas, 'Ajo Parmesano', 5.00, true);


    -- 6. PRODUCTOS (8 Productos) - image_url vacío ('') en todos
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'La Terminal Doble', 'Nuestra Burger insignia con doble carne, tocino y aderezo especial.', 165.00, '', true, 0) RETURNING id INTO v_prod_doble;

    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Crispy Chicken', 'Pechuga de pollo empanizada extracrujiente, lechuga y mayonesa chipotle.', 135.00, '', true, 1) RETURNING id INTO v_prod_chicken;

    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'La Veggie-Terminal', 'Medallón de garbanzo y avena, queso suizo, espinaca y tomate.', 125.00, '', true, 2) RETURNING id INTO v_prod_veggie;

    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Papas Terminal con Queso', '300g de papas de la casa bañadas en aderezo de queso cheddar fundido.', 75.00, '', true, 0) RETURNING id INTO v_prod_papas;

    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Alitas Crujientes (10 pzas)', '10 Alitas de pollo fritas a la perfección. Elige tus salsas.', 140.00, '', true, 1) RETURNING id INTO v_prod_alitas;

    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Refresco de Lata 355ml', 'Variedad de sabores de la familia Coca-Cola.', 30.00, '', true, 0) RETURNING id INTO v_prod_coca;

    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Cerveza Nacional 355ml', 'Corona, Victoria o Pacífico. Bien fría.', 45.00, '', true, 1) RETURNING id INTO v_prod_cerveza;

    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Combo Master Terminal', 'Una Burger Doble + Papas Individuales + Refresco a elegir.', 230.00, '', true, 0) RETURNING id INTO v_prod_combo_master;


    -- 7. VINCULACIÓN PRODUCTOS <-> SECCIONES
    -- Hamburguesas
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_prod_doble, v_sec_burgers);
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_prod_chicken, v_sec_burgers);
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_prod_veggie, v_sec_burgers);
    
    -- Entradas
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_prod_papas, v_sec_entradas);
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_prod_alitas, v_sec_entradas);
    
    -- Bebidas
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_prod_coca, v_sec_bebidas);
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_prod_cerveza, v_sec_bebidas);
    
    -- Combos
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_prod_combo_master, v_sec_combos);

    -- Ejemplo de Multi-Sección: Las papas también aparecen en la sección de Hamburguesas
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_prod_papas, v_sec_burgers);


    -- 8. VINCULACIÓN PRODUCTOS <-> GRUPOS DE MODIFICADORES
    -- A las Burgers de Res les aplica: Término y Extras
    INSERT INTO public.product_modifiers (product_id, modifier_group_id) VALUES (v_prod_doble, v_grp_termino);
    INSERT INTO public.product_modifiers (product_id, modifier_group_id) VALUES (v_prod_doble, v_grp_extras);
    
    -- A las Burgers de Pollo y Veggie solo les aplica: Extras
    INSERT INTO public.product_modifiers (product_id, modifier_group_id) VALUES (v_prod_chicken, v_grp_extras);
    INSERT INTO public.product_modifiers (product_id, modifier_group_id) VALUES (v_prod_veggie, v_grp_extras);
    
    -- A las Alitas les aplica: El grupo de salsas
    INSERT INTO public.product_modifiers (product_id, modifier_group_id) VALUES (v_prod_alitas, v_grp_salsas);
    
    -- Al Combo Master le aplica: Escoger bebida y también los términos/extras de la burger que incluye
    INSERT INTO public.product_modifiers (product_id, modifier_group_id) VALUES (v_prod_combo_master, v_grp_refrescos);
    INSERT INTO public.product_modifiers (product_id, modifier_group_id) VALUES (v_prod_combo_master, v_grp_termino);


    -- 9. GRUPOS DE VENTA CRUZADA (NUEVO)
    
    -- ====== A) EN LA TERMINAL DOBLE ======
    -- Sugerir Guarniciones (Formato Grid)
    INSERT INTO public.product_cross_sell_groups (origin_product_id, name, position, is_available, visualization_type)
    VALUES (v_prod_doble, 'Acompáñala con:', 0, true, 'grid') RETURNING id INTO v_cs_grupo;

    INSERT INTO public.product_cross_sell_items (group_id, suggested_product_id, override_price, position) VALUES 
        (v_cs_grupo, v_prod_papas, 65.00, 0),       -- Descuento de $75 a $65
        (v_cs_grupo, v_prod_alitas, NULL, 1);      -- Precio normal

    -- Sugerir Bebidas Alcohólicas (Formato Lista)
    INSERT INTO public.product_cross_sell_groups (origin_product_id, name, position, is_available, visualization_type)
    VALUES (v_prod_doble, 'Para quitar la sed', 1, true, 'list') RETURNING id INTO v_cs_grupo;

    INSERT INTO public.product_cross_sell_items (group_id, suggested_product_id, override_price, position) VALUES 
        (v_cs_grupo, v_prod_cerveza, 40.00, 0);    -- Descuento de $45 a $40


    -- ====== B) EN EL CRISPY CHICKEN ======
    -- Sugerir Papas (Formato Lista)
    INSERT INTO public.product_cross_sell_groups (origin_product_id, name, position, is_available, visualization_type)
    VALUES (v_prod_chicken, '¿Le sumamos unas papas?', 0, true, 'list') RETURNING id INTO v_cs_grupo;

    INSERT INTO public.product_cross_sell_items (group_id, suggested_product_id, override_price, position) VALUES 
        (v_cs_grupo, v_prod_papas, 60.00, 0);      -- Descuento mayor en este amarre ($60)


    -- ====== C) EN LAS PAPAS CON QUESO ======
    -- Sugerir Refresco en formato Grid
    INSERT INTO public.product_cross_sell_groups (origin_product_id, name, position, is_available, visualization_type)
    VALUES (v_prod_papas, 'Se ven solas... ¿un refresco?', 0, true, 'grid') RETURNING id INTO v_cs_grupo;

    INSERT INTO public.product_cross_sell_items (group_id, suggested_product_id, override_price, position) VALUES 
        (v_cs_grupo, v_prod_coca, 25.00, 0);       -- Descuento de $30 a $25


    -- ====== D) EN EL COMBO MASTER TERMINAL ======
    -- Sugerir una Entrada extra para compartir (Formato Lista)
    INSERT INTO public.product_cross_sell_groups (origin_product_id, name, position, is_available, visualization_type)
    VALUES (v_prod_combo_master, '¿Vienes con alguien?', 0, true, 'list') RETURNING id INTO v_cs_grupo;

    INSERT INTO public.product_cross_sell_items (group_id, suggested_product_id, override_price, position) VALUES 
        (v_cs_grupo, v_prod_alitas, 120.00, 0);    -- Descuento de $140 a $120

END $$;