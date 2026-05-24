-- T12 - Cierre para venta piloto
-- Seed demo para un negocio owner existente.
-- Reemplaza el correo demo-owner@example.com antes de ejecutar.

begin;

do $$
declare
  v_owner_user_id uuid;
  v_business_id uuid;
begin
  select u.id into v_owner_user_id
  from auth.users u
  where u.email = 'demo-owner@example.com'
  limit 1;

  if v_owner_user_id is null then
    raise exception 'No existe auth.users con el correo indicado.';
  end if;

  select b.id into v_business_id
  from public.businesses b
  where b.owner_user_id = v_owner_user_id
  limit 1;

  if v_business_id is null then
    raise exception 'El owner existe, pero no tiene negocio creado.';
  end if;
end
$$;

-- Configuracion base del negocio demo.
with business_ctx as (
  select b.id as business_id, b.owner_user_id
  from public.businesses b
  join auth.users u on u.id = b.owner_user_id
  where u.email = 'demo-owner@example.com'
  limit 1
)
update public.businesses b
set
  name = 'Barberia Norte Demo',
  phone = '0999999999',
  timezone = 'America/Guayaquil'
from business_ctx ctx
where b.id = ctx.business_id;

-- Limpieza de datos demo previos (idempotente).
with business_ctx as (
  select b.id as business_id
  from public.businesses b
  join auth.users u on u.id = b.owner_user_id
  where u.email = 'demo-owner@example.com'
  limit 1
)
delete from public.appointments a
using business_ctx ctx
where a.business_id = ctx.business_id
  and a.internal_notes like '[DEMO]%';

with business_ctx as (
  select b.id as business_id
  from public.businesses b
  join auth.users u on u.id = b.owner_user_id
  where u.email = 'demo-owner@example.com'
  limit 1
)
delete from public.customers c
using business_ctx ctx
where c.business_id = ctx.business_id
  and c.notes like '[DEMO]%';

with business_ctx as (
  select b.id as business_id
  from public.businesses b
  join auth.users u on u.id = b.owner_user_id
  where u.email = 'demo-owner@example.com'
  limit 1
)
delete from public.services s
using business_ctx ctx
where s.business_id = ctx.business_id
  and s.name like 'DEMO - %';

-- Clientes demo.
with business_ctx as (
  select b.id as business_id
  from public.businesses b
  join auth.users u on u.id = b.owner_user_id
  where u.email = 'demo-owner@example.com'
  limit 1
)
insert into public.customers (business_id, name, phone, notes)
select ctx.business_id, v.name, v.phone, v.notes
from business_ctx ctx
cross join (
  values
    ('Carlos Mena', '0991111111', '[DEMO] Cliente frecuente - corte clasico.'),
    ('Ana Torres', '0992222222', '[DEMO] Prefiere cita por la tarde.'),
    ('Luis Cedeno', '0993333333', '[DEMO] Primera visita, viene por recomendacion.'),
    ('Paola Reyes', '0994444444', '[DEMO] Cliente puntual, confirma por WhatsApp.'),
    ('Mario Vera', '0995555555', '[DEMO] Suele reprogramar con poca anticipacion.')
) as v(name, phone, notes);

-- Servicios demo.
with business_ctx as (
  select b.id as business_id
  from public.businesses b
  join auth.users u on u.id = b.owner_user_id
  where u.email = 'demo-owner@example.com'
  limit 1
)
insert into public.services (business_id, name, duration_minutes, price, is_active)
select ctx.business_id, v.name, v.duration_minutes, v.price, v.is_active
from business_ctx ctx
cross join (
  values
    ('DEMO - Corte clasico', 30, 8.00, true),
    ('DEMO - Corte + barba', 45, 12.00, true),
    ('DEMO - Barba express', 20, 6.00, true),
    ('DEMO - Tratamiento capilar', 60, 18.00, true)
) as v(name, duration_minutes, price, is_active);

-- Plantillas demo (upsert por tipo).
with business_ctx as (
  select b.id as business_id
  from public.businesses b
  join auth.users u on u.id = b.owner_user_id
  where u.email = 'demo-owner@example.com'
  limit 1
)
insert into public.message_templates (business_id, type, title, body)
select ctx.business_id, v.type::public.message_template_type, v.title, v.body
from business_ctx ctx
cross join (
  values
    ('confirmation', 'Confirmacion demo', 'Hola {cliente}, te confirmamos tu cita de {servicio} para {fecha} a las {hora}. - {negocio}'),
    ('reminder', 'Recordatorio demo', 'Hola {cliente}, te recordamos tu cita de {servicio} hoy {fecha} a las {hora}. Te esperamos en {negocio}.'),
    ('reschedule', 'Reprogramacion demo', 'Hola {cliente}, necesitamos reprogramar tu cita de {servicio}. Escribenos para coordinar una nueva hora.'),
    ('thank_you', 'Agradecimiento demo', 'Gracias {cliente} por visitarnos en {negocio}. Te esperamos pronto.')
) as v(type, title, body)
on conflict (business_id, type)
do update
set
  title = excluded.title,
  body = excluded.body,
  updated_at = timezone('utc', now());

