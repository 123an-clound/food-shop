# Hương Việt · Tiệc cưới & sự kiện

Website tiếng Việt cho dịch vụ nhà hàng tiệc cưới, tổ chức sự kiện và thực đơn món Việt. Xây bằng Next.js 16 App Router, React, TypeScript, Tailwind CSS và Supabase. Có giao diện tiếng Anh phụ trợ.

## Chạy dự án

1. Cài Node.js và chạy `npm ci`.
2. Tạo `.env.local` từ `.env.local.example`, điền URL và anon key của Supabase. Đặt `NEXT_PUBLIC_SITE_URL` bằng URL website khi triển khai.
3. Áp dụng các migration trong `supabase/migrations/` theo thứ tự, gồm `0003_event_management.sql`, `0004_event_inquiry_constraints.sql` và `20261003154844_testimonials.sql`. Các migration này đã được áp dụng vào Supabase đang dùng trong môi trường phát triển của dự án.
4. Chạy `npm run dev`. Mở `http://localhost:3000`.

Các lệnh kiểm tra: `npm run lint`, `npm run test`, `npm run build`, `npm audit --omit=dev`.

## Chức năng

- Trang công khai: slideshow, dịch vụ tiệc cưới / doanh nghiệp / tiệc riêng, gói tiệc, thực đơn, thư viện ảnh, FAQ và biểu mẫu tư vấn. Giao diện responsive, hỗ trợ bàn phím và giảm chuyển động.
- Biểu mẫu lưu yêu cầu trong `event_inquiries`; xác thực ở client và server. Thông báo thành công chỉ hiện sau khi dữ liệu được lưu. Đây là **yêu cầu tư vấn**, chưa phải xác nhận đặt tiệc. Chưa có gửi email tự động.
- `/admin`: đăng nhập với Supabase Auth và bảng `admin_users`; dashboard, tìm kiếm/lọc/cập nhật trạng thái/ghi chú và xuất CSV yêu cầu; tạo sửa xoá, bật/tắt gói tiệc và đánh giá khách hàng; quản lý món ăn, danh mục, thư viện ảnh và thông tin thương hiệu. Đánh giá chỉ xuất hiện trên trang chủ sau khi admin bật công khai; chỉ đăng khi khách đã đồng ý chia sẻ.
- Row Level Security: người xem chỉ đọc gói đang bật và đánh giá đã đăng; khách có thể gửi yêu cầu; chỉ admin được đọc/sửa yêu cầu và quản lý nội dung.

## Cần cập nhật trước khi công bố

- **Hương Việt là tên tạm.** Thay tên, logo, địa chỉ, số điện thoại, email, giờ liên hệ và mạng xã hội bằng thông tin được xác thực trong admin. Thông tin liên hệ mẫu từ seed hiện được ẩn ở trang công khai.
- Ba gói mặc định trên trang công khai là ý tưởng tham khảo. Admin có thể tạo gói thật và bật hiển thị; khi có gói đang bật, trang sẽ dùng dữ liệu đó. Giá, hạng mục và lịch cần xác nhận với khách.
- Món ăn, mô tả và giá hiện lấy từ dữ liệu seed Supabase; cần biên tập và xác nhận. Ảnh `picsum.photos` của seed không hiển thị ở thẻ món để tránh hình không đúng món. Thay bằng ảnh món được cấp quyền qua admin.
- Ảnh sảnh tiệc là hình minh họa, không mô tả địa điểm thật. Xem [nguồn ảnh](docs/home-image-sources.md).
- Chưa có chống spam chuyên dụng, email/SMS tự động hoặc hệ thống thanh toán. Cần bổ sung khi triển khai thật và có quy trình tiếp nhận dữ liệu khách hàng.
- Đặt tên miền thật trong `NEXT_PUBLIC_SITE_URL` trước khi phát hành để canonical, sitemap và robots đúng địa chỉ. Chỉ thêm schema doanh nghiệp khi địa chỉ và thông tin pháp lý đã xác thực.

Khu admin cần tài khoản thuộc `admin_users`. Không tạo tài khoản quản trị bằng giao diện công khai.
