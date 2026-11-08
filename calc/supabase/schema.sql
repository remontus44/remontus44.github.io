-- Ремонтус44 — таблица заказов для Supabase.
-- Выполнить целиком в Supabase → SQL Editor → New query → Run.
-- После этого создать пользователя: Authentication → Users → Add user
-- (email + пароль, включить Auto Confirm), либо зарегистрироваться в приложении
-- и подтвердить почту.

create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  order_date date not null default current_date,
  status text not null default 'done' check (status in ('done', 'draft', 'canceled')),
  vin text not null default '',
  make text not null default '',
  model text not null default '',
  plate text not null default '',
  owner_name text not null default '',
  owner_phone text not null default '',
  note text not null default '',
  items jsonb not null default '[]'::jsonb,
  client_total numeric(12, 2) not null default 0,
  cost_total numeric(12, 2) not null default 0,
  counted_client numeric(12, 2) not null default 0,
  counted_cost numeric(12, 2) not null default 0,
  earnings numeric(12, 2) not null default 0,
  revenue numeric(12, 2) not null default 0,
  constraint orders_items_is_array check (jsonb_typeof(items) = 'array')
);

alter table public.orders enable row level security;

drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own"
  on public.orders for select
  using (auth.uid() = user_id);

drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own"
  on public.orders for insert
  with check (auth.uid() = user_id);

drop policy if exists "orders_update_own" on public.orders;
create policy "orders_update_own"
  on public.orders for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "orders_delete_own" on public.orders;
create policy "orders_delete_own"
  on public.orders for delete
  using (auth.uid() = user_id);

create index if not exists orders_user_date_idx
  on public.orders (user_id, order_date desc);

create or replace function public.orders_touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at
  before update on public.orders
  for each row execute function public.orders_touch_updated_at();

-- Доступ только вошедшим пользователям; строки ограничены RLS.
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.orders to authenticated;
revoke all on public.orders from anon;

-- Проверка: после входа в приложении заказ должен появиться в Table Editor.
