-- Execute este script no SQL Editor do Supabase.
create table if not exists public.operators (
  id text primary key,
  first_name text not null,
  last_name text not null default '',
  name text not null,
  sector text not null,
  machine text not null,
  badge text not null,
  email text,
  phone text,
  notes text,
  avatar_url text
);

create table if not exists public.withdrawals (
  id text primary key,
  tool_id text not null,
  tool_name text not null,
  spec text not null,
  operator_id text not null,
  operator_name text not null,
  sector text not null,
  machine text not null,
  date_retirada timestamptz not null,
  date_devolucao timestamptz,
  expected_return timestamptz,
  status text not null check (status in ('active', 'returned', 'overdue')),
  notes text,
  transferred_from text,
  transferred_at timestamptz,
  is_overtime boolean not null default false,
  overtime_until text
);

create index if not exists withdrawals_status_idx on public.withdrawals(status);
create index if not exists withdrawals_date_retirada_idx on public.withdrawals(date_retirada desc);

alter table public.operators enable row level security;
alter table public.withdrawals enable row level security;

create policy "public read operators" on public.operators for select using (true);
create policy "public write operators" on public.operators for insert with check (true);
create policy "public update operators" on public.operators for update using (true) with check (true);

create policy "public read withdrawals" on public.withdrawals for select using (true);
create policy "public write withdrawals" on public.withdrawals for insert with check (true);
create policy "public update withdrawals" on public.withdrawals for update using (true) with check (true);
