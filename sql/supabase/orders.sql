drop table if exists public.orders cascade;

CREATE TABLE public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) NOT NULL,
    client_id UUID REFERENCES auth.users(id) NOT NULL,
    driver_id UUID REFERENCES auth.users(id), -- Nullable hasta que un repartidor lo tome
    
    -- Dirección congelada en el tiempo
    address_id UUID REFERENCES public.user_addresses(id) ON DELETE SET NULL, 
    delivery_address_text TEXT NOT NULL, 
    delivery_location JSONB NOT NULL, -- {lat: x, lng: y}
    
    -- Costos y Totales
    subtotal DECIMAL(10, 2) NOT NULL,
    delivery_cost DECIMAL(10, 2) NOT NULL,
    platform_fee DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    
    -- Flujo de estados
    status TEXT DEFAULT 'pending' NOT NULL, -- 'pending', 'accepted', 'preparing', 'on_the_way', 'delivered', 'cancelled'
    notes TEXT, -- Comentarios del cliente para el restaurante o repartidor
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- El tiempo real aquí es CLAVE para que al cliente le cambie el estado de su orden sin recargar
alter publication supabase_realtime add table orders;

-- 1. Obligatorio: Habilitar RLS en la tabla
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 2. POLÍTICAS PARA EL CLIENTE 🛍️

-- Permitir a los clientes ver únicamente sus propios pedidos
CREATE POLICY "Clientes pueden ver sus propias ordenes" 
ON public.orders FOR SELECT 
USING (auth.uid() = client_id);

-- Permitir a los clientes crear órdenes (siempre y cuando se registren ellos mismos como clientes)
CREATE POLICY "Clientes pueden crear sus propias ordenes" 
ON public.orders FOR INSERT 
WITH CHECK (auth.uid() = client_id);


-- 3. POLÍTICAS PARA EL NEGOCIO 🍳

-- Permitir a los negocios ver las órdenes que se hicieron para su negocio
-- (Validamos que el usuario autenticado sea el 'ownerId' de la tabla businesses)
CREATE POLICY "Negocios pueden ver las ordenes que reciben" 
ON public.orders FOR SELECT 
USING (
    auth.uid() IN (
        SELECT "ownerId" FROM public.businesses WHERE id = orders.business_id
    )
);

-- Permitir a los negocios actualizar el estado de la orden (ej: de pending a preparing)
CREATE POLICY "Negocios pueden actualizar el estado de la orden" 
ON public.orders FOR UPDATE
USING (
    auth.uid() IN (
        SELECT "ownerId" FROM public.businesses WHERE id = orders.business_id
    )
)
WITH CHECK (
    auth.uid() IN (
        SELECT "ownerId" FROM public.businesses WHERE id = orders.business_id
    )
);


-- 4. POLÍTICAS PARA EL REPARTIDOR 🚴

-- Permitir a los repartidores ver las órdenes que tienen asignadas
CREATE POLICY "Repartidores pueden ver las ordenes asignadas" 
ON public.orders FOR SELECT 
USING (auth.uid() = driver_id);

-- Permitir a los repartidores actualizar la orden cuando la toman o la entregan
CREATE POLICY "Repartidores pueden actualizar ordenes que toman" 
ON public.orders FOR UPDATE
USING (auth.uid() = driver_id OR driver_id IS NULL)
WITH CHECK (auth.uid() = driver_id);