-- Citas demo con horarios relativos al momento de ejecucion.
with business_ctx as (
  select b.id as business_id
  from public.businesses b
  join auth.users u on u.id = b.owner_user_id
  where u.email = 'demo-owner@example.com'
  limit 1
),
customers_demo as (
  select c.id, c.name
  from public.customers c
  join business_ctx ctx on ctx.business_id = c.business_id
  where c.notes like '[DEMO]%'
),
services_demo as (
  select s.id, s.name, s.duration_minutes
  from public.services s
  join business_ctx ctx on ctx.business_id = s.business_id
  where s.name like 'DEMO - %'
),
base_times as (
  select
    timezone('utc', now() + interval '20 minute') as t1,
    timezone('utc', now() + interval '90 minute') as t2,
    timezone('utc', now() + interval '180 minute') as t3,
    timezone('utc', now() - interval '150 minute') as t4,
    timezone('utc', now() + interval '300 minute') as t5,
    timezone('utc', now() + interval '1 day' + interval '60 minute') as t6
),
rows as (
  select
    ctx.business_id,
    c1.id as customer_1,
    c2.id as customer_2,
    c3.id as customer_3,
    c4.id as customer_4,
    c5.id as customer_5,
    s1.id as service_1,
    s2.id as service_2,
    s3.id as service_3,
    s4.id as service_4,
    s1.duration_minutes as dur_1,
    s2.duration_minutes as dur_2,
    s3.duration_minutes as dur_3,
    s4.duration_minutes as dur_4,
    bt.t1,
    bt.t2,
    bt.t3,
    bt.t4,
    bt.t5,
    bt.t6
  from business_ctx ctx
  cross join base_times bt
  join customers_demo c1 on c1.name = 'Carlos Mena'
  join customers_demo c2 on c2.name = 'Ana Torres'
  join customers_demo c3 on c3.name = 'Luis Cedeno'
  join customers_demo c4 on c4.name = 'Paola Reyes'
  join customers_demo c5 on c5.name = 'Mario Vera'
  join services_demo s1 on s1.name = 'DEMO - Corte clasico'
  join services_demo s2 on s2.name = 'DEMO - Corte + barba'
  join services_demo s3 on s3.name = 'DEMO - Barba express'
  join services_demo s4 on s4.name = 'DEMO - Tratamiento capilar'
)
insert into public.appointments (
  business_id,
  customer_id,
  service_id,
  starts_at,
  ends_at,
  status,
  internal_notes
)
select
  business_id,
  customer_id,
  service_id,
  starts_at,
  starts_at + (duration_minutes || ' minutes')::interval,
  status::public.appointment_status,
  internal_notes
from (
  select
    r.business_id,
    r.customer_1 as customer_id,
    r.service_1 as service_id,
    r.t1 as starts_at,
    r.dur_1 as duration_minutes,
    'pending' as status,
    '[DEMO] Cita pronta para mostrar confirmacion por WhatsApp.' as internal_notes
  from rows r
  union all
  select
    r.business_id,
    r.customer_2,
    r.service_2,
    r.t2,
    r.dur_2,
    'confirmed',
    '[DEMO] Cita confirmada para cambiar estado en vivo.'
  from rows r
  union all
  select
    r.business_id,
    r.customer_3,
    r.service_3,
    r.t3,
    r.dur_3,
    'pending',
    '[DEMO] Cita pendiente para recordatorio.'
  from rows r
  union all
  select
    r.business_id,
    r.customer_4,
    r.service_4,
    r.t4,
    r.dur_4,
    'completed',
    '[DEMO] Cita completada para historial.'
  from rows r
  union all
  select
    r.business_id,
    r.customer_5,
    r.service_2,
    r.t5,
    r.dur_2,
    'cancelled',
    '[DEMO] Cita cancelada para bloque de seguimiento.'
  from rows r
  union all
  select
    r.business_id,
    r.customer_1,
    r.service_3,
    r.t6,
    r.dur_3,
    'pending',
    '[DEMO] Cita futura para proximas citas.'
  from rows r
) data_rows;

commit;
