# Datos Demo - Venta Piloto

## Objetivo

Tener un set de datos demo reproducible para mostrar el MVP en menos de 3 minutos con flujo real:

1. Cliente registrado.
2. Servicio creado.
3. Cita agendada.
4. Dashboard con actividad.
5. Boton de WhatsApp que abre `wa.me` con mensaje listo.

## Carga Rapida (SQL)

Archivo de apoyo: `supabase/demo/t12_pilot_demo_seed.sql`.

Pasos:

1. Abrir Supabase SQL Editor del proyecto.
2. Abrir el archivo `supabase/demo/t12_pilot_demo_seed.sql`.
3. Reemplazar `demo-owner@example.com` por el correo real del usuario owner que hara la demo.
4. Ejecutar script.

Resultado esperado:

- Negocio demo configurado.
- Clientes demo cargados.
- Servicios demo cargados.
- Citas demo con estados mixtos (`pending`, `confirmed`, `completed`, `cancelled`).
- Plantillas WhatsApp base listas para usar.

## Verificacion Minima De Datos Demo

1. Ir a `/customers` y confirmar que hay clientes con nota que inicia en `[DEMO]`.
2. Ir a `/services` y confirmar servicios con prefijo `DEMO -`.
3. Ir a `/appointments` y confirmar citas de hoy con estados variados.
4. Ir a `/dashboard` y confirmar tarjetas con actividad.
5. En una cita, usar `Abrir WhatsApp` y verificar que abre `wa.me` con texto prellenado.
6. Confirmar mensaje MVP en pantalla: no se afirma "mensaje enviado", solo registro de "WhatsApp abierto".

