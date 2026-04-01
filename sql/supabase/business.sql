-- 1. Borramos la tabla actual por si ya tenía datos de prueba viejos
drop table if exists public.businesses cascade;

-- 2. Creamos la tabla con TODO el mapeo de tu interfaz TypeScript (CamelCase)
create table public.businesses (
  -- Identificadores
  "id" uuid default gen_random_uuid() primary key,
  "ownerId" uuid references auth.users(id) on delete cascade not null,

  -- Información Básica
  "name" text not null,
  "description" text,
  "category" text default 'food', -- 'food', 'market', etc.

  -- Contacto y Ubicación
  "address" text not null,
  "location" jsonb, -- Guardará el objeto {lat: x, lng: y}
  "phone" text not null,

  -- Identidad Visual
  "logoUrl" text,
  "coverUrl" text,

  -- Estado Operativo
  "isOpen" boolean default false,

  -- Configuración de Logística
  "deliveryCost" numeric default 20.0,
  "ownDriverIds" text[] default '{}',

  -- Modelo de Negocio y Monetización
  "plan" text default 'free', -- 'free', 'basic', 'premium'
  "platformFee" numeric default 0.0,
  "weeklyDebt" numeric default 0.0,

  -- Control de Pagos
  "lastPaymentDate" timestamp with time zone,
  "paymentDeadline" timestamp with time zone,

  -- Metadatos y Sistema
  "status" text default 'pending_approval', -- 'pending_approval', 'active', 'suspended'
  "rating" numeric default 0.0,
  "totalOrders" integer default 0,
  "createdAt" timestamp with time zone default now(),
  "updatedAt" timestamp with time zone default now()
);

-- 3. Habilitar el tiempo real en Supabase para esta tabla
alter publication supabase_realtime add table businesses;

-- 4. Forzar a PostgREST a recargar el mapa de columnas inmediatamente
notify pgrst, 'reload schema';