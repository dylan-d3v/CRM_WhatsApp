# CRM WhatsApp MVP

MVP SaaS para negocios pequenos de citas en Guayaquil (barberias, salones, esteticas, consultorios, opticas, veterinarias) que usan WhatsApp como canal principal.

## Objetivo

Resolver 4 problemas reales:

1. Citas olvidadas.
2. Desorden operativo en WhatsApp.
3. Perdida de clientes recurrentes.
4. Falta de historial de atencion.

## Estado Actual

- Estado del repo: implementacion inicial en curso por tareas.
- Implementacion completada:
  - `T01 - Inicializar proyecto base`
  - `T02 - Configurar UI base`
  - `T03 - Configurar Supabase y entorno`
  - `T04 - Auth y rutas protegidas`
  - `T05 - Migraciones base SaaS`
  - `T06 - Modulo clientes`
  - `T07 - Modulo servicios`
  - `T08 - Modulo citas`
  - `T09 - Dashboard diario`
  - `T10 - WhatsApp wa.me y plantillas`
  - `T11 - Configuracion y pulido MVP`
  - `T12 - Cierre para venta piloto`

## Documentos Clave

- `AGENTS.md`: reglas operativas para trabajar con Codex.
- `docs/PRODUCT_SPEC.md`: definicion del producto y alcance MVP.
- `docs/ARCHITECTURE.md`: decisiones tecnicas y modelo de datos.
- `docs/ROADMAP.md`: fases y cronograma.
- `docs/CODEX_TASKS.md`: backlog ejecutable por sesiones.
- `docs/DECISIONS.md`: registro de decisiones y cambios.
- `docs/DEMO_DATA.md`: guia para cargar datos demo vendibles.
- `docs/DEMO_SCRIPT.md`: guion comercial de demo en <= 3 minutos.
- `docs/PILOT_READY_CHECKLIST.md`: checklist de salida a piloto.

## Stack Definida

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Postgres + Auth + RLS)
- Vercel (deploy)
- WhatsApp `wa.me` para mensajes prellenados (sin API oficial en MVP)

## Como Empezar La Implementacion

1. Abrir `docs/CODEX_TASKS.md`.
2. Ejecutar la siguiente tarea pendiente en orden.
3. Validar criterios de aceptacion y pruebas.
4. Actualizar estado de tarea y `docs/DECISIONS.md` si aplica.
