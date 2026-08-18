# Thiết kế: Trang quản trị (Admin Panel) — Hương Việt

## 1. Mục tiêu & phạm vi

Xây dựng khu vực `/admin/**` để chủ nhà hàng tự quản lý nội dung website (món ăn, danh mục, thông tin nhà hàng, ảnh gallery) mà không cần sửa code hay vào thẳng Supabase Dashboard.

**Trong phạm vi đợt này:**
- Đăng nhập/đăng xuất admin (Supabase Auth, allowlist qua bảng `admin_users` đã có sẵn).
- Dashboard: số liệu tổng quan.
- CRUD món ăn (kèm upload ảnh, kéo-thả sắp xếp thứ tự).
- CRUD danh mục (kéo-thả sắp xếp thứ tự).
- Sửa thông tin nhà hàng (form 1 dòng duy nhất, kèm upload logo/ảnh hero).
- Quản lý gallery (upload nhiều ảnh, chú thích VI/EN, kéo-thả sắp xếp, xoá).
- Middleware bảo vệ toàn bộ `/admin/**` trừ `/admin/login`.
- Build + chạy local, tự kiểm thử đầy đủ (không deploy).

**Ngoài phạm vi (đợt sau hoặc không làm):**
- Deploy lên Vercel.
- Đa admin / phân quyền chi tiết theo vai trò.
- Nén/resize ảnh phía client (chỉ validate định dạng + dung lượng).
- Đổi mật khẩu admin trong giao diện (chủ quán tự đổi qua Supabase Dashboard hoặc email reset của Supabase Auth).

## 2. Quyết định kiến trúc đã chốt (brainstorming)

| Quyết định | Lựa chọn |
|---|---|
| UI library | shadcn/ui (copy source component vào repo, không phải cài package đóng gói) |
| Sắp xếp thứ tự | Kéo-thả, dùng `@dnd-kit/react` + `@dnd-kit/helpers` (bộ package v2 hiện tại của dnd-kit — đã xác nhận qua tài liệu chính thức rằng bộ cũ `@dnd-kit/core`/`sortable`/`utilities` đã thành legacy, có migration guide chuyển sang bộ mới, nên bắt đầu thẳng bằng bộ mới) |
| Xử lý ảnh upload | Không nén/resize — chỉ validate định dạng (jpg/png/webp) + dung lượng tối đa (5MB) trước khi upload |
| Mutation dữ liệu | Server Actions (Next.js 14) cho mọi CRUD dữ liệu bảng, dùng `createServerSupabaseClient()` đã có sẵn |
| Upload ảnh | Client-side trực tiếp lên Supabase Storage qua `createBrowserSupabaseClient()` (không qua Server Action — tránh phải nâng giới hạn body size mặc định 1MB của Server Actions, và đây là pattern phổ biến khi dùng Supabase + Next.js) |
| Phạm vi đợt này | Chỉ build + chạy local, không gộp deploy Vercel |

## 3. Cấu trúc route & layout

```
app/
  admin/
    login/
      page.tsx                # /admin/login — nằm NGOÀI layout có sidebar (sibling của (dashboard))
    (dashboard)/
      layout.tsx              # getUser() double-check + is_admin() double-check, sidebar cố định trái, theme sáng
      error.tsx                # error boundary đơn giản cho khu vực admin
      page.tsx                 # Dashboard /admin
      menu-items/
        page.tsx                 # Bảng danh sách + tìm kiếm + lọc theo danh mục
        new/page.tsx              # Form thêm món
        [id]/edit/page.tsx        # Form sửa món
      categories/
        page.tsx
        new/page.tsx
        [id]/edit/page.tsx
      restaurant-info/
        page.tsx                 # Form 1 dòng duy nhất (id=1)
      gallery/
        page.tsx                 # Upload nhiều ảnh + kéo-thả sắp xếp + xoá
  actions/
    menu-items.ts              # 'use server'
    categories.ts
    restaurant-info.ts
    gallery.ts
middleware.ts                  # Chặn /admin/** (trừ /admin/login)
components/
  admin/
    Sidebar.tsx
    ImageUploader.tsx
    ConfirmDeleteDialog.tsx
    SortableList.tsx           # Wrapper dùng chung cho menu-items/categories/gallery
    MenuItemForm.tsx
    CategoryForm.tsx
    RestaurantInfoForm.tsx
lib/
  validation/
    menu-item.ts                # zod schema
    category.ts
    restaurant-info.ts
    gallery-image.ts
  slug.ts                       # sinh slug từ tên danh mục
components/ui/                  # shadcn primitives: button, input, textarea, label,
                                 # select, table, dialog, sonner, card, form
```

