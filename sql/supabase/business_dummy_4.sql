-- ==========================================================
-- SCRIPT DE DATOS REALISTAS: PIZZERÍA (ESTRUCTURAS COMPLEJAS)
-- ==========================================================

DO $$ 
DECLARE
    v_owner_id UUID := '56baf86b-c7a8-4f69-97dc-d3dfe6624bf4';
    v_business_id UUID;
    
    -- Secciones
    v_sec_pizzas UUID;
    v_sec_pastas UUID;
    v_sec_entradas UUID;
    v_sec_ensaladas UUID;
    v_sec_postres UUID;
    v_sec_bebidas UUID;
    
    -- Grupos de Modificadores
    v_grp_tamano UUID;
    v_grp_orilla UUID;
    v_grp_toppings UUID;
    v_grp_aderezos UUID;
    
    -- Productos (16 en total)
    v_p_pep UUID; v_p_margherita UUID; v_p_suprema UUID; v_p_hawaiian UUID; v_p_4quesos UUID;
    v_p_lasagna UUID; v_p_fettuccine UUID;
    v_p_garlic_bread UUID; v_p_boneless UUID; v_p_papas UUID;
    v_p_cesar UUID; v_p_caprese UUID;
    v_p_tiramisu UUID; v_p_brownie UUID;
    v_p_coca UUID; v_p_vino UUID;
