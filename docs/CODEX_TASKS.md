# CODEX TASKS - CRM WhatsApp MVP

## Uso

1. Tomar la primera tarea en `todo`.
2. Cambiar su estado a `doing`.
3. Implementar en una sesion.
4. Correr verificacion.
5. Cambiar a `done` o `blocked`.

Estados permitidos: `todo`, `doing`, `done`, `blocked`.

---

## T01 - Inicializar proyecto base

- Estado: `done`
- Objetivo: crear app Next.js con TypeScript y estructura inicial.
- Entregables:
  - Scaffold Next.js.
  - Carpetas base de `src/` y `docs/`.
  - Scripts de desarrollo/build/lint.
- Aceptacion:
  - `npm run dev` inicia sin errores.
  - `npm run build` termina ok.
- Verificacion:
  - `npm run dev`
  - `npm run build`

## T02 - Configurar UI base

- Estado: `done`
- Objetivo: dejar base visual reusable.
- Entregables:
  - Tailwind activo.
  - shadcn/ui inicial.
  - Layout shell responsive.
- Aceptacion:
  - Vista limpia en movil y desktop.
- Verificacion:
  - Inspeccion manual en navegador.

## T03 - Configurar Supabase y entorno

- Estado: `todo`
- Objetivo: preparar conexion DB/Auth.
- Entregables:
  - Cliente supabase server/browser.
  - `.env.example` documentado.
  - Helpers de auth.
- Aceptacion:
  - Conexion valida y sesion detectable.
- Verificacion:
  - Login de prueba funcional.

## T04 - Auth y rutas protegidas

- Estado: `todo`
- Objetivo: login/register/onboarding basico.
- Entregables:
  - Pantallas `/login`, `/register`, `/onboarding`.
  - Guard de rutas privadas.
- Aceptacion:
  - No autenticado no entra a dashboard.
- Verificacion:
  - Flujo manual completo.

## T05 - Migraciones base SaaS

- Estado: `todo`
- Objetivo: crear esquema inicial de datos.
- Entregables:
  - Tablas: businesses, business_members, customers, services, appointments, message_templates, message_events.
  - Enums de estado/rol/tipo plantilla.
  - RLS activada y politicas base.
- Aceptacion:
  - Usuario solo accede a sus datos de negocio.
- Verificacion:
  - Pruebas SQL manuales por usuario.

## T06 - Modulo clientes

- Estado: `todo`
- Objetivo: CRUD clientes + historial en detalle.
- Entregables:
  - Lista, crear, editar, detalle.
  - Busqueda por nombre/telefono.
- Aceptacion:
  - Cliente creado aparece en lista y detalle.
- Verificacion:
  - Prueba manual de CRUD.

## T07 - Modulo servicios

- Estado: `todo`
- Objetivo: CRUD servicios.
- Entregables:
  - Lista, crear, editar, activar/desactivar.
- Aceptacion:
  - Servicio activo aparece para crear citas.
- Verificacion:
  - Prueba manual de CRUD.

## T08 - Modulo citas

- Estado: `todo`
- Objetivo: gestionar agenda diaria.
- Entregables:
  - Lista por fecha.
  - Crear/editar cita.
  - Cambiar estado: pending/confirmed/completed/cancelled.
- Aceptacion:
  - Citas visibles por fecha y estado.
- Verificacion:
  - Flujo manual de creacion y cambio de estado.

## T09 - Dashboard diario

- Estado: `todo`
- Objetivo: resumen accionable del dia.
- Entregables:
  - Citas de hoy.
  - Proximas citas.
  - Clientes recientes.
  - Pendientes/canceladas.
- Aceptacion:
  - Dashboard carga datos reales del negocio.
- Verificacion:
  - Revisar con datos demo.

## T10 - WhatsApp `wa.me` y plantillas

- Estado: `todo`
- Objetivo: abrir WhatsApp con mensajes prellenados.
- Entregables:
  - Helper de construccion de URL.
  - Variables de plantilla.
  - Botones en cita/dashboard.
  - Registro de `message_events`.
- Aceptacion:
  - Al presionar boton, abre WhatsApp con texto correcto.
- Verificacion:
  - Prueba manual de cada tipo de plantilla.

## T11 - Configuracion y pulido MVP

- Estado: `todo`
- Objetivo: dejar version vendible.
- Entregables:
  - Pantalla de configuracion de negocio.
  - Empty states y mensajes de error claros.
  - Mejora UX mobile.
- Aceptacion:
  - Flujo completo usable desde celular.
- Verificacion:
  - Demo completa de punta a punta.

## T12 - Cierre para venta piloto

- Estado: `todo`
- Objetivo: preparar entrega comercial inicial.
- Entregables:
  - Datos demo.
  - Script de demo (pasos).
  - Checklist de listo para vender.
- Aceptacion:
  - Presentacion fluida en menos de 3 minutos.
- Verificacion:
  - Simulacion de demo completa.