`app/admin/` là một folder **thực** (không phải route group) để `/admin` thực sự xuất hiện trong URL — route group (dấu ngoặc đơn) không tự đóng góp segment URL, chỉ dùng để nhóm layout. Bên trong `app/admin/`, `(dashboard)` là route group lồng bên trong, gom `layout.tsx` (sidebar cố định trái, theme sáng, double-check `getUser()`/`is_admin()`) + toàn bộ trang quản trị (`page.tsx`, `menu-items/`, `categories/`, `restaurant-info/`, `gallery/`), tách biệt khỏi `app/admin/login/` (nằm ngoài `(dashboard)`, không có sidebar). `(dashboard)` không dùng chung `Navbar`/`Footer`/`LanguageProvider` với `(site)` — giao diện admin không song ngữ (chỉ dữ liệu nhập vào mới có 2 trường `_vi`/`_en`).

## 4. Luồng xác thực

**`middleware.ts`:**
- Dùng pattern `createServerClient` (`@supabase/ssr`) với `getAll`/`setAll` cookie, cùng cấu trúc với `lib/supabase/server.ts` hiện có nhưng dành riêng cho `NextRequest`/`NextResponse`.
- `matcher: ['/admin/:path*']`.
- Gọi `supabase.auth.getUser()` — **không** dùng `getSession()`, vì `getSession()` chỉ đọc cookie mà không xác thực với auth server (đã xác nhận qua tài liệu `@supabase/ssr` hiện tại: cookie phía server được đánh dấu `isServer: true`, không nên tin tưởng cho quyết định bảo mật).
- Không có `user` hợp lệ → redirect `/admin/login`, trừ khi request đang tới chính `/admin/login`.
- Có `user` nhưng gọi RPC `is_admin()` trả `false` → redirect `/admin/login?error=unauthorized`.
- Có `user` hợp lệ và đang ở `/admin/login` → redirect `/admin` (đã đăng nhập rồi thì không cần thấy form login nữa).

**`/admin/login`:** Client Component, form email/password → `createBrowserSupabaseClient().auth.signInWithPassword()` → thành công thì `router.push('/admin')` + `router.refresh()`. Sai mật khẩu → hiển thị lỗi tại chỗ. Đăng nhập được nhưng không có trong `admin_users` → middleware sẽ redirect ngược lại kèm `?error=unauthorized`, trang login đọc query param này để hiển thị "Tài khoản không có quyền truy cập".

**`app/admin/(dashboard)/layout.tsx`:** double-check `getUser()` + `is_admin()` một lần nữa (phòng thủ 2 lớp, không tin tưởng tuyệt đối middleware) trước khi render sidebar + children; nếu fail thì `redirect('/admin/login')`.

**Đăng xuất:** nút trong sidebar gọi `createBrowserSupabaseClient().auth.signOut()` rồi `router.push('/admin/login')`.

## 5. Server Actions & tầng dữ liệu

Mỗi resource có 1 file trong `app/actions/`, ví dụ `menu-items.ts`:

```ts
'use server';
export async function createMenuItem(formData: FormData): Promise<ActionResult>
export async function updateMenuItem(id: string, formData: FormData): Promise<ActionResult>
export async function deleteMenuItem(id: string): Promise<ActionResult>
export async function reorderMenuItems(orderedIds: string[]): Promise<ActionResult>
```

`ActionResult = { success: true } | { success: false; error: string }` — action không `throw` cho lỗi nghiệp vụ/validate (form cần đọc lỗi để hiển thị), chỉ để lỗi hạ tầng thật sự bất ngờ propagate lên `error.tsx`.

Mỗi action: `createServerSupabaseClient()` → `zod` schema `.safeParse()` re-validate (không tin dữ liệu client gửi, dù form đã validate) → nếu invalid trả lỗi field-level → nếu valid, thực hiện insert/update/delete (RLS `is_admin()` tự chặn nếu không phải admin — phòng thủ lớp thứ 3 sau middleware và layout) → `revalidatePath()` các trang công khai liên quan (`/`, `/menu` cho menu-items/categories; `/`, `/gallery` cho gallery; mọi route cho restaurant-info vì nó nằm trong `(site)/layout.tsx`).

`reorderMenuItems`/`reorderCategories`/`reorderGalleryImages` nhận mảng ID theo thứ tự mới, `upsert` hàng loạt `{id, display_order}` trong 1 lệnh.

## 6. Upload ảnh

`components/admin/ImageUploader.tsx` (Client Component):
1. Chọn file → validate ngay: đúng định dạng (`image/jpeg`, `image/png`, `image/webp`) + dung lượng ≤ 5MB. Sai → báo lỗi tại chỗ, không upload.
2. `createBrowserSupabaseClient().storage.from(bucket).upload(path, file)` — `bucket` là `'dish-images'` (món ăn) hoặc `'site-media'` (logo/hero/gallery). `path` đặt tên bằng UUID + phần mở rộng gốc, tránh trùng tên.
3. Lấy `getPublicUrl()`, gọi callback trả URL về form cha. Form cha giữ URL trong state — **chưa** ghi vào DB ngay, chỉ ghi khi bấm Lưu (qua Server Action ở mục 5).
4. Nếu form đang sửa và ảnh cũ bị thay bằng ảnh mới: sau khi Server Action lưu URL mới thành công, gọi thêm `storage.from(bucket).remove([oldPath])` để dọn file cũ (tránh rò rỉ dung lượng Storage theo thời gian).

