# Decisions Log

Registro de decisiones tecnicas y de producto para evitar reabrir debates en cada sesion.

## 2026-05-21 - Documento base del proyecto

- Decision: usar set de documentos:
  - `README.md`
  - `AGENTS.md`
  - `docs/PRODUCT_SPEC.md`
  - `docs/ARCHITECTURE.md`
  - `docs/ROADMAP.md`
  - `docs/CODEX_TASKS.md`
  - `docs/DECISIONS.md`
- Motivo: equilibrar claridad, velocidad y ejecucion por tareas con Codex.

## 2026-05-21 - Stack MVP

- Decision: Next.js + TypeScript + Tailwind + shadcn + Supabase + Vercel.
- Motivo: stack moderna, simple de mantener y rapida de desplegar.

## 2026-05-21 - Estrategia WhatsApp MVP

- Decision: usar `wa.me` para abrir WhatsApp con mensaje prellenado.
- Motivo: minimizar complejidad y salir a vender rapido.
- Implicacion: no marcar "mensaje enviado", solo "WhatsApp abierto".

## 2026-05-21 - Alcance inicial

- Decision: mantener alcance en auth, clientes, servicios, citas, dashboard y plantillas.
- Motivo: validar venta antes de automatizaciones avanzadas.

## 2026-05-21 - Arquitectura SaaS futura

- Decision: incluir `business_id` en entidades desde el dia 1.
- Motivo: evitar migraciones costosas al pasar de app unica a multi-negocio.

## 2026-05-21 - Base UI del MVP

- Decision: activar Tailwind CSS y configurar base inicial de `shadcn/ui` con `components.json`, utilidad `cn` y componente `Button`.
- Motivo: acelerar la construccion de pantallas MVP reutilizando primitives consistentes.
- Implicacion: el shell principal queda mobile-first y listo para conectar modulos de clientes, servicios y citas.

## 2026-05-21 - Integracion base de Supabase SSR

- Decision: usar `@supabase/supabase-js` + `@supabase/ssr` con utilidades separadas para cliente browser y servidor.
- Motivo: alinear auth/DB con App Router desde el inicio sin usar paquetes legacy.
- Implicacion: se estandariza `.env.example` con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, y se agrega helper para detectar sesion en servidor.

## 2026-05-21 - Guard de rutas privadas por layout

- Decision: proteger rutas privadas con layouts del App Router (`(dashboard)` y `onboarding`) en lugar de middleware.
- Motivo: reducir complejidad en MVP y mantener flujo de auth claro por pantalla.
- Implicacion: `/login` y `/register` redirigen a usuarios autenticados; `/dashboard` requiere sesion activa y onboarding completado.

## 2026-05-23 - Esquema inicial SaaS + RLS por membresia

- Decision: crear migracion base con tablas `businesses`, `business_members`, `customers`, `services`, `appointments`, `message_templates` y `message_events`, incluyendo enums y politicas RLS.
- Motivo: asegurar aislamiento por `business_id` desde el inicio y habilitar T06+ sin deuda de seguridad.
- Implicacion: el acceso de lectura/escritura depende de pertenencia en `business_members`; al crear negocio se agrega automaticamente el owner como miembro.

## 2026-05-23 - Modulo de clientes con contexto de negocio activo

- Decision: implementar T06 con rutas `customers` (lista/crear, detalle, editar) resolviendo `business_id` desde `business_members` del usuario autenticado.
- Motivo: mantener aislamiento de datos por negocio y habilitar busqueda + CRUD sin esperar modulos futuros.
- Implicacion: el onboarding ahora crea/actualiza automaticamente el registro en `businesses` para el owner, evitando usuarios autenticados sin negocio operativo.

## 2026-05-23 - Modulo de servicios con activacion para citas

- Decision: implementar T07 con rutas `services` (lista/crear y editar), accion de activar/desactivar y consultas separadas para servicios activos.
- Motivo: habilitar un catalogo operativo minimo para usar en el modulo de citas sin agregar complejidad fuera del MVP.
- Implicacion: solo los servicios activos quedaran listos para el flujo de creacion de citas en T08.

## 2026-05-23 - Modulo de citas con agenda por fecha y estados operativos

- Decision: implementar T08 con rutas `appointments` (lista/crear y editar), filtro diario por fecha, actualizacion de estado (`pending`, `confirmed`, `completed`, `cancelled`) y validacion de cliente/servicio dentro del `business_id`.
- Motivo: cubrir el flujo operativo principal del MVP para registrar agenda diaria y mover citas por estado sin sobre-ingenieria.
- Implicacion: la agenda usa hora local de `America/Guayaquil`; crear cita exige servicio activo, mientras edicion permite mantener historial aun si un servicio luego queda inactivo.

## 2026-05-24 - Dashboard diario conectado a datos reales

- Decision: implementar T09 con modulo `server/dashboard/queries.ts` y pantalla `/dashboard` conectada a Supabase por `business_id` para mostrar citas de hoy, proximas citas, clientes recientes y bloque de pendientes/canceladas.
- Motivo: cumplir el objetivo de resumen accionable del dia sin agregar complejidad fuera del MVP.
- Implicacion: el dashboard usa zona horaria `America/Guayaquil` para el corte diario y mantiene enlaces directos al flujo operativo de citas/clientes.

## 2026-05-24 - Integracion WhatsApp `wa.me` con registro de apertura

- Decision: implementar T10 con helper `lib/whatsapp` para construir URL `wa.me` y renderizar variables de plantilla (`{cliente}`, `{negocio}`, `{servicio}`, `{fecha}`, `{hora}`, `{precio}`), usando plantillas por defecto cuando no existe registro en `message_templates`.
- Motivo: habilitar el flujo de venta del MVP (abrir WhatsApp con mensaje listo) sin depender de APIs externas ni automatizaciones fuera de alcance.
- Implicacion: los botones de WhatsApp quedan disponibles en `citas` y `dashboard`, y cada apertura registra `message_events` como evidencia operativa; no se marca "mensaje enviado", solo "WhatsApp abierto".

## 2026-05-24 - Configuracion de negocio y pulido mobile-first MVP

- Decision: implementar T11 con nueva pantalla `/settings` para actualizar datos base del negocio (`name`, `phone`, `timezone` fija en `America/Guayaquil`) y sincronizar `user_metadata` de auth, junto con ajustes de navegacion mobile (acceso directo a configuracion, safe area en barra inferior) y empty states mas accionables en clientes/servicios/citas.
- Motivo: cerrar una demo vendible de punta a punta con flujo operativo claro desde celular y mensajes comprensibles para soporte inicial.
- Implicacion: el negocio puede mantener sus datos sin salir del dashboard; cuando faltan datos para crear citas, la UI guia al usuario con CTA directos sin prometer funcionalidades fuera del MVP.

## 2026-05-24 - Kit comercial para cierre de venta piloto

- Decision: implementar T12 con un paquete minimo de salida a venta que incluye seed reproducible de datos demo (`supabase/demo/t12_pilot_demo_seed.sql`), guia de carga (`docs/DEMO_DATA.md`), guion de demo de 3 minutos (`docs/DEMO_SCRIPT.md`) y checklist de readiness (`docs/PILOT_READY_CHECKLIST.md`).
- Motivo: estandarizar demos comerciales para mostrar valor rapido sin agregar funcionalidades fuera del alcance MVP.
- Implicacion: cualquier sesion de venta puede arrancar con datos consistentes, narrativa repetible y control de calidad operativo antes de iniciar pilotos.
