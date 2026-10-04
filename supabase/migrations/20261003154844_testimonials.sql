-- Customer feedback is published only after an administrator has permission to share it.
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null check (char_length(btrim(customer_name)) between 2 and 120),
  event_label text not null default '' check (char_length(event_label) <= 120),
  quote_vi text not null check (char_length(btrim(quote_vi)) between 20 and 1200),
  quote_en text not null default '' check (char_length(quote_en) <= 1200),
  rating integer not null default 5 check (rating between 1 and 5),
  is_published boolean not null default false,
  display_order integer not null default 0 check (display_order between 0 and 9999),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index testimonials_public_order_idx on public.testimonials (display_order, created_at desc)
  where is_published;
create trigger trg_testimonials_updated_at before update on public.testimonials
for each row execute function public.set_updated_at();

alter table public.testimonials enable row level security;
revoke all on public.testimonials from anon, authenticated;
grant select on public.testimonials to anon, authenticated;
grant insert, update, delete on public.testimonials to authenticated;

create policy "public_read_published_testimonials" on public.testimonials
for select to anon, authenticated using (is_published or public.is_admin());
create policy "admin_insert_testimonials" on public.testimonials
for insert to authenticated with check (public.is_admin());
create policy "admin_update_testimonials" on public.testimonials
for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_delete_testimonials" on public.testimonials
for delete to authenticated using (public.is_admin());
