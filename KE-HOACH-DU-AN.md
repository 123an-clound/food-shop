# KẾ HOẠCH DỰ ÁN (LƯU TRỮ): Website Nhà Hàng "Hương Việt" + Trang Quản Trị (Admin)

> Kế hoạch ban đầu này không còn phản ánh giao diện tiệc cưới và sự kiện hiện tại. Xem `README.md` để biết chức năng và cách chạy mới.

> File này được soạn để đưa cho **Claude Code** thực hiện xây dựng toàn bộ dự án (frontend nhà hàng + trang admin + kết nối Supabase) từ đầu đến cuối. Mọi quyết định kỹ thuật, schema database, nội dung mẫu đều đã được chốt sẵn trong file này để Claude Code không cần đoán mò.

---

## 0. Tóm tắt các quyết định đã chốt (đọc trước)

| Hạng mục | Quyết định |
|---|---|
| Phạm vi tính năng (v1) | Chỉ website trưng bày menu + thông tin nhà hàng. **Không** làm đặt bàn / đặt món online / đánh giá ở giai đoạn này (để mở rộng sau). |
| Tech stack | Next.js (App Router) + TypeScript + Tailwind CSS + Supabase (Database, Auth, Storage) |
| Loại hình quán | Nhà hàng cao cấp / fine-dining Việt Nam |
| Ngôn ngữ | Song ngữ Việt – Anh (mặc định tiếng Việt) |
| Trang admin quản lý | Món ăn + danh mục menu, thông tin nhà hàng chung, thư viện hình ảnh (gallery) |
| Đăng nhập admin | Supabase Auth (email/mật khẩu), có bảng allowlist `admin_users` |
| Supabase project | **Tạo project Supabase MỚI, riêng biệt** cho dự án này (không dùng chung với project cà phê hiện có `123an-clound's Project`, vì project đó đã có bảng `categories`/`menu_items` chứa dữ liệu của một quán cà phê khác — tránh xung đột) |
| Deploy | Vercel (miễn phí, phù hợp Next.js) |
| Tên & thông tin nhà hàng | Tự đặt (chi tiết ở mục 1) — có thể đổi lại bất cứ lúc nào, chỉ cần sửa dữ liệu trong bảng `restaurant_info` |

---

## 1. Hồ sơ thương hiệu (do Claude tự đặt, có thể chỉnh sửa sau)

- **Tên nhà hàng (VI):** Hương Việt
- **Tên (EN):** Huong Viet Fine Dining
- **Tagline (VI):** Tinh hoa ẩm thực ba miền
- **Tagline (EN):** The Soul of Vietnamese Cuisine
- **Câu chuyện thương hiệu:** Hương Việt tôn vinh tinh hoa ẩm thực Bắc – Trung – Nam, kết hợp kỹ thuật chế biến hiện đại với nguyên liệu bản địa cao cấp. Không gian sang trọng pha trộn nét truyền thống (sơn mài, gốm Bát Tràng, đèn lồng) với thiết kế đương đại.
- **Địa chỉ:** 15 Đồng Khởi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh
- **Điện thoại:** 028 3822 9999
- **Email:** contact@huongvietrestaurant.vn
- **Giờ mở cửa:** 11:00 – 14:00 (trưa) và 17:30 – 22:30 (tối), tất cả các ngày trong tuần
- **Mức giá:** Món khai vị/tráng miệng ~85.000đ–195.000đ, món chính ~165.000đ–890.000đ, set menu degustation 1.200.000đ–1.800.000đ/người (tham khảo, có thể chỉnh)
- **Bảng màu:** Đỏ đô/burgundy `#7A1F2B`, vàng đồng `#C9A24B`, than đen `#1C1A17`, trắng ngà `#F5F0E6`
- **Font chữ:** Heading dùng **Playfair Display** (serif sang trọng, hỗ trợ dấu tiếng Việt); nội dung dùng **Be Vietnam Pro** (sans-serif tối ưu cho tiếng Việt)

> Toàn bộ thông tin trên được lưu trong bảng `restaurant_info` trên Supabase — sau này chủ quán chỉnh sửa trực tiếp qua trang admin, không cần sửa code.

