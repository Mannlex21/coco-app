-- 1. Borramos la tabla actual por si ya tenía datos de prueba viejos
drop table if exists public.users cascade;

-- 2. Creamos la tabla con TODO el mapeo de tu interfaz TypeScript (CamelCase)
create table public.users (
  -- Identificadores (Vinculado a la autenticación de Supabase)
  "id" uuid references auth.users(id) on delete cascade primary key,

  -- Información Básica y de Contacto
  "name" text not null,
  "phone" text,
  "email" text not null unique,

  -- Roles y Permisos
  "role" text default 'client', -- 'client', 'business', 'driver', etc.
  "status" text default 'active', -- 'active', 'inactive', 'suspended'

  -- Identidad Visual y Sesión
  "avatarUrl" text,
  "lastActiveBusinessId" text, -- Guarda el ID del último negocio que gestionó o visitó

  -- Notificaciones Push
  "fcmToken" text,

  -- Metadatos y Sistema
  "createdAt" timestamp with time zone default now(),
  "updatedAt" timestamp with time zone default now()
);

-- 3. Habilitar el tiempo real en Supabase para esta tabla
alter publication supabase_realtime add table users;

-- 4. Forzar a PostgREST a recargar el mapa de columnas inmediatamente
notify pgrst, 'reload schema';