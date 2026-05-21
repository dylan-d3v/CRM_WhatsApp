# AGENTS

Este archivo define como trabajar este proyecto con Codex en sesiones cortas, enfocadas y vendibles.

## Mision Del Producto

Construir un CRM de citas con WhatsApp para pequenos negocios de Guayaquil, priorizando:

1. Venta rapida.
2. Simplicidad operativa.
3. Mantenibilidad.
4. Mobile-first.

## Reglas Del Proyecto

1. No sobre-ingenieria.
2. Cada tarea debe mover el producto hacia una demo vendible.
3. No agregar funcionalidades fuera de MVP sin decision explicita.
4. Todo dato del negocio debe aislarse por `business_id`.
5. No afirmar "mensaje enviado"; en MVP solo se registra "WhatsApp abierto".

## Stack Obligatoria (MVP)

- Next.js App Router + TypeScript
- Tailwind + shadcn/ui
- Supabase Auth + PostgreSQL + RLS
- Vercel
- WhatsApp `wa.me` (manual)

## Fuera De Alcance (Por Ahora)

- WhatsApp Cloud API
- Envio automatico de mensajes
- Multi-sucursal
- Reportes avanzados
- App movil nativa
- Chat interno tipo inbox
- Pagos online integrados

## Flujo De Trabajo Con Codex

1. Leer `docs/CODEX_TASKS.md`.
2. Elegir la primera tarea en estado `todo`.
3. Implementar solo esa tarea.
4. Ejecutar verificaciones indicadas.
5. Marcar tarea en `done` o `blocked`.
6. Si cambia una decision, registrar en `docs/DECISIONS.md`.

## Convenciones De Tareas

- Estados permitidos: `todo`, `doing`, `done`, `blocked`.
- Cada tarea necesita:
  - Objetivo claro.
  - Entregables.
  - Criterios de aceptacion.
  - Verificacion minima.

## Criterio De Exito Del MVP

Un negocio local puede:

1. Registrar clientes.
2. Crear servicios.
3. Agendar citas.
4. Ver su dia en dashboard.
5. Abrir WhatsApp con mensaje listo.

