# Script Demo Comercial (<= 3 minutos)

## Objetivo

Mostrar en una sola corrida que el negocio puede:

1. Ver su dia.
2. Registrar clientes/servicios/citas.
3. Abrir WhatsApp con mensaje listo.

## Preparacion previa (antes de la llamada)

1. Cargar datos demo con `docs/DEMO_DATA.md`.
2. Iniciar sesion con usuario owner del negocio demo.
3. Abrir el sistema en `/dashboard`.
4. Tener WhatsApp Web o WhatsApp movil disponible para abrir enlaces.

## Guion Cronometrado

### 0:00 - 0:30 | Apertura y problema

Texto sugerido:

"Este CRM ordena su agenda diaria de WhatsApp sin cambiar su forma de trabajo. En menos de 3 minutos vamos a ver clientes, citas y mensajes listos."

Accion:

1. Mostrar tarjetas de `/dashboard` (citas de hoy, proximas, pendientes, canceladas).

### 0:30 - 1:10 | Clientes y servicios

Accion:

1. Ir a `/customers`.
2. Mostrar que existe historial de clientes del negocio.
3. Ir a `/services`.
4. Mostrar que servicios activos quedan listos para usar en citas.

Texto sugerido:

"No hay chats sueltos; cada cliente y servicio queda ordenado y listo para agendar."

### 1:10 - 2:00 | Agenda diaria

Accion:

1. Ir a `/appointments`.
2. Mostrar una cita existente con estado visible.
3. Cambiar estado de una cita (por ejemplo, `pending` -> `confirmed`) y guardar.
4. Mostrar que la cita sigue en la agenda del dia.

Texto sugerido:

"Aqui se mueve la operacion diaria: quien viene, cuando viene y en que estado esta."

### 2:00 - 2:40 | WhatsApp listo para enviar

Accion:

1. En la misma cita, elegir tipo de plantilla (por ejemplo `Recordatorio`).
2. Presionar `Abrir WhatsApp`.
3. Mostrar que se abre `wa.me` con texto prellenado.

Texto sugerido:

"El sistema no envia mensajes automaticamente en esta fase. Lo que hace es abrir WhatsApp con el mensaje ya armado para que usted lo revise y lo envie."

### 2:40 - 3:00 | Cierre comercial

Accion:

1. Volver a `/dashboard`.
2. Cerrar con propuesta de piloto.

Texto sugerido:

"Con esto ya puede ordenar agenda y seguimiento desde el celular. El siguiente paso es instalarlo con sus datos reales y acompanarlo en la primera semana."

## Criterio de Aceptacion de Demo

Se considera demo valida si ocurre todo esto en menos de 3 minutos:

1. Se vio dashboard con datos reales.
2. Se navegaron clientes/servicios/citas.
3. Se actualizo al menos un estado de cita.
4. Se abrio `wa.me` con mensaje prellenado.
5. No se prometio "mensaje enviado"; solo "WhatsApp abierto".