**Rủi ro chấp nhận được:** nếu Server Action lưu URL thất bại sau khi ảnh mới đã upload xong, file mới trở thành "mồ côi" trong Storage (tồn tại nhưng không có row nào tham chiếu tới) — vô hại (không ảnh hưởng dữ liệu hiển thị), chỉ tốn một ít dung lượng. Không xử lý tự động ở đợt này (dọn thủ công qua Supabase Dashboard nếu cần); không phải rollback phức tạp cho một trường hợp hiếm và vô hại.

## 7. Component & sắp xếp kéo-thả

**shadcn/ui** (copy source, không phải npm package đóng gói): `Button`, `Input`, `Textarea`, `Label`, `Select`, `Table`, `Dialog`, `Sonner` (toast), `Card`, `Form` (bọc `react-hook-form`). Dependency nền: `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `@radix-ui/react-*` (theo từng component cụ thể cần).

**Kéo-thả:** `@dnd-kit/react` + `@dnd-kit/helpers` (`DragDropProvider`, `useSortable({id, index})`, helper `move()`). Dùng cho 3 nơi: danh sách món ăn trong 1 danh mục, danh sách danh mục, lưới ảnh gallery. Sau khi thả, gọi Server Action `reorderX` tương ứng với mảng ID mới.

## 8. Dashboard (`/admin`)

Server Component, 4 câu `count: 'exact', head: true` song song: tổng món ăn, món hết hàng (`is_available = false`), số danh mục, số ảnh gallery. Hiển thị bằng `Card`, mỗi ô có link tắt tới trang quản lý tương ứng.

## 9. Xử lý lỗi & validate

- Schema `zod` dùng chung giữa client (`zodResolver` của react-hook-form, validate tức thời) và server action (re-validate trước khi ghi DB).
- Lỗi Supabase trong action → bắt lại, trả `ActionResult` lỗi, form hiển thị bằng `Sonner` toast đỏ, không throw.
- `getUser()`/`is_admin()` lỗi kết nối (không phải "không có quyền" mà lỗi hạ tầng thật) → coi như chưa xác thực, redirect `/admin/login` (an toàn hơn để lộ trang quản trị khi không chắc).
- Xoá có xác nhận qua `ConfirmDeleteDialog` (shadcn `Dialog`), không dùng `confirm()` của trình duyệt.
- `app/admin/(dashboard)/error.tsx`: error boundary đơn giản, không cần tinh chỉnh nhiều như site công khai vì đây là khu vực chỉ admin thấy. Chỉ bắt lỗi từ các trang bên trong `(dashboard)`, không bắt lỗi ném ra từ chính `(dashboard)/layout.tsx` — lỗi đó rơi xuống `app/error.tsx` ở cấp cao hơn.

## 10. Chiến lược test (TDD)

Test đơn vị cho phần logic thuần + component tương tác (RED→GREEN trước khi code):
- `zod` schemas: input hợp lệ/không hợp lệ cho từng resource.
- `lib/slug.ts`: sinh slug từ tên danh mục (chuẩn hoá dấu tiếng Việt, khoảng trắng, ký tự đặc biệt).
- Component form: render đúng field, hiển thị lỗi validate, gọi đúng callback khi submit (RTL + fake Supabase client theo mẫu `test-helpers.ts` đã có).
- `ConfirmDeleteDialog`: mở/đóng, gọi đúng callback khi xác nhận.

Không test đơn vị sâu (verify bằng chạy thật thay vì mock che hết giá trị test — bài học từ review cuối đợt site công khai):
- Server Actions gọi Supabase thật, middleware xác thực thật, luồng upload ảnh thật lên Storage.
- Verify bằng: đăng nhập thật, thêm/sửa/xoá/kéo-thả thật trên dữ liệu thật, kiểm tra hiển thị ngay trên site khách sau mỗi thao tác, thử truy cập `/admin` khi chưa đăng nhập (phải bị redirect), thử responsive trên viewport khả dụng của môi trường.

## 11. Dependency mới cần thêm

`react-hook-form`, `zod`, `@hookform/resolvers`, `@dnd-kit/react`, `@dnd-kit/helpers`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `sonner`, cùng các `@radix-ui/react-*` package mà từng shadcn component cụ thể cần (dialog, select, label, slot...).

## 12. Rủi ro / lưu ý mang sang từ đợt trước

- `restaurant_info.map_embed_url` hiện là URL giả — nên là việc đầu tiên chủ quán sửa qua trang admin sau khi đợt này xong.
- Mật khẩu admin đã lộ trong lịch sử chat — nên đổi qua Supabase Dashboard, không phải việc của đợt này (đợt này không có tính năng đổi mật khẩu trong UI).
- `npm audit` còn tồn dư một số lỗ hổng High/Moderate ở Next.js 14.x — không tăng thêm rủi ro mới trong đợt này vì không đổi version Next, nhưng cũng không tự hết.