BEGIN

    -- 1. INSERTAR NEGOCIO
    INSERT INTO public.businesses (
        "ownerId", "name", "description", "category", "address", "phone", 
        "logoUrl", "coverUrl", "isOpen", "deliveryCost", "plan", "status", "rating"
    ) VALUES (
        v_owner_id, 
        'Pizzería Bella Vista', 
        'Auténtica pizza italiana a la leña, pastas caseras y postres tradicionales.', 
        'food', 
        'Calzada de los Leones #142, Col. Alpes', 
        '5554443322', 
        'https://placehold.co/400x400/1A7D78/FFFFFF?text=Pizza+Logo', 
        'https://placehold.co/1200x600/1E1E1E/FFFFFF?text=Pizza+Cover', 
        true, 
        30.00, 
        'premium', 
        'active', 
        4.6
    ) RETURNING id INTO v_business_id;


    -- 2. HORARIOS (Abierto para comidas y cenas)
    INSERT INTO public.business_hours (business_id, day_of_week, open_time, close_time, is_closed)
    VALUES 
        (v_business_id, 0, '13:00:00', '23:00:00', false),
        (v_business_id, 1, '13:00:00', '22:00:00', false),
        (v_business_id, 2, '13:00:00', '22:00:00', false),
        (v_business_id, 3, '13:00:00', '22:00:00', false),
        (v_business_id, 4, '13:00:00', '23:30:00', false),
        (v_business_id, 5, '12:00:00', '00:00:00', false),
        (v_business_id, 6, '12:00:00', '00:00:00', false);


    -- 3. SECCIONES DEL MENÚ (6 Secciones)
    INSERT INTO public.sections (business_id, name, description, position, is_available)
    VALUES (v_business_id, 'Pizzas Especiales', 'Horneadas al momento con masa madre.', 0, true) RETURNING id INTO v_sec_pizzas;

    INSERT INTO public.sections (business_id, name, description, position, is_available)
    VALUES (v_business_id, 'Pastas Caseras', 'Recetas tradicionales con pasta fresca.', 1, true) RETURNING id INTO v_sec_pastas;

    INSERT INTO public.sections (business_id, name, description, position, is_available)
    VALUES (v_business_id, 'Entradas', 'Para abrir el apetito.', 2, true) RETURNING id INTO v_sec_entradas;

    INSERT INTO public.sections (business_id, name, description, position, is_available)
    VALUES (v_business_id, 'Ensaladas', 'Frescas y ligeras.', 3, true) RETURNING id INTO v_sec_ensaladas;

    INSERT INTO public.sections (business_id, name, description, position, is_available)
    VALUES (v_business_id, 'Postres', 'El final perfecto.', 4, true) RETURNING id INTO v_sec_postres;

    INSERT INTO public.sections (business_id, name, description, position, is_available)
    VALUES (v_business_id, 'Bebidas', 'Refrescos, aguas y licores.', 5, true) RETURNING id INTO v_sec_bebidas;


    -- 4. GRUPOS DE MODIFICADORES
    -- Obligatorio: Tamaño (min 1, max 1)
    INSERT INTO public.modifier_groups (business_id, name, internal_name, min_selectable, max_selectable, is_available)
    VALUES (v_business_id, 'Tamaño de la Pizza', 'tamano_pizza', 1, 1, true) RETURNING id INTO v_grp_tamano;

    -- Opcional: Tipo de Orilla (min 0, max 1)
    INSERT INTO public.modifier_groups (business_id, name, internal_name, min_selectable, max_selectable, is_available)
    VALUES (v_business_id, 'Borde u Orilla', 'orilla_pizza', 0, 1, true) RETURNING id INTO v_grp_orilla;

    -- Opcional Múltiple: Toppings Extra (min 0, max 8) - Ideal para probar listas largas
    INSERT INTO public.modifier_groups (business_id, name, internal_name, min_selectable, max_selectable, is_available)
    VALUES (v_business_id, 'Ingredientes Extra', 'toppings_pizza', 0, 8, true) RETURNING id INTO v_grp_toppings;

    -- Opcional Múltiple: Aderezos (min 0, max 3)
    INSERT INTO public.modifier_groups (business_id, name, internal_name, min_selectable, max_selectable, is_available)
    VALUES (v_business_id, 'Aderezos para acompañar', 'aderezos_extras', 0, 3, true) RETURNING id INTO v_grp_aderezos;


    -- 5. OPCIONES DE MODIFICADORES
    -- Tamaños
    INSERT INTO public.modifier_options (modifier_group_id, name, extra_price, is_available) VALUES 
        (v_grp_tamano, 'Mediana (30cm)', 0.00, true),
        (v_grp_tamano, 'Grande (40cm)', 60.00, true),
        (v_grp_tamano, 'Familiar (45cm)', 110.00, true);

    -- Orillas
    INSERT INTO public.modifier_options (modifier_group_id, name, extra_price, is_available) VALUES 
        (v_grp_orilla, 'Orilla rellena de queso Mozzarella', 35.00, true),
        (v_grp_orilla, 'Orilla cubierta de ajonjolí y mantequilla', 15.00, true);

    -- Toppings (Bastantes opciones para estresar la UI)
    INSERT INTO public.modifier_options (modifier_group_id, name, extra_price, is_available) VALUES 
        (v_grp_toppings, 'Pepperoni Extra', 25.00, true),
        (v_grp_toppings, 'Champiñones Frescos', 20.00, true),
        (v_grp_toppings, 'Pimiento Verde', 15.00, true),
        (v_grp_toppings, 'Cebolla Morada', 15.00, true),
        (v_grp_toppings, 'Jamón de Pavo', 20.00, true),
        (v_grp_toppings, 'Piña en almíbar', 15.00, true),
        (v_grp_toppings, 'Tocino Ahumado', 25.00, true),
        (v_grp_toppings, 'Aceitunas Negras', 20.00, true);

    -- Aderezos
    INSERT INTO public.modifier_options (modifier_group_id, name, extra_price, is_available) VALUES 
        (v_grp_aderezos, 'Aderezo Ranch (Hecho en casa)', 15.00, true),
        (v_grp_aderezos, 'Salsa Chimichurri', 15.00, true),
        (v_grp_aderezos, 'Salsa de ajo rostizado', 15.00, true);


    -- 6. PRODUCTOS (16 Productos)
    
    -- Sección: Pizzas (5)
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Pizza Pepperoni Clásica', 'Salsa de tomate, mozzarella y abundante pepperoni.', 180.00, 'https://placehold.co/600x400/1A7D78/FFFFFF?text=Pizza+Pepperoni', true, 0) RETURNING id INTO v_p_pep;
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Pizza Margherita', 'Salsa de tomate, mozzarella fresca, albahaca y aceite de oliva.', 170.00, 'https://placehold.co/600x400/1A7D78/FFFFFF?text=Pizza+Margherita', true, 1) RETURNING id INTO v_p_margherita;
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Pizza Suprema Bella Vista', 'Pepperoni, jamón, champiñones, pimientos y cebolla morada.', 230.00, 'https://placehold.co/600x400/1A7D78/FFFFFF?text=Pizza+Suprema', true, 2) RETURNING id INTO v_p_suprema;
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Pizza Hawaiana Especial', 'La clásica combinación de jamón y piña con extra queso.', 185.00, 'https://placehold.co/600x400/1A7D78/FFFFFF?text=Pizza+Hawaiana', true, 3) RETURNING id INTO v_p_hawaiian;
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Pizza Cuatro Quesos', 'Mozzarella, gorgonzola, parmesano y provolone.', 210.00, 'https://placehold.co/600x400/1A7D78/FFFFFF?text=Pizza+4+Quesos', true, 4) RETURNING id INTO v_p_4quesos;

    -- Sección: Pastas (2)
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Lasagna Boloñesa', 'Capas de pasta con salsa de carne, bechamel y queso gratinado.', 155.00, 'https://placehold.co/600x400/1A7D78/FFFFFF?text=Lasagna', true, 0) RETURNING id INTO v_p_lasagna;
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Fettuccine Alfredo', 'Salsa cremosa a base de mantequilla y queso parmesano.', 140.00, 'https://placehold.co/600x400/1A7D78/FFFFFF?text=Fettuccine', true, 1) RETURNING id INTO v_p_fettuccine;

    -- Sección: Entradas (3)
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Pan de Ajo con Queso', 'Pan artesanal horneado con mantequilla de ajo y mozzarella.', 65.00, 'https://placehold.co/600x400/1A7D78/FFFFFF?text=Pan+de+Ajo', true, 0) RETURNING id INTO v_p_garlic_bread;
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Boneless de Pollo (350g)', 'Bañados en salsa BBQ o Buffalo. Acompañados de aderezo ranch.', 130.00, 'https://placehold.co/600x400/1A7D78/FFFFFF?text=Boneless', true, 1) RETURNING id INTO v_p_boneless;
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Papas Gajo Sazonadas', '250g de papas gajo crujientes con especias italianas.', 60.00, 'https://placehold.co/600x400/1A7D78/FFFFFF?text=Papas+Gajo', true, 2) RETURNING id INTO v_p_papas;

    -- Sección: Ensaladas (2)
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Ensalada César', 'Lechuga orejona, crotones, parmesano y aderezo César.', 95.00, 'https://placehold.co/600x400/1A7D78/FFFFFF?text=Ensalada+Cesar', true, 0) RETURNING id INTO v_p_cesar;
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Ensalada Caprese', 'Rodajas de jitomate, mozzarella fresca, albahaca y reducción balsámica.', 110.00, 'https://placehold.co/600x400/1A7D78/FFFFFF?text=Ensalada+Caprese', true, 1) RETURNING id INTO v_p_caprese;

    -- Sección: Postres (2)
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Tiramisú Clásico', 'Postre italiano frío con café, mascarpone y cocoa.', 75.00, 'https://placehold.co/600x400/1A7D78/FFFFFF?text=Tiramisu', true, 0) RETURNING id INTO v_p_tiramisu;
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Brownie con Helado', 'Brownie tibio de chocolate con una bola de helado de vainilla.', 70.00, 'https://placehold.co/600x400/1A7D78/FFFFFF?text=Brownie', true, 1) RETURNING id INTO v_p_brownie;

    -- Sección: Bebidas (2)
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Coca-Cola Original 600ml', 'Para refrescar tu comida.', 35.00, 'https://placehold.co/600x400/1A7D78/FFFFFF?text=Soda', true, 0) RETURNING id INTO v_p_coca;
    INSERT INTO public.products (business_id, name, description, price, image_url, is_available, position) VALUES 
        (v_business_id, 'Copa de Vino Tinto Casa', 'Vino de la casa para maridar tu pasta o pizza.', 90.00, 'https://placehold.co/600x400/1A7D78/FFFFFF?text=Vino+Tinto', true, 1) RETURNING id INTO v_p_vino;


    -- 7. VINCULACIÓN PRODUCTOS <-> SECCIONES (Soporta N:N)
    -- Pizzas
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_pep, v_sec_pizzas);
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_margherita, v_sec_pizzas);
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_suprema, v_sec_pizzas);
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_hawaiian, v_sec_pizzas);
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_4quesos, v_sec_pizzas);
    
    -- Pastas
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_lasagna, v_sec_pastas);
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_fettuccine, v_sec_pastas);
    
    -- Entradas
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_garlic_bread, v_sec_entradas);
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_boneless, v_sec_entradas);
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_papas, v_sec_entradas);
    
    -- Ensaladas
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_cesar, v_sec_ensaladas);
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_caprese, v_sec_ensaladas);
    
    -- Postres
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_tiramisu, v_sec_postres);
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_brownie, v_sec_postres);
    
    -- Bebidas
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_coca, v_sec_bebidas);
    INSERT INTO public.product_sections (product_id, section_id) VALUES (v_p_vino, v_sec_bebidas);


    -- 8. VINCULACIÓN PRODUCTOS <-> GRUPOS DE MODIFICADORES
    -- A todas las pizzas les aplica: Tamaño, Orilla, Toppings y Aderezos
    INSERT INTO public.product_modifiers (product_id, modifier_group_id) 
    SELECT p.id, m.id 
    FROM public.products p, public.modifier_groups m
    WHERE p.id IN (v_p_pep, v_p_margherita, v_p_suprema, v_p_hawaiian, v_p_4quesos)
      AND m.id IN (v_grp_tamano, v_grp_orilla, v_grp_toppings, v_grp_aderezos);

    -- A las entradas (específicamente Boneless y Papas) les aplican los aderezos
    INSERT INTO public.product_modifiers (product_id, modifier_group_id) VALUES (v_p_boneless, v_grp_aderezos);
    INSERT INTO public.product_modifiers (product_id, modifier_group_id) VALUES (v_p_papas, v_grp_aderezos);

END $$;