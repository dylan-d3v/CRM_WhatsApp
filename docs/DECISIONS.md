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

