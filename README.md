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

## Documentos Clave

- `AGENTS.md`: reglas operativas para trabajar con Codex.
- `docs/PRODUCT_SPEC.md`: definicion del producto y alcance MVP.
- `docs/ARCHITECTURE.md`: decisiones tecnicas y modelo de datos.
- `docs/ROADMAP.md`: fases y cronograma.
- `docs/CODEX_TASKS.md`: backlog ejecutable por sesiones.
- `docs/DECISIONS.md`: registro de decisiones y cambios.

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