---

## 2. Kiến trúc kỹ thuật

- **Framework:** Next.js 14+ (App Router, Server Components + Server Actions)
- **Ngôn ngữ:** TypeScript
- **UI:** Tailwind CSS + shadcn/ui (cho các component admin: bảng dữ liệu, form, dialog, toast)
- **Backend/Data:** Supabase (Postgres + Row Level Security, Auth, Storage cho hình ảnh)
- **Hosting:** Vercel (Next.js) + Supabase Cloud (đã có sẵn hạ tầng)
- **1 codebase Next.js duy nhất**, chia 2 route group:
  - `(site)` — trang công khai cho khách
  - `(admin)` — trang quản trị, được bảo vệ bởi middleware kiểm tra đăng nhập + quyền admin

### Cấu trúc thư mục đề xuất

```
food-shop/
├── app/
│   ├── (site)/
│   │   ├── layout.tsx              # Header, Footer, LanguageProvider
│   │   ├── page.tsx                 # Trang chủ (Home)
│   │   ├── menu/page.tsx            # Thực đơn đầy đủ
│   │   ├── about/page.tsx           # Giới thiệu
│   │   ├── gallery/page.tsx         # Không gian nhà hàng
│   │   └── contact/page.tsx         # Liên hệ & bản đồ
│   ├── admin/
│   │   ├── login/page.tsx
│   │   ├── layout.tsx               # Kiểm tra session + is_admin, sidebar
│   │   ├── page.tsx                 # Dashboard tổng quan
│   │   ├── menu-items/
│   │   │   ├── page.tsx             # Danh sách món ăn (bảng, filter, search)
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/edit/page.tsx
│   │   ├── categories/page.tsx      # CRUD danh mục
│   │   ├── restaurant-info/page.tsx # Sửa thông tin nhà hàng
│   │   └── gallery/page.tsx         # Upload/xoá ảnh gallery
│   ├── layout.tsx                   # Root layout
│   └── globals.css
├── components/
│   ├── site/                        # Navbar, Footer, Hero, DishCard, CategoryTabs, MapEmbed
│   ├── admin/                       # Sidebar, DataTable, ImageUploader, DishForm, CategoryForm
│   └── ui/                          # shadcn/ui base components
├── lib/
│   ├── supabase/
│   │   ├── client.ts                # Supabase client (browser)
│   │   ├── server.ts                # Supabase client (server, cookies)
│   │   └── middleware.ts
│   ├── i18n/
│   │   ├── dictionaries.ts
│   │   └── LanguageProvider.tsx
│   └── types.ts                     # Kiểu dữ liệu (generate từ Supabase hoặc viết tay)
├── middleware.ts                     # Bảo vệ route /admin/**
├── supabase/
│   ├── migrations/0001_init.sql      # Toàn bộ schema + RLS + storage policies
│   └── seed.sql                      # Dữ liệu mẫu (thực đơn Hương Việt)
├── public/
├── .env.local.example
├── tailwind.config.ts
├── package.json
└── tsconfig.json
```

---

## 3. Thiết kế Database Supabase

### 3.1. Tạo project mới

1. Vào Supabase Dashboard → New Project.
2. Tên project: `huong-viet-restaurant` (hoặc tên do bạn chọn).
3. Region: `Southeast Asia (Singapore)` — gần Việt Nam nhất, độ trễ thấp.
4. Lưu lại: **Project URL**, **anon public key**, **service_role key** (dùng cho `.env.local`, không public key service_role lên client).

### 3.2. Schema SQL đầy đủ (`supabase/migrations/0001_init.sql`)

```sql
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
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

-- ========== TRIGGER updated_at cho menu_items ==========
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
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
```

### 3.3. Tạo tài khoản admin đầu tiên

1. Trong Supabase Dashboard → Authentication → Users → Add user, tạo tài khoản email/password cho chủ quán (ví dụ: `admin@huongvietrestaurant.vn`).
2. Copy `user_id` vừa tạo, chạy SQL:
   ```sql
   insert into public.admin_users (user_id, full_name) values ('<user_id>', 'Chủ nhà hàng');
   ```
