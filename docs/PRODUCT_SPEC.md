# Product Spec - CRM de Citas con WhatsApp (MVP)

## 1. Vision

Aplicacion web simple para negocios pequenos que operan con citas por WhatsApp. El sistema organiza clientes, servicios, citas y mensajes para reducir ausencias y desorden.

## 2. Cliente Ideal (Guayaquil)

- Barberias
- Salones de belleza
- Esteticas
- Consultorios pequenos
- Opticas
- Veterinarias

Perfil comun:

- Agenda por WhatsApp.
- Tiene citas olvidadas o mal registradas.
- No quiere software complejo.
- Quiere usar el sistema desde celular.

## 3. Problemas Que Resuelve

1. Citas olvidadas.
2. Conversaciones sin estructura.
3. Falta de historial por cliente.
4. Dificultad para dar seguimiento.
5. Mensajes repetitivos escritos a mano.

## 4. Alcance MVP

1. Autenticacion del dueno.
2. Dashboard diario:
   - Citas de hoy.
   - Proximas citas.
   - Clientes recientes.
   - Pendientes y canceladas.
3. Clientes:
   - Nombre, telefono, notas, ultima visita.
   - Historial de citas.
4. Servicios:
   - Nombre, duracion estimada, precio.
5. Citas:
   - Cliente, servicio, fecha/hora, estado, notas internas.
6. WhatsApp por `wa.me`:
   - Confirmacion.
   - Recordatorio.
   - Reprogramacion.
   - Agradecimiento.
7. Plantillas editables.
8. Diseno responsive.

## 5. Fuera De Alcance MVP

- WhatsApp API oficial.
- Envio automatico de recordatorios.
- Facturacion/inventario.
- Multi-sucursal.
- Roles complejos.
- Reporteria avanzada.
- App movil nativa.

## 6. Flujo Principal De Usuario

1. El dueno inicia sesion.
2. Revisa dashboard del dia.
3. Crea o selecciona cliente.
4. Crea cita con servicio y hora.
5. Abre WhatsApp con plantilla.
6. Cambia estado de cita cuando corresponda.
7. Consulta historial del cliente.

## 7. Pantallas Necesarias

- Login
- Register
- Onboarding de negocio
- Dashboard
- Clientes (lista, crear/editar, detalle)
- Servicios (lista, crear/editar)
- Citas (lista, crear/editar, detalle)
- Plantillas de mensajes
- Configuracion de negocio

## 8. Objetivo De Venta

Demostrar en menos de 3 minutos que el negocio puede ordenar su agenda y enviar mensajes de forma profesional desde celular.

