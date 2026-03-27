# Coco — Documentación del Proyecto

> Última actualización: Marzo 2026  
> Estado: Diseño y arquitectura definidos. Scaffolding iniciado. Pendiente de desarrollo.

---

## Índice

1. [Resumen del Proyecto](#1-resumen-del-proyecto)
2. [Contexto del Negocio](#2-contexto-del-negocio)
3. [Actores del Sistema](#3-actores-del-sistema)
4. [Modos de la App](#4-modos-de-la-app)
5. [Modelo de Negocio y Monetización](#5-modelo-de-negocio-y-monetización)
6. [Reglas del Sistema](#6-reglas-del-sistema)
7. [Flujo Completo de un Pedido](#7-flujo-completo-de-un-pedido)
8. [Modelo de Cuentas y Autenticación](#8-modelo-de-cuentas-y-autenticación)
9. [Modelo de Datos](#9-modelo-de-datos)
10. [Arquitectura Técnica](#10-arquitectura-técnica)
11. [Identidad Visual](#11-identidad-visual)
12. [Roadmap](#12-roadmap)
13. [Decisiones Técnicas Registradas](#13-decisiones-técnicas-registradas)

---

## 1. Resumen del Proyecto

**Coco** es una plataforma de delivery e-commerce local para pueblos pequeños de México, iniciando en Tuxpan, Nayarit (30,000 habitantes). Digitaliza y formaliza el concepto informal de los "mandaditos" conectando tres partes: clientes, negocios locales y repartidores.

La plataforma se compone de **3 apps móviles independientes**, una por rol, publicadas en Google Play Store bajo una misma cuenta de desarrollador.

### Visión a futuro
Expandirse a otros pueblos similares de México con la misma infraestructura. El nombre "Coco" fue elegido precisamente por ser evocador del ambiente costero sin estar atado a ningún pueblo específico.

---

## 2. Contexto del Negocio

| Campo | Detalle |
|---|---|
| **Ciudad inicial** | Tuxpan, Nayarit, México |
| **Habitantes** | ~30,000 |
| **Problema** | No existe app de delivery. Los "mandaditos" son informales y desorganizados |
| **Solución** | App que conecta clientes con negocios y repartidores de forma estructurada |
| **Competencia directa** | Ninguna en el mercado local |
| **Desarrollador** | 1 solo desarrollador (founder) |
| **Tipo de negocios** | Cualquier negocio local: comida, farmacia, abarrotes, panadería, etc. |

---

## 3. Actores del Sistema

### 3.1 Cliente
- Hace pedidos a negocios locales (Modo 1)
- Solicita mandaditos sin negocio de por medio (Modo 2 — Fase 2)
- Paga en efectivo al recibir su pedido
- Tendrá estado financiero cuando se implementen pagos digitales

### 3.2 Negocio
- Cualquier negocio local registrado en la plataforma
- Define el costo de envío que ve el cliente
- Gestiona su catálogo de productos
- Acepta o rechaza pedidos entrantes
- Puede registrar repartidores propios (empleados)
- Puede asignar pedidos a repartidores independientes disponibles
- Liquida fee semanal a la plataforma por SPEI

### 3.3 Repartidor del Negocio
- Registrado directamente por el negocio en la app
- Solo recibe pedidos de ese negocio
- Su sueldo es un acuerdo privado con el negocio, **completamente fuera de la app**
- No paga ningún fee a la plataforma
- Puede llevar múltiples pedidos simultáneos

### 3.4 Repartidor Independiente
- Se registra por sí mismo en la app de repartidores
- Ve los pedidos disponibles con la tarifa del negocio visible **antes** de aceptar
- Acepta o rechaza pedidos libremente
- Negocia su pago directamente con el negocio fuera de la app
- La app establece tarifas mínimas por tipo de servicio que el negocio no puede bajar
- En MVP: máximo 1 pedido activo a la vez
- En futuro: múltiples pedidos ordenados del más cercano al más lejano
- Paga fee fijo a la plataforma por cada entrega completada
- Liquida semanalmente subiendo comprobante de pago (foto)
- Verificado por número de celular (1 número = 1 cuenta, sin duplicados)

---

## 4. Modos de la App

### Modo 1 — Pedido a Negocio *(Fase 1)*
El cliente navega negocios, selecciona productos, hace un pedido. El negocio lo acepta y asigna un repartidor (propio o independiente).

```
Cliente → elige negocio → selecciona productos → hace pedido
→ negocio acepta → asigna repartidor → repartidor recoge y entrega
→ cliente paga en efectivo al repartidor al recibir
```

### Modo 2 — Mandadito *(Fase 2)*
El cliente describe libremente lo que necesita, sin que exista un negocio en la fórmula. Un repartidor independiente acepta el encargo.

```
Cliente → describe el mandado → define método de pago
→ repartidor independiente acepta viendo la tarifa
→ ejecuta el mandado → entrega
→ cliente paga en efectivo al recibir
```

**Tipos de mandadito:**
- `simple` — recoger/entregar algo sin espera (tarifa mínima: $25 MXN)
- `with_wait` — incluye tiempo de espera, ej. banco, trámite (tarifa mínima: $50 MXN)
- `document` — entrega de documentos (tarifa mínima: $30 MXN)

**Métodos de pago en mandaditos (efectivo):**
- `driver_advances` — el repartidor pone el dinero y el cliente le paga todo al recibir
- `driver_picks_up` — el repartidor pasa primero por el dinero y luego ejecuta el mandado

---

## 5. Modelo de Negocio y Monetización

### 5.1 Fuentes de ingreso

| Fuente | Monto | Cobrado a | Método de cobro |
|---|---|---|---|
| Fee por pedido | ~$4 MXN por pedido entregado | Negocio | Liquidación semanal por SPEI |
| Fee por entrega | ~$2 MXN por entrega completada | Repartidor independiente | Liquidación semanal por SPEI |

> Los montos exactos se configuran globalmente en la app y pueden ajustarse sin cambiar código.

### 5.2 El negocio NO paga fee por los repartidores que él mismo registra (empleados). Solo paga el fee del pedido.

### 5.3 Estrategia de lanzamiento

```
Meses 1–3   →  Todo gratuito. Objetivo: masa crítica de negocios y usuarios.
Mes 4       →  Comunicar que se activarán cobros el siguiente mes.
Mes 5+      →  Activar fees por pedido y por entrega.
Futuro      →  MercadoPago para automatizar liquidaciones.
             →  Plan premium para negocios (estadísticas, prioridad en listado).
```

### 5.4 Proyección de ingresos

| Escenario | Pedidos/día | Fee negocio | Fee repartidor | Total mensual |
|---|---|---|---|---|
| Arranque | 20 | $4 | $2 | ~$1,800 MXN |
| Tracción | 60 | $4 | $2 | ~$5,400 MXN |
| Madurez | 150 | $4 | $2 | ~$13,500 MXN |

### 5.5 Pagos

- **MVP**: Solo efectivo al entregar. El cliente paga al repartidor en mano.
- **Futuro Fase 4**: MercadoPago (acepta OXXO, tarjetas, transferencias). Elegido por ser el más conocido y confiable para usuarios en pueblos de México.

---

## 6. Reglas del Sistema

### 6.1 Negocios

- Si no liquidan su fee en **7 días** → cuenta suspendida automáticamente
- Una cuenta suspendida desaparece del listado de clientes
- Pueden registrar repartidores propios (empleados) sin costo adicional
- Definen el costo de envío que se muestra al cliente
- No pueden ofrecer a repartidores independientes menos del mínimo establecido por la plataforma

### 6.2 Repartidores independientes

- **1 número de celular = 1 cuenta**. Firebase Auth con OTP previene duplicados
- Si no liquidan su fee en **7 días** → cuenta suspendida automáticamente
- Verificación de pago: suben foto del comprobante en la app → el admin aprueba manualmente (en MVP)
- En futuro: el pago se hará directo desde la app (MercadoPago)
- **MVP**: máximo 1 pedido activo simultáneo (`maxActiveOrders: 1`)
- **Futuro**: posibilidad de 2+ pedidos. Cuando se habilite, los pedidos se ordenan del destino más cercano al más lejano usando la Directions API de Mapbox con waypoints
- No puede cerrar sesión si tiene una entrega activa en curso

### 6.3 Suspensión y bloqueo de cuentas

- Si **cualquiera** de las cuentas asociadas al número tiene deuda vencida → las 3 cuentas quedan bloqueadas
- Al intentar iniciar sesión con cualquier app, se muestra pantalla de deuda con opción de subir comprobante
- Una vez aprobado el pago por el admin → desbloqueo inmediato de todas las cuentas

---

## 7. Flujo Completo de un Pedido (Modo 1)

```
1.  Cliente abre app Coco → ve listado de negocios abiertos
2.  Selecciona negocio → navega productos → agrega al carrito
3.  Confirma pedido → ve: subtotal + costo envío + total
4.  Pedido creado en Firestore con status: "pending"
5.  Notificación push al negocio
6.  Negocio acepta → status: "accepted"
7.  Negocio asigna repartidor (propio o independiente disponible)
    → status: "assigned"
    → notificación push al repartidor y al cliente
8.  Repartidor acepta → activa GPS → status: "in_transit"
9.  Cliente ve pantalla de seguimiento:
    MVP  → texto con estados + última ubicación hace X segundos
    v2.0 → mapa en tiempo real con Mapbox
10. Repartidor llega → entrega → confirma entrega en app
    → status: "delivered"
11. Cliente paga en efectivo al repartidor (producto + envío)
12. App registra: fee acumulado al negocio + fee acumulado al repartidor
13. Cada lunes → notificación automática de liquidación semanal
```

---

## 8. Modelo de Cuentas y Autenticación

### 8.1 Estructura de cuentas

Un número de celular puede tener **hasta 3 cuentas independientes**, una por rol:

```
📱 +52 555 123 4567
├── Cuenta Cliente      → app Coco
├── Cuenta Negocio      → app Coco Negocios
└── Cuenta Repartidor   → app Coco Repartidor
```

Cada cuenta es completamente independiente entre sí (diferente perfil, diferente historial). El usuario descarga la app del rol que necesita y se registra con su número.

### 8.2 Autenticación

- Método: **OTP por SMS** (Firebase Auth con número de teléfono)
- 1 número = máximo 1 cuenta por app (Firebase lo previene nativamente)
- Al registrarse se elige el rol y ya no cambia

### 8.3 Cambio entre apps/roles

No existe un "cambio de rol" dentro de una app. Si una persona quiere usar otro rol, descarga la app correspondiente y se registra con el mismo número. Son cuentas separadas.

**Restricción para cerrar sesión:**
- No se puede cerrar sesión si hay una sesión activa con pendientes:
  - Cliente: pedido activo en curso
  - Negocio: pedido aceptado sin repartidor asignado o en preparación
  - Repartidor: entrega activa en curso

### 8.4 Bloqueo por deuda

```
Al iniciar sesión en cualquier app:
  ¿Alguna de las 3 cuentas del número tiene deuda vencida?
  → SÍ: mostrar pantalla de bloqueo con opción de pagar
  → NO: acceso normal
```

---

## 9. Modelo de Datos

### 9.1 Colecciones en Firestore

#### `users/{userId}`
```typescript
{
  id: string
  phone: string              // único por app, verificado OTP
  name: string
  role: 'client' | 'business' | 'driver'
  fcmToken?: string          // para notificaciones push
  status: 'active' | 'suspended' | 'pending_verification'
  avatarUrl?: string
  createdAt: Date
  updatedAt: Date
}
```

#### `businesses/{businessId}`
```typescript
{
  id: string
  ownerId: string            // User.id del dueño
  name: string
  description?: string
  category: 'food' | 'pharmacy' | 'grocery' | 'bakery' | 'other'
  address: string
  location: { lat: number, lng: number }
  phone: string
  logoUrl?: string
  isOpen: boolean
  deliveryCost: number       // costo de envío visible al cliente
  platformFee: number        // fee de la plataforma (default según config global)
  ownDriverIds: string[]     // IDs de repartidores empleados
  plan: 'free' | 'basic' | 'premium'
  weeklyDebt: number         // fee acumulado pendiente
  lastPaymentDate?: Date
  paymentDeadline?: Date
  status: 'active' | 'suspended' | 'pending_approval'
  createdAt: Date
  updatedAt: Date
}
```

#### `products/{productId}`
```typescript
{
  id: string
  businessId: string
  name: string
  description?: string
  price: number
  imageUrl?: string
  isAvailable: boolean
  category?: string          // categoría interna del negocio
  sortOrder?: number
  createdAt: Date
  updatedAt: Date
}
```

#### `orders/{orderId}`
```typescript
{
  id: string
  mode: 'business_delivery' | 'errand'
  status: 'pending' | 'accepted' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled'
  clientId: string
  businessId?: string        // solo Modo 1
  driverId?: string
  driverType?: 'business' | 'independent'

  // Modo 1
  items?: [{
    productId: string
    productName: string      // snapshot del momento del pedido
    productPrice: number     // snapshot del momento del pedido
    quantity: number
    subtotal: number
  }]
  subtotal?: number

  // Modo 2 (Fase 2)
  errandDescription?: string
  errandType?: 'simple' | 'with_wait' | 'document'
  errandPaymentMethod?: 'driver_advances' | 'driver_picks_up'
  errandEstimatedAmount?: number

  // Dirección de entrega
  deliveryAddress: string
  deliveryLocation: { lat: number, lng: number }

  // Costos
  deliveryCost: number               // costo envío al cliente
  driverEarning: number              // lo que gana el repartidor
  platformFeeFromBusiness: number    // fee cobrado al negocio
  platformFeeFromDriver: number      // fee cobrado al repartidor independiente
  total: number                      // subtotal + deliveryCost

  // Pago
  paymentStatus: 'pending' | 'paid'
  driverReceiptUrl?: string          // comprobante del repartidor

  // Cancelación
  cancelledBy?: 'client' | 'business' | 'driver'
  cancellationReason?: string

  createdAt: Date
  updatedAt: Date
  deliveredAt?: Date
}
```

#### `orders/{orderId}/messages/{messageId}` *(subcolección)*
```typescript
{
  id: string
  orderId: string
  senderId: string
  senderRole: 'client' | 'driver' | 'business'
  senderName: string
  text: string
  createdAt: Date
  readAt?: Date
}
```

#### `driverAccounts/{driverId}`
```typescript
{
  driverId: string
  type: 'business' | 'independent'
  businessId?: string               // si es repartidor de negocio
  maxActiveOrders: number           // MVP: 1 | futuro: 2+
  activeOrdersCount: number
  weeklyFeeOwed: number
  lastPaymentDate?: Date
  paymentDeadline?: Date
  receiptImageUrl?: string          // comprobante subido
  status: 'active' | 'pending_payment' | 'suspended'
  createdAt: Date
  updatedAt: Date
}
```

### 9.2 Realtime Database (solo tracking GPS)

```
tracking/{orderId}/
  driverId: string
  orderId: string
  lat: number
  lng: number
  heading?: number           // dirección en grados (para rotar ícono futuro)
  speed?: number             // km/h
  updatedAt: number          // timestamp unix

  // Futuro (múltiples pedidos)
  activeOrderIds?: string[]
  waypoints?: [{
    orderId: string
    lat: number
    lng: number
    distanceMeters: number
    estimatedArrivalMinutes: number
  }]
```

### 9.3 Constantes globales configurables

```typescript
PLATFORM_FEE_BUSINESS = 4        // MXN por pedido al negocio
PLATFORM_FEE_DRIVER = 2          // MXN por entrega al repartidor independiente
WEEKLY_DEADLINE_DAYS = 7         // días para liquidar antes de suspensión
DRIVER_MAX_ACTIVE_ORDERS = 1     // MVP, cambiar a 2+ en el futuro

MINIMUM_DRIVER_EARNINGS = {
  simple: 25,
  with_wait: 50,
  document: 30,
}
```

---

## 10. Arquitectura Técnica

### 10.1 Resumen del Stack

| Capa | Tecnología | Justificación |
|---|---|---|
| App móvil | React Native + Expo | El dev conoce React. iOS + Android desde un código |
| Base de datos | Firebase Firestore | Tiempo real nativo, gratis en arranque, fácil auth |
| GPS en tiempo real | Firebase Realtime DB | Más rápido que Firestore para actualizaciones frecuentes |
| Autenticación | Firebase Auth (OTP SMS) | Gratis, previene cuentas duplicadas por número |
| Notificaciones push | Firebase Cloud Messaging | Gratis, integrado con Expo |
| Almacenamiento | Firebase Storage | Imágenes de productos y comprobantes de pago |
| Mapas (MVP) | Solo texto de estado | Evitar complejidad en MVP |
| Mapas (Fase 2) | Mapbox | Free tier generoso, mejor precio que Google Maps a escala |
| Pagos (Fase 4) | MercadoPago | Acepta OXXO, tarjetas, SPEI. Más confiable en México |
| Estado global | Zustand | Ligero, sin boilerplate |
| Formularios | React Hook Form + Zod | Validación robusta con TypeScript |

### 10.2 Organización del Repositorio

Monorepo simplificado (sin Turborepo ni Nx, solo paths relativos TypeScript):

```
coco-monorepo/
├── shared/                          ← código compartido entre las 3 apps
│   ├── core/
│   │   ├── entities/                ← User, Business, Product, Order, Driver, Message
│   │   └── repositories/           ← interfaces (contratos agnósticos a Firebase)
│   ├── infrastructure/
│   │   └── firebase/               ← implementaciones concretas de Firebase
│   │       ├── config.ts
│   │       ├── FirebaseAuthRepository.ts
│   │       ├── FirebaseOrderRepository.ts
│   │       ├── FirebaseTrackingRepository.ts
│   │       └── FirebaseChatRepository.ts
│   ├── hooks/                       ← useAuth, useOrders, useTracking, useChat
│   ├── constants/                   ← fees, colecciones, rutas RTDB
│   └── config/
│       └── theme.ts                 ← colores, tipografía, espaciado
│
├── app-client/                      ← App "Coco" (clientes)
│   ├── app.json                     ← bundle id: com.coco.client
│   └── src/screens/
│
├── app-business/                    ← App "Coco Negocios"
│   ├── app.json                     ← bundle id: com.coco.business
│   └── src/screens/
│
└── app-driver/                      ← App "Coco Repartidor"
    ├── app.json                     ← bundle id: com.coco.driver
    └── src/screens/
```

### 10.3 Patrón Repository (clave para migración futura)

La app nunca llama a Firebase directamente. Todo pasa por interfaces:

```
Pantallas / Componentes
        ↓
    Hooks (useOrders, useAuth, useTracking...)
        ↓
    Interfaces / Contratos (IOrderRepository, IAuthRepository...)
        ↓
    Firebase Adapter  ←── único lugar donde existe Firebase
```

**Cuando se migre a MongoDB u otro backend en el futuro**, solo se reemplaza el Firebase Adapter. Las pantallas y hooks no cambian nada.

### 10.4 Tracking GPS — Arquitectura lista para Mapbox

El hook `useTracking` ya lee de Realtime Database desde el día 1. En MVP muestra texto. Cuando se agregue Mapbox, solo se agrega el componente visual — el hook no cambia:

```typescript
// MVP
<StatusText status={status} />

// Fase 2 — solo se descomenta
// <MapboxMap driverLocation={location} clientLocation={deliveryAddress} />
```

### 10.5 Costos de infraestructura

| Servicio | Plan | Costo mensual |
|---|---|---|
| Firebase (Auth + Firestore + RTDB + Storage + FCM) | Spark (gratis) | $0 |
| Expo (desarrollo y builds) | Free | $0 |
| Mapbox (cuando se implemente) | Free tier (50k cargas/mes) | $0 |
| Google Play Store | $25 USD único pago por cuenta | $25 USD total |
| App Store (si se publica en iOS) | Developer Program | $99 USD/año |
| **Total arranque** | | **$25–$124 USD** |

---

## 11. Identidad Visual

### 11.1 Nombre

**Coco** — evoca el ambiente costero y la cultura de los pueblos de playa de México. No está atado a ninguna ciudad, lo que permite expansión. Nombre fácil de pronunciar, corto y memorable.

### 11.2 Mascota

Un coco con carita (ojos redondos, boca). Es el elemento de identidad central de las 3 apps. Cada app usa la misma mascota con un accesorio diferente que define el rol.

### 11.3 Íconos de las 3 apps

| App | Fondo | Accesorio | Elemento extra |
|---|---|---|---|
| Coco (clientes) | Verde `#1A7A4A` | — | Hojas de palmera arriba |
| Coco Negocios | Naranja `#C45E1A` | Sombrero de chef | Hojas de palmera arriba |
| Coco Repartidor | Azul marino `#0A4A7A` | Casco de moto con visor naranja | — |

Los íconos fueron exportados como SVG editables (resolución 1024×1024, viewBox 96×96).

### 11.4 Paleta de colores

| Nombre | Hex | Uso |
|---|---|---|
| Verde selva | `#1A7A4A` | App cliente, color primario |
| Verde medio | `#27AE60` | Hojas, estados activos |
| Verde claro | `#2ECC71` | Hojas, acentos |
| Naranja coco | `#F4A261` | Coco base (mascota) |
| Naranja interior | `#E76F51` | Coco interior (mascota) |
| Naranja oscuro | `#C45E1A` | App negocios, fondo |
| Azul marino | `#0A4A7A` | App repartidor, fondo |
| Café oscuro | `#2D1B0E` | Ojos del coco |

### 11.5 Tema de la app

- Soporta **modo claro y modo oscuro**
- Fondos cálidos en modo claro (`#F5F3EF`), negros profundos en oscuro (`#141414`)
- Sin colores chillantes, paleta sobria con acentos naturales
- Tipografía: system-ui, sin fuentes externas en MVP

### 11.6 Pantalla de inicio (diseño definido)

Elementos de la pantalla principal de la app cliente:
- Header con mascota + nombre "coco" + botón de notificaciones
- Saludo personalizado + pregunta "¿Qué se te antoja hoy?"
- Barra de búsqueda
- Chips de categorías (Todos, Comida, Farmacia, Abarrotes...)
- Listado de negocios cercanos en tarjetas con imagen, nombre, badge abierto/cerrado y costo de envío
- Barra de navegación inferior: Inicio, Pedidos, Mandaditos, Perfil

---

## 12. Roadmap

### Fase 1 — MVP core (estimado: 4 semanas)
- Auth OTP por SMS con Firebase
- Registro de negocios y catálogo de productos
- Flujo completo de pedido Modo 1 (cliente → negocio → repartidor)
- Notificaciones push con FCM
- Panel básico de negocios
- Seguimiento de pedido por texto (sin mapa)

### Fase 2 — Engagement (estimado: 3 semanas)
- Chat en tiempo real por pedido (Firestore subcolecciones)
- Rastreo GPS en tiempo real (Realtime Database)
- Historial de pedidos
- Panel de liquidaciones semanales (negocio y repartidor)
- Comprobantes de pago (foto desde app)

### Fase 3 — Mandaditos (estimado: 3 semanas)
- Modo 2 completo (mandaditos sin negocio)
- Tipos de mandadito (simple, con espera, documentos)
- Métodos de pago en mandadito
- Suspensión automática por deuda
- Sistema de tarifas mínimas por tipo

### Fase 4 — Monetización digital (estimado: 2 semanas)
- Integración MercadoPago (OXXO + tarjetas + SPEI)
- Cobro automático de suscripciones
- Activación de fees en producción
- Panel de analytics básico para negocios

### Fase 5 — Mapas y optimización (estimado: 2 semanas)
- Integración Mapbox (mapa en tiempo real)
- Rutas optimizadas para repartidor (Directions API)
- Múltiples pedidos simultáneos para repartidores independientes
- Waypoints ordenados por distancia

---

## 13. Decisiones Técnicas Registradas

Esta sección documenta las decisiones importantes y su justificación, para no revisitar debates ya resueltos.

| # | Decisión | Alternativa descartada | Razón |
|---|---|---|---|
| 1 | React Native + Expo | Flutter | El dev ya conoce React |
| 2 | Firebase para MVP | MongoDB + backend propio | Menor tiempo al mercado, sin servidor que mantener |
| 3 | Patrón Repository | Firebase directo en pantallas | Permite migración futura sin refactorización |
| 4 | 3 apps separadas en Play Store | 1 sola app con selector de rol | Mejor UX, cada usuario descarga solo lo que necesita |
| 5 | Monorepo con carpeta shared/ | 3 repositorios independientes | Evita desincronización del modelo de datos |
| 6 | Mapbox | Google Maps | Free tier más generoso, precio más predecible al crecer |
| 7 | MercadoPago | Stripe, Conekta | Más confiable y conocido en pueblos de México, acepta OXXO |
| 8 | OTP por celular | Email + password | Previene duplicados, más natural en México, sin contraseñas |
| 9 | Realtime Database solo para GPS | Firestore para todo | RTDB es más rápido y barato para actualizaciones de posición frecuentes |
| 10 | Fee fijo por pedido (no % ni suscripción) | Suscripción mensual al negocio | Escala con el volumen, no tiene techo fijo como la suscripción |
| 11 | Lanzamiento gratuito 3 meses | Cobrar desde día 1 | En pueblos pequeños la confianza es más valiosa que el ingreso temprano |
| 12 | MVP: 1 pedido activo por repartidor independiente | Ilimitado | Mejor experiencia de cliente, se puede relajar después |
| 13 | El pago al repartidor del negocio es externo a la app | Gestionar en app | Reduce responsabilidad legal y complejidad del MVP |
| 14 | Liquidación semanal manual con foto de comprobante | Pago automático | Más simple para MVP, se automatiza en Fase 4 con MercadoPago |


---

## Decisiones Técnicas Registradas (Corte 26-Mar-2026)

| Decisión | Alternativa descartada | Razón Técnica (Resumen) |
|---|---|---|
| **Eliminación de `shared/` física** | Monorepo Package externo | **Resolución de Módulos:** Evitar configuración de `watchFolders` en Metro Bundler. **Transpilación:** Eliminar necesidad de pre-compilar TS. **Independencia:** Prevenir conflictos de `compilerOptions` entre Hermes y Web. |
| **Persistencia con AsyncStorage** | Memoria volátil | Garantizar que el SDK de Firebase mantenga el `User` persistente entre reinicios de la app en Tuxpan. |
| **Uso de `globalThis`** | Objeto `global` | Cumplir con estándar **SonarQube (S7764)** y asegurar que la instancia de Auth sea única y accesible en el motor Hermes. |
| **Inicialización Atómica** | `getAuth()` directo | Prevenir el error "Duplicate App" durante el Fast Refresh y silenciar warnings de inicialización. |
| **Manejo de Errores Auth** | Bloques catch vacíos | Cumplir con **SonarQube S2486** para asegurar trazabilidad de errores en el login. |

---

## Estado Actual de Implementación (Corte 26-Mar-2026)

### ✅ Infraestructura Base (Finalizado)
* **Seguridad:** Inyección de variables de entorno mediante `@env` para el `firebaseConfig`.
* **Auth Service:** Singleton de autenticación robusto, persistente y libre de warnings de SonarQube.
* **Arquitectura:** Migración de lógica compartida a modelos internos para maximizar la velocidad de desarrollo (Time-to-Market).

### 🚧 Fase de Producto (En Desarrollo)
* **Domain Models:** Creación de interfaces `IProduct` e `IOrder` para el flujo de Tuxpan.
* **Componentes:** Maquetación de `FlatList` para el catálogo de cocos y bebidas.