3. Từ giờ tài khoản này đăng nhập được vào `/admin/login`.

### 3.4. Dữ liệu mẫu (`supabase/seed.sql`)

Thực đơn mẫu đầy đủ (7 danh mục, ~28 món) để website có nội dung ngay khi build xong. Claude Code sinh file SQL insert dựa trên bảng dưới đây (giá tính bằng VNĐ, không dấu chấm khi insert):

**Danh mục:**
1. Khai vị / Appetizers
2. Súp / Soups
3. Món chính – Hải sản / Seafood Mains
4. Món chính – Thịt & Gia cầm / Meat & Poultry Mains
5. Cơm & Mì, Bún / Rice & Noodles
6. Tráng miệng / Desserts
7. Đồ uống / Beverages

**Món ăn mẫu theo danh mục:**

*Khai vị:* Gỏi cuốn tôm thịt sốt me (165.000đ, featured), Chả giò hải sản (185.000đ), Gỏi bưởi tôm khô (175.000đ), Bò lá lốt nướng (195.000đ)

*Súp:* Súp măng cua (165.000đ, featured), Súp bào ngư tiềm thuốc bắc (320.000đ), Canh chua cá lăng (245.000đ)

*Món chính – Hải sản:* Cá song hấp xì dầu (480.000đ), Tôm hùm nướng phô mai (890.000đ, featured), Mực nhồi thịt sốt cà (285.000đ), Chả cá Lã Vọng (320.000đ)

*Món chính – Thịt & Gia cầm:* Bò lúc lắc truffle (385.000đ, featured), Vịt quay kiểu Việt (420.000đ), Heo sữa quay giòn bì (650.000đ), Gà nướng lá chanh (265.000đ), Sườn cừu nướng ngũ vị (590.000đ)

*Cơm & Mì, Bún:* Cơm sen Huế (165.000đ), Bún bò Huế đặc biệt (185.000đ), Phở bò Wagyu (285.000đ, featured), Mì Quảng tôm thịt (175.000đ), Cơm chiên hải sản thố đá (225.000đ)

*Tráng miệng:* Chè hạt sen long nhãn (95.000đ), Bánh flan cà phê (85.000đ), Kem xôi lá dứa (95.000đ, featured), Trái cây theo mùa (120.000đ)

*Đồ uống:* Trà sen Tây Hồ (85.000đ), Cà phê sữa đá (65.000đ), Nước ép trái cây tươi (75.000đ), Rượu vang đỏ - ly (195.000đ), Mocktail chanh sả gừng (95.000đ)

> Với mỗi món, sinh thêm mô tả ngắn (1 câu, tiếng Việt + tiếng Anh) phù hợp phong cách fine-dining. Ảnh món ăn ban đầu dùng ảnh placeholder (ví dụ từ Unsplash theo từ khoá món ăn Việt Nam) — admin sẽ thay ảnh thật sau qua trang quản trị.

Dữ liệu `restaurant_info` insert 1 dòng duy nhất dựa theo mục 1 (Hồ sơ thương hiệu) ở trên.

---

## 4. Trang nhà hàng (Public Site)

### Trang chủ (`/`)
- Hero full-width: ảnh nền nhà hàng + tên, tagline, nút CTA "Xem thực đơn"
- Giới thiệu ngắn (2-3 câu từ `restaurant_info.description`)
- 4-6 món nổi bật (`is_featured = true`), dạng thẻ ảnh + tên + giá
- Preview gallery (4-6 ảnh) + link "Xem thêm không gian"
- Thông tin liên hệ nhanh + giờ mở cửa ở footer

### Thực đơn (`/menu`)
- Tabs/danh mục theo `categories.display_order`
- Mỗi món: ảnh, tên (VI/EN theo ngôn ngữ đang chọn), mô tả, giá, badge "Hết món" nếu `is_available = false`
- Responsive: dạng lưới trên desktop, danh sách cuộn ngang danh mục trên mobile

### Giới thiệu (`/about`)
- Câu chuyện thương hiệu, triết lý ẩm thực, đầu bếp (có thể để placeholder)
- Ảnh không gian nhà hàng

