-- Event packages and private enquiries for the wedding/event website.
create table if not exists public.event_packages (
  id uuid primary key default gen_random_uuid(),
  name_vi text not null,
  name_en text not null default '',
  description_vi text not null default '',
  description_en text not null default '',
  image_url text not null default '',
  starting_price numeric(12,0) check (starting_price >= 0),
  inclusions_vi text[] not null default '{}',
  inclusions_en text[] not null default '{}',
  is_featured boolean not null default false,
  is_active boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  phone text not null check (char_length(phone) between 9 and 18),
  email text not null check (char_length(email) <= 254),
  event_type text not null check (event_type in ('wedding', 'corporate', 'private', 'other')),
  event_date date not null,
  guests integer not null check (guests between 1 and 5000),
  budget text not null default '' check (char_length(budget) <= 120),
  message text not null default '' check (char_length(message) <= 2000),
  status text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'confirmed', 'closed')),
  staff_note text not null default '' check (char_length(staff_note) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists event_inquiries_status_created_idx on public.event_inquiries (status, created_at desc);
create index if not exists event_inquiries_date_idx on public.event_inquiries (event_date);

create trigger trg_event_packages_updated_at before update on public.event_packages
for each row execute function public.set_updated_at();
create trigger trg_event_inquiries_updated_at before update on public.event_inquiries
for each row execute function public.set_updated_at();

alter table public.event_packages enable row level security;
alter table public.event_inquiries enable row level security;

revoke all on public.event_packages from anon, authenticated;
revoke all on public.event_inquiries from anon, authenticated;
grant select on public.event_packages to anon, authenticated;
grant insert, update, delete on public.event_packages to authenticated;
grant insert (name, phone, email, event_type, event_date, guests, budget, message) on public.event_inquiries to anon;
grant select, insert, update on public.event_inquiries to authenticated;

create policy "public_read_active_event_packages" on public.event_packages
for select to anon, authenticated using (is_active or public.is_admin());
create policy "admin_insert_event_packages" on public.event_packages
for insert to authenticated with check (public.is_admin());
create policy "admin_update_event_packages" on public.event_packages
for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_delete_event_packages" on public.event_packages
for delete to authenticated using (public.is_admin());

create policy "public_create_event_inquiries" on public.event_inquiries
for insert to anon with check (
  status = 'new' and staff_note = '' and event_date >= current_date
);
create policy "admin_read_event_inquiries" on public.event_inquiries
for select to authenticated using (public.is_admin());
create policy "admin_update_event_inquiries" on public.event_inquiries
for update to authenticated using (public.is_admin()) with check (public.is_admin());
