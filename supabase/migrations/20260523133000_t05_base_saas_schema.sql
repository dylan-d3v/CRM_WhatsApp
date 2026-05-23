-- T05 - Migraciones base SaaS
-- Esquema inicial multi-negocio con aislamiento por business_id.

create extension if not exists pgcrypto;

create type public.business_member_role as enum ('owner', 'staff');
create type public.appointment_status as enum ('pending', 'confirmed', 'completed', 'cancelled');
create type public.message_template_type as enum ('confirmation', 'reminder', 'reschedule', 'thank_you');

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  phone text,
  timezone text not null default 'America/Guayaquil',
  created_at timestamptz not null default timezone('utc', now())
);

create table public.business_members (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.business_member_role not null default 'staff',
  created_at timestamptz not null default timezone('utc', now()),
  unique (business_id, user_id)
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  phone text not null,
  phone_e164 text,
  notes text,
  last_visit_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  duration_minutes integer not null check (duration_minutes > 0),
  price numeric(10, 2) not null check (price >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  customer_id uuid not null references public.customers (id) on delete restrict,
  service_id uuid not null references public.services (id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.appointment_status not null default 'pending',
  internal_notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (ends_at > starts_at)
);

create table public.message_templates (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  type public.message_template_type not null,
  title text not null,
  body text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (business_id, type)
);

create table public.message_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  customer_id uuid not null references public.customers (id) on delete restrict,
  appointment_id uuid references public.appointments (id) on delete set null,
  template_type text not null,
  whatsapp_url_opened_at timestamptz not null default timezone('utc', now()),
  created_by uuid not null references auth.users (id) on delete restrict
);

create index idx_business_members_user_id on public.business_members (user_id);
create index idx_business_members_business_id on public.business_members (business_id);
create index idx_customers_business_id on public.customers (business_id);
create index idx_customers_phone on public.customers (phone);
create index idx_services_business_id on public.services (business_id);
create index idx_appointments_business_id on public.appointments (business_id);
create index idx_appointments_starts_at on public.appointments (starts_at);
create index idx_appointments_status on public.appointments (status);
create index idx_message_templates_business_id on public.message_templates (business_id);
create index idx_message_events_business_id on public.message_events (business_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger trg_customers_set_updated_at
before update on public.customers
for each row
execute function public.set_updated_at();

create trigger trg_appointments_set_updated_at
before update on public.appointments
for each row
execute function public.set_updated_at();

create trigger trg_message_templates_set_updated_at
before update on public.message_templates
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_business_owner_membership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.business_members (business_id, user_id, role)
  values (new.id, new.owner_user_id, 'owner')
  on conflict (business_id, user_id) do nothing;

  return new;
end;
$$;

create trigger trg_businesses_owner_membership
after insert on public.businesses
for each row
execute function public.handle_new_business_owner_membership();

alter table public.businesses enable row level security;
alter table public.business_members enable row level security;
alter table public.customers enable row level security;
alter table public.services enable row level security;
alter table public.appointments enable row level security;
alter table public.message_templates enable row level security;
alter table public.message_events enable row level security;

create policy "businesses_select_members"
on public.businesses
for select
using (
  exists (
    select 1
    from public.business_members bm
    where bm.business_id = businesses.id
      and bm.user_id = auth.uid()
  )
);

create policy "businesses_insert_owner"
on public.businesses
for insert
with check (owner_user_id = auth.uid());

create policy "businesses_update_members"
on public.businesses
for update
using (
  exists (
    select 1
    from public.business_members bm
    where bm.business_id = businesses.id
      and bm.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.business_members bm
    where bm.business_id = businesses.id
      and bm.user_id = auth.uid()
  )
);

create policy "businesses_delete_owner"
on public.businesses
for delete
using (owner_user_id = auth.uid());

create policy "business_members_select_self_or_owner"
on public.business_members
for select
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.businesses b
    where b.id = business_members.business_id
      and b.owner_user_id = auth.uid()
  )
);

create policy "business_members_insert_owner"
on public.business_members
for insert
with check (
  exists (
    select 1
    from public.businesses b
    where b.id = business_members.business_id
      and b.owner_user_id = auth.uid()
  )
);

create policy "business_members_update_owner"
on public.business_members
for update
using (
  exists (
    select 1
    from public.businesses b
    where b.id = business_members.business_id
      and b.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.businesses b
    where b.id = business_members.business_id
      and b.owner_user_id = auth.uid()
  )
);

create policy "business_members_delete_owner"
on public.business_members
for delete
using (
  exists (
    select 1
    from public.businesses b
    where b.id = business_members.business_id
      and b.owner_user_id = auth.uid()
  )
);

