# CRM de Citas con WhatsApp: Especificación Técnica y Plan de Implementación

## Resumen

Construiremos desde cero un MVP web, mobile-first y vendible para pequeños negocios de Guayaquil que gestionan citas por WhatsApp. El producto permitirá administrar clientes, servicios, citas, plantillas de mensajes y abrir WhatsApp con mensajes prellenados mediante `wa.me`.

La implementación partirá de una carpeta vacía, sin repo Git ni scaffold previo. El documento recomendado para guardar esta guía en la próxima sesión es `docs/crm-whatsapp-mvp-spec-plan.md`.

Stack decidida:

| Capa | Decisión |
|---|---|
| Framework | Next.js App Router |
| Lenguaje | TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| DB/Auth | Supabase PostgreSQL + Supabase Auth |
| Deploy | Vercel |
| Formularios | React Hook Form + Zod |
| Fechas | date-fns |
| WhatsApp | Links manuales `wa.me` |

Referencias oficiales usadas para validar la arquitectura: [Next.js App Router](https://en.nextjs.im/docs/app/), [Supabase Auth](https://supabase.com/docs/guides/auth), [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [shadcn/ui](https://ui.shadcn.com/docs/components), [Vercel Builds](https://docs.vercel.com/docs/builds), [WhatsApp Click to Chat](https://faq.whatsapp.com/5913398998672934).

## Producto y Alcance

El producto es un CRM ligero para negocios por cita. No reemplaza WhatsApp, sino que ordena la operación diaria y genera mensajes listos para enviar.

Cliente ideal inicial:

| Tipo de negocio | Motivo |
|---|---|
| Barberías | Alta recurrencia y muchas citas por WhatsApp |
| Salones de belleza | Necesitan agenda, historial y recordatorios |
| Estéticas | Servicios con duración y precio definidos |
| Veterinarias | Clientes recurrentes e historial útil |
| Ópticas o consultorios pequeños | Necesitan orden sin software complejo |

Problemas que resuelve:

| Problema | Solución MVP |
|---|---|
| Citas olvidadas | Dashboard diario y recordatorios por WhatsApp |
| WhatsApp desordenado | Clientes, notas e historial centralizados |
| Pérdida de recurrentes | Última visita e historial por cliente |
| Mensajes repetitivos | Plantillas editables |
| Falta de profesionalismo | Agenda clara desde celular |

Incluye en MVP:

| Módulo | Funciones |
|---|---|
| Auth | Registro, login y sesión del dueño |
| Negocio | Crear negocio inicial del usuario |
| Dashboard | Citas de hoy, próximas, clientes recientes, pendientes/canceladas |
| Clientes | Crear, editar, buscar, ver historial |
| Servicios | Crear, editar, activar/desactivar |
| Citas | Crear, editar, cambiar estado |
| WhatsApp | Abrir `wa.me` con mensaje prellenado |
| Plantillas | Editar confirmación, recordatorio, reprogramación y agradecimiento |
| Responsive | Uso cómodo desde celular |

No construir todavía:

| Fuera de alcance | Motivo |
|---|---|
| WhatsApp Cloud API | Requiere más configuración y aprobación |
| Envíos automáticos | No necesario para validar venta |
| Chat interno | Alto costo técnico |
| Pagos online | Puede manejarse manualmente al inicio |
| Multi-sucursal | No necesario para primeros clientes |
| App móvil nativa | La web responsive basta para MVP |
| Reportes avanzados | No cierra ventas iniciales |

## Arquitectura e Interfaces

Arquitectura general:

```txt
Usuario
  -> Next.js App Router
  -> Server Actions / Supabase Client
  -> Supabase Auth
  -> Supabase PostgreSQL con RLS
  -> Botón wa.me para abrir WhatsApp
```

Rutas principales:

| Ruta | Propósito |
|---|---|
| `/login` | Iniciar sesión |
| `/register` | Crear cuenta |
| `/onboarding` | Crear negocio inicial |
| `/dashboard` | Resumen del día |
| `/customers` | Listar y buscar clientes |
| `/customers/new` | Crear cliente |
| `/customers/[id]` | Ver cliente e historial |
| `/services` | Gestionar servicios |
| `/appointments` | Listar citas |
| `/appointments/new` | Crear cita |
| `/appointments/[id]` | Ver y editar cita |
| `/templates` | Editar plantillas |
| `/settings` | Datos del negocio |

Estructura recomendada:

```txt
src/
  app/
    (auth)/
    (dashboard)/
  components/
    ui/
    layout/
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
docs/
```

Tablas iniciales:

| Tabla | Campos clave |
|---|---|
| `businesses` | `id`, `name`, `slug`, `owner_user_id`, `phone`, `timezone`, `created_at` |
| `business_members` | `id`, `business_id`, `user_id`, `role`, `created_at` |
| `customers` | `id`, `business_id`, `name`, `phone`, `phone_e164`, `notes`, `last_visit_at`, `created_at`, `updated_at` |
| `services` | `id`, `business_id`, `name`, `duration_minutes`, `price`, `is_active`, `created_at` |
| `appointments` | `id`, `business_id`, `customer_id`, `service_id`, `starts_at`, `ends_at`, `status`, `internal_notes`, `created_at`, `updated_at` |
| `message_templates` | `id`, `business_id`, `type`, `title`, `body`, `created_at`, `updated_at` |
| `message_events` | `id`, `business_id`, `customer_id`, `appointment_id`, `template_type`, `whatsapp_url_opened_at`, `created_by` |

Enums decididos:

| Enum | Valores |
|---|---|
| `appointment_status` | `pending`, `confirmed`, `completed`, `cancelled` |
| `member_role` | `owner`, `staff` |
| `template_type` | `confirmation`, `reminder`, `reschedule`, `thank_you` |

Variables permitidas en plantillas:

| Variable | Valor |
|---|---|
| `{cliente}` | Nombre del cliente |
| `{negocio}` | Nombre del negocio |
| `{servicio}` | Nombre del servicio |
| `{fecha}` | Fecha formateada |
| `{hora}` | Hora formateada |
| `{precio}` | Precio del servicio |

Reglas funcionales:

| Regla | Decisión |
|---|---|
| Zona horaria | Usar `America/Guayaquil` por defecto |
| Moneda | USD |
| Teléfonos | Guardar visible y normalizado E.164 cuando sea posible |
| WhatsApp | Abrir URL, no marcar mensaje como enviado |
| Historial | Se deriva de citas completadas y pasadas |
| SaaS futuro | Toda tabla de negocio debe incluir `business_id` |
| Seguridad | Activar RLS en tablas expuestas |

## Plan De Implementación Por Tareas

### Fase 1: Scaffold y base técnica

Objetivo: dejar una app Next.js funcional con UI, Supabase y estructura base.

Tareas:

| Orden | Tarea | Resultado esperado |
|---|---|---|
| 1 | Inicializar repo Git | Proyecto versionado localmente |
| 2 | Crear app Next.js con TypeScript | App corre en desarrollo |
| 3 | Configurar Tailwind CSS y shadcn/ui | Componentes base disponibles |
| 4 | Crear estructura `src/`, `supabase/`, `docs/` | Carpetas alineadas al plan |
| 5 | Configurar variables `.env.local` y `.env.example` | Supabase URL y keys documentadas |
| 6 | Crear cliente Supabase browser/server | Acceso consistente a Auth y DB |
| 7 | Crear layout base responsive | Navegación mobile-first |

Criterio de aceptación: `npm run dev` levanta la app y muestra una pantalla inicial sin errores.

### Fase 2: Auth y negocio inicial

Objetivo: permitir que un dueño cree cuenta y negocio.

Tareas:

| Orden | Tarea | Resultado esperado |
|---|---|---|
| 1 | Crear pantallas `/login` y `/register` | Auth por email/password |
| 2 | Proteger rutas del dashboard | Usuario no autenticado va a login |
| 3 | Crear migración de `businesses` y `business_members` | Base preparada para SaaS |
| 4 | Crear `/onboarding` | Usuario crea nombre del negocio |
| 5 | Crear seed de plantillas por defecto al crear negocio | Negocio nuevo tiene mensajes iniciales |
| 6 | Implementar consulta del negocio actual | Dashboard sabe el `business_id` activo |

Criterio de aceptación: un usuario nuevo puede registrarse, crear negocio y entrar al dashboard.

### Fase 3: Clientes y servicios

Objetivo: registrar la información operativa básica.

Tareas:

| Orden | Tarea | Resultado esperado |
|---|---|---|
| 1 | Crear migraciones de `customers` y `services` | Tablas con RLS |
| 2 | Crear validaciones Zod | Formularios robustos |
| 3 | Crear CRUD de clientes | Crear, editar, listar y buscar |
| 4 | Crear detalle de cliente | Notas e historial visible |
| 5 | Crear CRUD de servicios | Nombre, duración, precio, activo |
| 6 | Agregar estados vacíos | UX clara cuando no hay datos |

Criterio de aceptación: se pueden crear clientes y servicios reales desde celular.

### Fase 4: Citas

Objetivo: manejar agenda diaria.

Tareas:

| Orden | Tarea | Resultado esperado |
|---|---|---|
| 1 | Crear migración de `appointments` | Citas relacionadas a cliente y servicio |
| 2 | Crear formulario de cita | Cliente, servicio, fecha, hora, notas |
| 3 | Calcular `ends_at` desde duración del servicio | Cita tiene inicio y fin |
| 4 | Crear listado por fecha y estado | Agenda usable |
| 5 | Crear edición de estado | Pendiente, confirmada, completada, cancelada |
| 6 | Actualizar `last_visit_at` al completar cita | Cliente refleja última visita |

Criterio de aceptación: el negocio puede agendar, confirmar, completar y cancelar citas.

### Fase 5: Dashboard y WhatsApp

Objetivo: convertir datos en acciones rápidas.

Tareas:

| Orden | Tarea | Resultado esperado |
|---|---|---|
| 1 | Crear consultas de dashboard | Citas de hoy, próximas y métricas simples |
| 2 | Diseñar cards mobile-first | Información clara en celular |
| 3 | Crear helper `buildWhatsAppUrl` | Genera links `wa.me` codificados |
| 4 | Crear reemplazo de variables de plantilla | Mensajes personalizados |
| 5 | Agregar botones WhatsApp en cita y dashboard | Confirmación, recordatorio, reprogramación, agradecimiento |
| 6 | Registrar `message_events` al abrir link | Auditoría de “WhatsApp abierto” |

Criterio de aceptación: desde una cita se abre WhatsApp con el mensaje correcto.

### Fase 6: Plantillas y configuración

Objetivo: permitir personalización mínima por negocio.

Tareas:

| Orden | Tarea | Resultado esperado |
|---|---|---|
| 1 | Crear CRUD de `message_templates` | Plantillas editables |
| 2 | Agregar vista previa de mensaje | Dueño ve cómo quedará |
| 3 | Crear `/settings` | Nombre, teléfono y zona horaria |
| 4 | Validar variables permitidas | Evitar placeholders rotos |
| 5 | Restaurar plantillas por defecto | Recuperación simple |

Criterio de aceptación: el negocio puede adaptar textos a su tono.

### Fase 7: Pulido vendible

Objetivo: dejar una demo presentable y usable por primeros clientes.

Tareas:

| Orden | Tarea | Resultado esperado |
|---|---|---|
| 1 | Mejorar navegación móvil | Acciones fáciles con una mano |
| 2 | Agregar landing simple | Explica valor y precio inicial |
| 3 | Crear datos demo opcionales | Demo rápida para ventas |
| 4 | Revisar errores y toasts | Fallos comprensibles |
| 5 | Revisar RLS y aislamiento por negocio | Sin fuga de datos |
| 6 | Preparar README de instalación | Siguiente sesión puede ejecutar sin adivinar |

Criterio de aceptación: se puede mostrar el producto a un negocio local en menos de 3 minutos.

## Pruebas y Escenarios De Aceptación

Pruebas mínimas manuales:

| Escenario | Resultado esperado |
|---|---|
| Registro nuevo | Usuario crea cuenta y negocio |
| Login existente | Usuario entra al dashboard |
| Crear cliente | Cliente aparece en listado |
| Buscar cliente | Búsqueda devuelve resultados correctos |
| Crear servicio | Servicio queda disponible para citas |
| Crear cita | Cita aparece en agenda y dashboard |
| Cambiar estado | Estado se actualiza visualmente |
| Completar cita | Cliente actualiza última visita |
| Abrir WhatsApp | URL contiene teléfono y mensaje codificado |
| Editar plantilla | Nuevo texto se usa en siguiente mensaje |
| Acceso no autenticado | Redirige a login |
| Datos entre negocios | Usuario no ve datos de otro negocio |
| Responsive | Dashboard, listas y formularios funcionan en móvil |

Checks técnicos:

| Comando | Uso esperado |
|---|---|
| `npm run lint` | Sin errores de lint |
| `npm run typecheck` | Sin errores TypeScript |
| `npm run build` | Build productivo exitoso |
| Pruebas RLS manuales | Confirmar aislamiento por `business_id` |

Criterios para vender el MVP:

| Checklist | Estado esperado |
|---|---|
| Login funciona | Obligatorio |
| Dashboard muestra citas reales | Obligatorio |
| Clientes y servicios funcionan | Obligatorio |
| Citas funcionan | Obligatorio |
| WhatsApp abre con mensaje correcto | Obligatorio |
| Plantillas editables funcionan | Obligatorio |
| Mobile usable | Obligatorio |
| Datos aislados por negocio | Obligatorio |
| Demo con datos preparada | Obligatorio |
| Precio y pitch definidos | Obligatorio |

## Monetización y Primeros Clientes

Modelo recomendado para primeros clientes:

| Concepto | Precio inicial sugerido |
|---|---|
| Instalación/configuración | USD 49 a USD 79 |
| Mensualidad fundador | USD 10 a USD 15 |
| Soporte inicial | Incluido por WhatsApp |

Pitch:

> “Te ayudo a tener tus citas, clientes y recordatorios ordenados en una app que funciona desde el celular. No reemplaza tu WhatsApp; lo hace más ordenado.”

Estrategia para primeros 5 clientes:

| Paso | Acción |
|---|---|
| 1 | Elegir un nicho inicial, idealmente barberías o salones |
| 2 | Crear demo con servicios reales de ese nicho |
| 3 | Visitar negocios locales con celular en mano |
| 4 | Mostrar flujo: crear cita, ver dashboard, abrir WhatsApp |
| 5 | Ofrecer precio fundador por feedback |
| 6 | Configurar servicios y plantillas personalmente |
| 7 | Pedir testimonio si el piloto funciona |

## Supuestos y Defaults

Decisiones bloqueadas para implementación:

| Tema | Decisión |
|---|---|
| Formato del documento | Un solo documento maestro |
| Estado del proyecto | Carpeta vacía, implementación desde cero |
| MVP inicial | Un negocio por usuario dueño |
| Multi-negocio futuro | Preparar con `business_id` desde el inicio |
| WhatsApp | `wa.me` manual, sin API oficial |
| Envíos | Registrar “WhatsApp abierto”, no “mensaje enviado” |
| Auth | Email/password con Supabase Auth |
| Seguridad | RLS obligatoria en tablas de negocio |
| Diseño | Mobile-first, dashboard simple |
| Deploy | Vercel |
| Mercado inicial | Guayaquil, Ecuador |
| Zona horaria | `America/Guayaquil` |
| Moneda | USD |
