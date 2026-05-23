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