create policy "customers_select_members"
on public.customers
for select
using (
  exists (
    select 1
    from public.business_members bm
    where bm.business_id = customers.business_id
      and bm.user_id = auth.uid()
  )
);

create policy "customers_insert_members"
on public.customers
for insert
with check (
  exists (
    select 1
    from public.business_members bm
    where bm.business_id = customers.business_id
      and bm.user_id = auth.uid()
  )
);

create policy "customers_update_members"
on public.customers
for update
using (
  exists (
    select 1
    from public.business_members bm
    where bm.business_id = customers.business_id
      and bm.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.business_members bm
    where bm.business_id = customers.business_id
      and bm.user_id = auth.uid()
  )
);

create policy "customers_delete_members"
on public.customers
for delete
using (
  exists (
    select 1
    from public.business_members bm
    where bm.business_id = customers.business_id
      and bm.user_id = auth.uid()
  )
);

create policy "services_select_members"
on public.services
for select
using (
  exists (
    select 1
    from public.business_members bm
    where bm.business_id = services.business_id
      and bm.user_id = auth.uid()
  )
);

create policy "services_insert_members"
on public.services
for insert
with check (
  exists (
    select 1
    from public.business_members bm
    where bm.business_id = services.business_id
      and bm.user_id = auth.uid()
  )
);

create policy "services_update_members"
on public.services
for update
using (
  exists (
    select 1
    from public.business_members bm
    where bm.business_id = services.business_id
      and bm.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.business_members bm
    where bm.business_id = services.business_id
      and bm.user_id = auth.uid()
  )
);

create policy "services_delete_members"
on public.services
for delete
using (
  exists (
    select 1
    from public.business_members bm
    where bm.business_id = services.business_id
      and bm.user_id = auth.uid()
  )
);

create policy "appointments_select_members"
on public.appointments
for select
using (
  exists (
    select 1
    from public.business_members bm
    where bm.business_id = appointments.business_id
      and bm.user_id = auth.uid()
  )
);

create policy "appointments_insert_members"
on public.appointments
for insert
with check (
  exists (
    select 1
    from public.business_members bm
    where bm.business_id = appointments.business_id
      and bm.user_id = auth.uid()
  )
);

create policy "appointments_update_members"
on public.appointments
for update
using (
  exists (
    select 1
    from public.business_members bm
    where bm.business_id = appointments.business_id
      and bm.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.business_members bm
    where bm.business_id = appointments.business_id
      and bm.user_id = auth.uid()
  )
);

create policy "appointments_delete_members"
on public.appointments
for delete
using (
  exists (
    select 1
    from public.business_members bm
    where bm.business_id = appointments.business_id
      and bm.user_id = auth.uid()
  )
);

create policy "message_templates_select_members"
on public.message_templates
for select
using (
  exists (
    select 1
    from public.business_members bm
    where bm.business_id = message_templates.business_id
      and bm.user_id = auth.uid()
  )
);

create policy "message_templates_insert_members"
on public.message_templates
for insert
with check (
  exists (
    select 1
    from public.business_members bm
    where bm.business_id = message_templates.business_id
      and bm.user_id = auth.uid()
  )
);

create policy "message_templates_update_members"
on public.message_templates
for update
using (
  exists (
    select 1
    from public.business_members bm
    where bm.business_id = message_templates.business_id
      and bm.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.business_members bm
    where bm.business_id = message_templates.business_id
      and bm.user_id = auth.uid()
  )
);

create policy "message_templates_delete_members"
on public.message_templates
for delete
using (
  exists (
    select 1
    from public.business_members bm
    where bm.business_id = message_templates.business_id
      and bm.user_id = auth.uid()
  )
);

create policy "message_events_select_members"
on public.message_events
for select
using (
  exists (
    select 1
    from public.business_members bm
    where bm.business_id = message_events.business_id
      and bm.user_id = auth.uid()
  )
);

create policy "message_events_insert_members"
on public.message_events
for insert
with check (
  exists (
    select 1
    from public.business_members bm
    where bm.business_id = message_events.business_id
      and bm.user_id = auth.uid()
  )
);

create policy "message_events_update_members"
on public.message_events
for update
using (
  exists (
    select 1
    from public.business_members bm
    where bm.business_id = message_events.business_id
      and bm.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.business_members bm
    where bm.business_id = message_events.business_id
      and bm.user_id = auth.uid()
  )
);

create policy "message_events_delete_members"
on public.message_events
for delete
using (
  exists (
    select 1
    from public.business_members bm
    where bm.business_id = message_events.business_id
      and bm.user_id = auth.uid()
  )
);
