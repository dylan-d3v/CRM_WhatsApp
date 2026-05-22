# Architecture - CRM WhatsApp MVP

## 1. Principios

1. Simplicidad primero.
2. Mobile-first.
3. Datos aislados por negocio.
4. MVP vendible > funciones avanzadas.
5. Preparado para evolucionar a SaaS.

## 2. Stack

- Frontend/backend web: Next.js App Router (TypeScript)
- UI: Tailwind + shadcn/ui
- DB/Auth: Supabase (Postgres + Auth)
- Seguridad: Supabase RLS
- Deploy: Vercel
- Mensajeria: `wa.me` con texto prellenado

## 3. Estructura De Proyecto

```txt
src/
  app/
    (auth)/
      login/
      register/
    onboarding/
    (dashboard)/
      dashboard/
      customers/
      services/
      appointments/
      templates/
      settings/
  components/
    ui/
    dashboard/
    customers/
    services/
    appointments/
    templates/
  lib/
    supabase/
    validations/
    whatsapp/
    dates/
    auth/
  server/
    customers/
    services/
    appointments/
    templates/
  types/
  constants/
supabase/
  migrations/
```

## 4. Modelo De Datos Inicial

### `businesses`

- `id` (uuid, pk)
- `name` (text)
- `slug` (text, unique)
- `owner_user_id` (uuid)
- `phone` (text, nullable)
- `timezone` (text, default `America/Guayaquil`)
- `created_at` (timestamptz)

### `business_members`

- `id` (uuid, pk)
- `business_id` (uuid, fk -> businesses.id)
- `user_id` (uuid)
- `role` (enum: `owner`, `staff`)
- `created_at` (timestamptz)

### `customers`

- `id` (uuid, pk)
- `business_id` (uuid, fk)
- `name` (text)
- `phone` (text)
- `phone_e164` (text, nullable)
- `notes` (text, nullable)
- `last_visit_at` (timestamptz, nullable)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### `services`

- `id` (uuid, pk)
- `business_id` (uuid, fk)
- `name` (text)
- `duration_minutes` (int)
- `price` (numeric(10,2))
- `is_active` (boolean, default true)
- `created_at` (timestamptz)

### `appointments`

- `id` (uuid, pk)
- `business_id` (uuid, fk)
- `customer_id` (uuid, fk -> customers.id)
- `service_id` (uuid, fk -> services.id)
- `starts_at` (timestamptz)
- `ends_at` (timestamptz)
- `status` (enum: `pending`, `confirmed`, `completed`, `cancelled`)
- `internal_notes` (text, nullable)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### `message_templates`

- `id` (uuid, pk)
- `business_id` (uuid, fk)
- `type` (enum: `confirmation`, `reminder`, `reschedule`, `thank_you`)
- `title` (text)
- `body` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### `message_events`

- `id` (uuid, pk)
- `business_id` (uuid, fk)
- `customer_id` (uuid, fk -> customers.id)
- `appointment_id` (uuid, fk -> appointments.id, nullable)
- `template_type` (text)
- `whatsapp_url_opened_at` (timestamptz)
- `created_by` (uuid)

## 5. Reglas De Negocio

1. Toda entidad operativa debe incluir `business_id`.
2. Cita completada puede actualizar `customers.last_visit_at`.
3. Plantillas usan variables:
   - `{cliente}`, `{negocio}`, `{servicio}`, `{fecha}`, `{hora}`, `{precio}`
4. En MVP no se confirma envio real de WhatsApp; solo apertura de link.

## 6. Seguridad

1. Activar RLS en tablas con datos de negocio.
2. Politicas basadas en pertenencia de usuario a `business_members`.
3. Rutas privadas protegidas por sesion activa.
