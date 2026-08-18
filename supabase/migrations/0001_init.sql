-- Bật extension cần thiết
create extension if not exists "pgcrypto";

-- ========== BẢNG DANH MỤC MENU ==========
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name_vi text not null,
  name_en text not null,
  slug text not null unique,
  description_vi text default '',
  description_en text default '',
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ========== BẢNG MÓN ĂN ==========
create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name_vi text not null,
  name_en text not null,
  description_vi text default '',
  description_en text default '',
  price numeric(12,0) not null check (price >= 0),
  image_url text default '',
  is_available boolean not null default true,
  is_featured boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ========== BẢNG THÔNG TIN NHÀ HÀNG (chỉ 1 dòng duy nhất) ==========
create table public.restaurant_info (
  id smallint primary key default 1,
  name_vi text not null,
  name_en text not null,
  tagline_vi text default '',
  tagline_en text default '',
  description_vi text default '',
  description_en text default '',
  address text default '',
  phone text default '',
  email text default '',
  opening_hours text default '',
  map_embed_url text default '',
  facebook_url text default '',
  instagram_url text default '',
  logo_url text default '',
  hero_image_url text default '',
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);

-- ========== BẢNG THƯ VIỆN HÌNH ẢNH (GALLERY) ==========
create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption_vi text default '',
  caption_en text default '',
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ========== BẢNG ALLOWLIST ADMIN ==========
create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text default '',
  created_at timestamptz not null default now()
);

-- ========== HÀM KIỂM TRA QUYỀN ADMIN ==========
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

-- ========== TRIGGER updated_at cho menu_items ==========
create or replace function public.set_updated_at()
returns trigger language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_menu_items_updated_at
before update on public.menu_items
for each row execute function public.set_updated_at();

-- ========== ROW LEVEL SECURITY ==========
alter table public.categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.restaurant_info enable row level security;
alter table public.gallery_images enable row level security;
alter table public.admin_users enable row level security;

-- Public: ai cũng xem được (SELECT)
create policy "public_read_categories" on public.categories for select using (true);
create policy "public_read_menu_items" on public.menu_items for select using (true);
create policy "public_read_restaurant_info" on public.restaurant_info for select using (true);
create policy "public_read_gallery_images" on public.gallery_images for select using (true);

-- Admin: toàn quyền thêm/sửa/xoá
create policy "admin_write_categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "admin_write_menu_items" on public.menu_items for all using (public.is_admin()) with check (public.is_admin());
create policy "admin_write_restaurant_info" on public.restaurant_info for all using (public.is_admin()) with check (public.is_admin());
create policy "admin_write_gallery_images" on public.gallery_images for all using (public.is_admin()) with check (public.is_admin());

-- admin_users: mỗi user chỉ xem được chính mình (dùng để FE kiểm tra quyền)
create policy "self_read_admin_users" on public.admin_users for select using (auth.uid() = user_id);

-- ========== STORAGE BUCKETS ==========
insert into storage.buckets (id, name, public) values ('dish-images', 'dish-images', true);
insert into storage.buckets (id, name, public) values ('site-media', 'site-media', true);

create policy "public_read_dish_images" on storage.objects for select using (bucket_id = 'dish-images');
create policy "admin_write_dish_images" on storage.objects for all
  using (bucket_id = 'dish-images' and public.is_admin())
  with check (bucket_id = 'dish-images' and public.is_admin());

create policy "public_read_site_media" on storage.objects for select using (bucket_id = 'site-media');
create policy "admin_write_site_media" on storage.objects for all
  using (bucket_id = 'site-media' and public.is_admin())
  with check (bucket_id = 'site-media' and public.is_admin());