### Không gian (`/gallery`)
- Lưới ảnh từ bảng `gallery_images`, có thể mở lightbox xem ảnh lớn

### Liên hệ (`/contact`)
- Địa chỉ, số điện thoại, email, giờ mở cửa (từ `restaurant_info`)
- Bản đồ nhúng (Google Maps iframe qua `map_embed_url`)
- Link mạng xã hội

### Ngôn ngữ
- Nút chuyển VI/EN ở header, lưu lựa chọn vào cookie/localStorage
- Tất cả nội dung động (món ăn, danh mục, thông tin nhà hàng) đều có 2 cột `_vi` / `_en` trong DB, component chỉ đổi field hiển thị theo ngôn ngữ đang chọn — không cần dịch runtime

---

## 5. Trang quản trị (Admin)

### Đăng nhập (`/admin/login`)
- Form email/password → `supabase.auth.signInWithPassword`
- Sau đăng nhập, middleware kiểm tra user có trong `admin_users` không; nếu không → đăng xuất + báo lỗi "Tài khoản không có quyền truy cập"

### Dashboard (`/admin`)
- Số liệu nhanh: tổng số món ăn, số món hết hàng, số danh mục, số ảnh gallery
- Lối tắt đến các mục quản lý

### Quản lý món ăn (`/admin/menu-items`)
- Bảng danh sách: ảnh nhỏ, tên, danh mục, giá, trạng thái còn/hết, nổi bật, nút sửa/xoá
- Tìm kiếm theo tên, lọc theo danh mục
- Form thêm/sửa: tên VI/EN, mô tả VI/EN, danh mục (select), giá, upload ảnh (lên bucket `dish-images`), toggle còn hàng/nổi bật, thứ tự hiển thị
- Xoá món ăn có xác nhận (dialog)

### Quản lý danh mục (`/admin/categories`)
- CRUD danh mục: tên VI/EN, slug (tự sinh từ tên), mô tả, thứ tự hiển thị (kéo-thả hoặc nhập số)

### Thông tin nhà hàng (`/admin/restaurant-info`)
- Form 1 dòng duy nhất: tên, tagline, mô tả, địa chỉ, sđt, email, giờ mở cửa, link bản đồ, mạng xã hội, logo, ảnh hero (upload lên bucket `site-media`)

### Thư viện ảnh (`/admin/gallery`)
- Upload nhiều ảnh cùng lúc lên `site-media`, thêm chú thích VI/EN, sắp xếp thứ tự, xoá ảnh

### Bảo vệ route
- `middleware.ts`: chặn mọi request tới `/admin/**` (trừ `/admin/login`) nếu chưa có session hoặc `is_admin()` trả về false → redirect về `/admin/login`

---

## 6. Thiết kế UI/UX

- Phong cách: sang trọng, ấm cúng, tối giản có điểm nhấn — nền màu ngà/trắng cho phần nội dung, các khối nhấn dùng đỏ đô + vàng đồng, chữ heading serif, ảnh full-bleed chất lượng cao
- Trang admin: giao diện dashboard hiện đại, sáng, rõ ràng (khác hẳn giao diện khách để dễ phân biệt) — có thể dùng theme sáng mặc định của shadcn/ui, sidebar cố định bên trái
- Responsive bắt buộc cho cả site khách lẫn admin (đa số chủ quán sẽ quản lý bằng điện thoại/tablet)
- Ảnh: dùng `next/image` để tối ưu, tỉ lệ khung ảnh món ăn cố định 4:3 hoặc 1:1 cho đều lưới

---

