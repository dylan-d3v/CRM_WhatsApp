-- Fix RLS recursion between businesses and business_members policies.
-- Policies should not directly query tables whose policies query back into them.

create or replace function public.is_business_member(target_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.business_members bm
    where bm.business_id = target_business_id
      and bm.user_id = auth.uid()
  );
$$;

create or replace function public.is_business_owner(target_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.businesses b
    where b.id = target_business_id
      and b.owner_user_id = auth.uid()
  );
$$;

grant execute on function public.is_business_member(uuid) to authenticated;
grant execute on function public.is_business_owner(uuid) to authenticated;

drop policy if exists "businesses_select_members" on public.businesses;
drop policy if exists "businesses_update_members" on public.businesses;
drop policy if exists "businesses_delete_owner" on public.businesses;

drop policy if exists "business_members_select_self_or_owner" on public.business_members;
drop policy if exists "business_members_insert_owner" on public.business_members;
drop policy if exists "business_members_update_owner" on public.business_members;
drop policy if exists "business_members_delete_owner" on public.business_members;

create policy "businesses_select_members"
on public.businesses
for select
using (
  owner_user_id = auth.uid()
  or public.is_business_member(id)
);

create policy "businesses_update_members"
on public.businesses
for update
using (
  owner_user_id = auth.uid()
  or public.is_business_member(id)
)
with check (
  owner_user_id = auth.uid()
  or public.is_business_member(id)
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
  or public.is_business_owner(business_id)
);

create policy "business_members_insert_owner"
on public.business_members
for insert
with check (public.is_business_owner(business_id));

create policy "business_members_update_owner"
on public.business_members
for update
using (public.is_business_owner(business_id))
with check (public.is_business_owner(business_id));

create policy "business_members_delete_owner"
on public.business_members
for delete
using (public.is_business_owner(business_id));