## 7. Biến môi trường (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-public-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # chỉ dùng ở server, không lộ ra client
```

---

## 8. Triển khai (Deploy)

1. Đẩy code lên GitHub repository.
2. Kết nối repo với Vercel → Import Project.
3. Khai báo 3 biến môi trường ở trên trong Vercel Project Settings → Environment Variables (cho cả Production và Preview).
4. Deploy — Vercel tự build Next.js.
5. Domain: dùng domain miễn phí `*.vercel.app` trước, sau này có thể gắn domain riêng (ví dụ `huongvietrestaurant.vn`) trong Vercel → Domains.
6. Kiểm tra lại RLS/Storage policies hoạt động đúng trên production (thử đăng nhập admin, thử upload ảnh, thử xem site ở chế độ ẩn danh).

---

## 9. Lộ trình thực hiện (checklist cho Claude Code làm theo thứ tự)

1. Khởi tạo project Next.js (TypeScript, Tailwind, App Router) và cài shadcn/ui
2. Tạo project Supabase mới, chạy migration `0001_init.sql`, tạo storage buckets + policies
3. Tạo tài khoản admin đầu tiên trong Supabase Auth + thêm vào bảng `admin_users`
4. Chạy `seed.sql` để có dữ liệu mẫu (danh mục, món ăn, thông tin nhà hàng)
5. Viết `lib/supabase/client.ts`, `server.ts`, `middleware.ts` kết nối Supabase
6. Xây dựng layout chung (Navbar, Footer, LanguageProvider) + hệ thống i18n VI/EN
7. Xây trang công khai: Trang chủ → Thực đơn → Giới thiệu → Gallery → Liên hệ
8. Xây middleware bảo vệ `/admin/**` + trang đăng nhập admin
9. Xây trang admin: Dashboard → Quản lý món ăn (CRUD + upload ảnh) → Quản lý danh mục → Thông tin nhà hàng → Gallery
10. Kiểm thử toàn bộ luồng: xem site ẩn danh, đăng nhập admin, thêm/sửa/xoá món ăn và kiểm tra hiển thị ngay trên site khách, đổi ngôn ngữ VI/EN, responsive trên mobile
11. Deploy lên Vercel, cấu hình biến môi trường, kiểm tra lại trên production
12. Bàn giao: hướng dẫn ngắn cho chủ quán cách đăng nhập admin và cập nhật menu/hình ảnh

---

## 10. Tính năng mở rộng trong tương lai (chưa làm ở v1)

- Đặt bàn online (reservation) — lưu vào bảng `reservations` mới
- Đặt món online / giỏ hàng — bảng `orders`, `order_items`
- Form liên hệ lưu vào DB + gửi email thông báo
- Đánh giá món ăn / nhà hàng từ khách
- Đa admin với phân quyền chi tiết (nhân viên chỉ sửa menu, chủ quán toàn quyền)
- SEO nâng cao (sitemap, structured data cho món ăn), phân tích lượt truy cập

---

## 11. Ghi chú quan trọng

- Toàn bộ nội dung thương hiệu (tên, địa chỉ, giá, món ăn...) trong file này là **dữ liệu mẫu do Claude tự đặt** theo yêu cầu — hoàn toàn có thể đổi tên nhà hàng, địa chỉ, món ăn... trước khi build hoặc sửa sau này qua trang admin mà không cần đụng code.
- Project Supabase hiện có (`123an-clound's Project`, ref: `xsspvdgnhelzprcqaiek`) đang phục vụ một website quán cà phê khác với cùng tên bảng — **không dùng chung** project này để tránh xoá nhầm dữ liệu. Dự án này cần một project Supabase mới, độc lập.

---

## 12. Quyết định bổ sung (chốt cùng người dùng ngày 2026-08-18)

- **Tạo Supabase project mới:** thực hiện trực tiếp qua Supabase MCP trong phiên làm việc, không yêu cầu người dùng tự thao tác trên Dashboard.
- **Tài khoản admin đầu tiên:** email `phamtuanan3939@gmail.com`, tạo qua Supabase Auth Admin API rồi thêm vào bảng `admin_users`. Mật khẩu ban đầu được người dùng cung cấp trực tiếp trong chat — chỉ dùng một lần để tạo tài khoản, không lưu vào code/file/log của repo. **Người dùng cần tự đổi mật khẩu này sau khi đăng nhập lần đầu** vì nó đã xuất hiện trong lịch sử chat.
- **Phạm vi lần triển khai này:** dừng ở bước build code + kết nối Supabase thật + chạy local để duyệt (tương ứng bước 1–10 trong mục 9). **Chưa** thực hiện bước 11 (đẩy GitHub + deploy Vercel) — sẽ làm ở lượt sau khi người dùng duyệt giao diện.
