-- ========== CATEGORIES ==========
insert into public.categories (name_vi, name_en, slug, description_vi, description_en, display_order) values
('Khai vị', 'Appetizers', 'khai-vi', 'Mở đầu bữa ăn với hương vị tinh tế.', 'Start the meal with delicate flavors.', 1),
('Súp', 'Soups', 'sup', 'Súp truyền thống nấu theo phong cách cung đình.', 'Traditional soups prepared court-style.', 2),
('Món chính – Hải sản', 'Seafood Mains', 'mon-chinh-hai-san', 'Hải sản tươi sống chế biến cao cấp.', 'Premium preparations of fresh seafood.', 3),
('Món chính – Thịt & Gia cầm', 'Meat & Poultry Mains', 'mon-chinh-thit-gia-cam', 'Thịt và gia cầm tuyển chọn, nướng và om kiểu Việt.', 'Select meats and poultry, Vietnamese-style grilled and braised.', 4),
('Cơm & Mì, Bún', 'Rice & Noodles', 'com-mi-bun', 'Các món cơm, mì, bún đặc trưng ba miền.', 'Signature rice and noodle dishes from all three regions.', 5),
('Tráng miệng', 'Desserts', 'trang-mieng', 'Kết thúc bữa ăn nhẹ nhàng, ngọt dịu.', 'A light, sweet finish to the meal.', 6),
('Đồ uống', 'Beverages', 'do-uong', 'Trà, cà phê và thức uống pha chế.', 'Teas, coffees, and crafted beverages.', 7);

-- ========== MENU ITEMS ==========

-- Khai vị / Appetizers
insert into public.menu_items (category_id, name_vi, name_en, description_vi, description_en, price, image_url, is_available, is_featured, display_order) values
((select id from public.categories where slug = 'khai-vi'), 'Gỏi cuốn tôm thịt sốt me', 'Fresh Shrimp & Pork Spring Rolls with Tamarind Sauce', 'Tôm và thịt heo cuốn bánh tráng cùng rau thơm, chấm sốt me chua ngọt đặc trưng.', 'Shrimp and pork wrapped in rice paper with fresh herbs, served with a tangy tamarind dipping sauce.', 165000, 'https://picsum.photos/seed/goi-cuon-tom-thit/800/600', true, true, 1),
((select id from public.categories where slug = 'khai-vi'), 'Chả giò hải sản', 'Crispy Seafood Spring Rolls', 'Chả giò giòn rụm nhân hải sản tươi, ăn kèm rau sống và nước chấm chua ngọt.', 'Crispy fried rolls filled with fresh seafood, served with herbs and sweet-sour dipping sauce.', 185000, 'https://picsum.photos/seed/cha-gio-hai-san/800/600', true, false, 2),
((select id from public.categories where slug = 'khai-vi'), 'Gỏi bưởi tôm khô', 'Pomelo Salad with Dried Shrimp', 'Bưởi tươi trộn tôm khô, đậu phộng rang và rau răm, vị chua ngọt hài hòa.', 'Fresh pomelo tossed with dried shrimp, roasted peanuts, and Vietnamese coriander in a balanced sweet-sour dressing.', 175000, 'https://picsum.photos/seed/goi-buoi-tom-kho/800/600', true, false, 3),
((select id from public.categories where slug = 'khai-vi'), 'Bò lá lốt nướng', 'Grilled Beef Wrapped in Betel Leaf', 'Thịt bò ướp sả gừng cuốn lá lốt, nướng than hoa thơm lừng.', 'Lemongrass-and-ginger marinated beef wrapped in betel leaf, grilled over charcoal.', 195000, 'https://picsum.photos/seed/bo-la-lot-nuong/800/600', true, false, 4);

-- Súp / Soups
insert into public.menu_items (category_id, name_vi, name_en, description_vi, description_en, price, image_url, is_available, is_featured, display_order) values
((select id from public.categories where slug = 'sup'), 'Súp măng cua', 'Crab & Bamboo Shoot Soup', 'Súp măng tươi nấu cùng thịt cua và trứng cút, đậm đà truyền thống.', 'Fresh bamboo shoot soup simmered with crab meat and quail eggs, a traditional favorite.', 165000, 'https://picsum.photos/seed/sup-mang-cua/800/600', true, true, 1),
((select id from public.categories where slug = 'sup'), 'Súp bào ngư tiềm thuốc bắc', 'Herbal-Braised Abalone Soup', 'Bào ngư hầm cùng thuốc bắc và nấm quý, bồi bổ và tinh tế.', 'Abalone slow-braised with herbal medicine and rare mushrooms — nourishing and refined.', 320000, 'https://picsum.photos/seed/sup-bao-ngu/800/600', true, false, 2),
((select id from public.categories where slug = 'sup'), 'Canh chua cá lăng', 'Sour Catfish Soup', 'Canh chua cá lăng nấu me, dứa và rau nêm miền Tây.', 'Southern-style sour soup with catfish, tamarind, pineapple, and fresh herbs.', 245000, 'https://picsum.photos/seed/canh-chua-ca-lang/800/600', true, false, 3);

-- Món chính – Hải sản / Seafood Mains
insert into public.menu_items (category_id, name_vi, name_en, description_vi, description_en, price, image_url, is_available, is_featured, display_order) values
((select id from public.categories where slug = 'mon-chinh-hai-san'), 'Cá song hấp xì dầu', 'Steamed Grouper with Soy Sauce', 'Cá song tươi hấp xì dầu kiểu Hồng Kông, hành gừng thơm nhẹ.', 'Fresh grouper steamed Hong Kong-style with soy sauce, ginger, and scallion.', 480000, 'https://picsum.photos/seed/ca-song-hap/800/600', true, false, 1),
((select id from public.categories where slug = 'mon-chinh-hai-san'), 'Tôm hùm nướng phô mai', 'Grilled Lobster with Cheese', 'Tôm hùm tươi nướng phô mai béo ngậy, món đặc trưng của nhà hàng.', 'Fresh lobster grilled with rich melted cheese — a signature dish of the house.', 890000, 'https://picsum.photos/seed/tom-hum-nuong-pho-mai/800/600', true, true, 2),
((select id from public.categories where slug = 'mon-chinh-hai-san'), 'Mực nhồi thịt sốt cà', 'Stuffed Squid in Tomato Sauce', 'Mực tươi nhồi thịt, sốt cà chua đậm đà, ăn kèm cơm trắng.', 'Fresh squid stuffed with seasoned pork, simmered in a rich tomato sauce, served with steamed rice.', 285000, 'https://picsum.photos/seed/muc-nhoi-thit/800/600', true, false, 3),
((select id from public.categories where slug = 'mon-chinh-hai-san'), 'Chả cá Lã Vọng', 'Turmeric Fish Lã Vọng Style', 'Cá lăng ướp nghệ, thì là, ăn kèm bún và mắm tôm theo phong cách Hà Nội.', 'Turmeric-and-dill marinated catfish served Hanoi-style with rice vermicelli and shrimp paste.', 320000, 'https://picsum.photos/seed/cha-ca-la-vong/800/600', true, false, 4);

-- Món chính – Thịt & Gia cầm / Meat & Poultry Mains
insert into public.menu_items (category_id, name_vi, name_en, description_vi, description_en, price, image_url, is_available, is_featured, display_order) values
((select id from public.categories where slug = 'mon-chinh-thit-gia-cam'), 'Bò lúc lắc truffle', 'Truffle Shaking Beef', 'Thăn bò Úc xào lúc lắc cùng truffle, ăn kèm khoai tây nghiền.', 'Australian beef tenderloin wok-tossed with truffle, served with mashed potato.', 385000, 'https://picsum.photos/seed/bo-luc-lac-truffle/800/600', true, true, 1),
((select id from public.categories where slug = 'mon-chinh-thit-gia-cam'), 'Vịt quay kiểu Việt', 'Vietnamese-Style Roast Duck', 'Vịt quay da giòn ướp ngũ vị, chấm nước mắm gừng.', 'Crispy-skinned duck roasted with five-spice marinade, served with ginger fish sauce.', 420000, 'https://picsum.photos/seed/vit-quay/800/600', true, false, 2),
((select id from public.categories where slug = 'mon-chinh-thit-gia-cam'), 'Heo sữa quay giòn bì', 'Crispy Roast Suckling Pig', 'Heo sữa quay nguyên con, bì giòn rụm, thịt mềm thơm.', 'Whole roasted suckling pig with crackling skin and tender, fragrant meat.', 650000, 'https://picsum.photos/seed/heo-sua-quay/800/600', true, false, 3),
((select id from public.categories where slug = 'mon-chinh-thit-gia-cam'), 'Gà nướng lá chanh', 'Lime-Leaf Grilled Chicken', 'Gà ta ướp lá chanh nướng than hoa, thơm đặc trưng.', 'Free-range chicken marinated with lime leaf and grilled over charcoal.', 265000, 'https://picsum.photos/seed/ga-nuong-la-chanh/800/600', true, false, 4),
((select id from public.categories where slug = 'mon-chinh-thit-gia-cam'), 'Sườn cừu nướng ngũ vị', 'Five-Spice Grilled Lamb Chops', 'Sườn cừu Úc ướp ngũ vị, nướng vừa tới, ăn kèm sốt rượu vang đỏ.', 'Australian lamb chops marinated with five-spice, grilled medium, served with a red wine reduction.', 590000, 'https://picsum.photos/seed/suon-cuu-nuong/800/600', true, false, 5);

-- Cơm & Mì, Bún / Rice & Noodles
insert into public.menu_items (category_id, name_vi, name_en, description_vi, description_en, price, image_url, is_available, is_featured, display_order) values
((select id from public.categories where slug = 'com-mi-bun'), 'Cơm sen Huế', 'Hue Lotus Rice', 'Cơm chiên trong lá sen non kiểu cung đình Huế.', 'Fried rice steamed inside a young lotus leaf, Hue royal-court style.', 165000, 'https://picsum.photos/seed/com-sen-hue/800/600', true, false, 1),
((select id from public.categories where slug = 'com-mi-bun'), 'Bún bò Huế đặc biệt', 'Special Hue Beef Noodle Soup', 'Bún bò Huế cay nồng với giò heo, chả cua và thịt bò.', 'Spicy Hue-style beef noodle soup with pork knuckle, crab cake, and beef.', 185000, 'https://picsum.photos/seed/bun-bo-hue/800/600', true, false, 2),
((select id from public.categories where slug = 'com-mi-bun'), 'Phở bò Wagyu', 'Wagyu Beef Pho', 'Phở nước dùng ninh 12 tiếng, thịt bò Wagyu thái mỏng.', 'Broth simmered for 12 hours, topped with thinly sliced Wagyu beef.', 285000, 'https://picsum.photos/seed/pho-bo-wagyu/800/600', true, true, 3),
((select id from public.categories where slug = 'com-mi-bun'), 'Mì Quảng tôm thịt', 'Quang-Style Noodles with Shrimp & Pork', 'Mì Quảng truyền thống với tôm, thịt heo, bánh tráng và đậu phộng.', 'Traditional Quang Nam-style noodles with shrimp, pork, rice cracker, and peanuts.', 175000, 'https://picsum.photos/seed/mi-quang/800/600', true, false, 4),
((select id from public.categories where slug = 'com-mi-bun'), 'Cơm chiên hải sản thố đá', 'Seafood Fried Rice in Stone Pot', 'Cơm chiên hải sản phục vụ nóng hổi trong thố đá.', 'Seafood fried rice served sizzling hot in a stone pot.', 225000, 'https://picsum.photos/seed/com-chien-hai-san/800/600', true, false, 5);

-- Tráng miệng / Desserts
insert into public.menu_items (category_id, name_vi, name_en, description_vi, description_en, price, image_url, is_available, is_featured, display_order) values
((select id from public.categories where slug = 'trang-mieng'), 'Chè hạt sen long nhãn', 'Lotus Seed & Longan Sweet Soup', 'Chè hạt sen long nhãn thanh mát, ăn nóng hoặc lạnh.', 'A refreshing sweet soup of lotus seed and longan, served hot or cold.', 95000, 'https://picsum.photos/seed/che-hat-sen/800/600', true, false, 1),
((select id from public.categories where slug = 'trang-mieng'), 'Bánh flan cà phê', 'Coffee Flan', 'Bánh flan mềm mịn phủ caramel cà phê đậm đà.', 'Silky flan topped with a rich coffee caramel sauce.', 85000, 'https://picsum.photos/seed/banh-flan-ca-phe/800/600', true, false, 2),
((select id from public.categories where slug = 'trang-mieng'), 'Kem xôi lá dứa', 'Pandan Sticky Rice Ice Cream', 'Kem lá dứa ăn kèm xôi nếp dẻo và dừa nạo.', 'Pandan ice cream served with sticky rice and shredded coconut.', 95000, 'https://picsum.photos/seed/kem-xoi-la-dua/800/600', true, true, 3),
((select id from public.categories where slug = 'trang-mieng'), 'Trái cây theo mùa', 'Seasonal Fruit Platter', 'Trái cây tươi theo mùa, tuyển chọn mỗi ngày.', 'Fresh seasonal fruit, selected daily.', 120000, 'https://picsum.photos/seed/trai-cay-theo-mua/800/600', true, false, 4);

-- Đồ uống / Beverages
insert into public.menu_items (category_id, name_vi, name_en, description_vi, description_en, price, image_url, is_available, is_featured, display_order) values
((select id from public.categories where slug = 'do-uong'), 'Trà sen Tây Hồ', 'West Lake Lotus Tea', 'Trà sen ướp hương tự nhiên, thanh nhã.', 'Naturally lotus-scented tea, elegant and light.', 85000, 'https://picsum.photos/seed/tra-sen-tay-ho/800/600', true, false, 1),
((select id from public.categories where slug = 'do-uong'), 'Cà phê sữa đá', 'Vietnamese Iced Milk Coffee', 'Cà phê phin truyền thống pha cùng sữa đặc, đá viên.', 'Traditional drip coffee brewed with condensed milk over ice.', 65000, 'https://picsum.photos/seed/ca-phe-sua-da/800/600', true, false, 2),
((select id from public.categories where slug = 'do-uong'), 'Nước ép trái cây tươi', 'Fresh Fruit Juice', 'Nước ép trái cây tươi theo mùa, không thêm đường.', 'Freshly pressed seasonal fruit juice, no added sugar.', 75000, 'https://picsum.photos/seed/nuoc-ep-trai-cay/800/600', true, false, 3),
((select id from public.categories where slug = 'do-uong'), 'Rượu vang đỏ - ly', 'Red Wine (Glass)', 'Rượu vang đỏ nhập khẩu, phục vụ theo ly.', 'Imported red wine, served by the glass.', 195000, 'https://picsum.photos/seed/ruou-vang-do/800/600', true, false, 4),
((select id from public.categories where slug = 'do-uong'), 'Mocktail chanh sả gừng', 'Lemongrass Ginger Mocktail', 'Mocktail chanh sả gừng tươi mát, không cồn.', 'A refreshing non-alcoholic mocktail with lemongrass and ginger.', 95000, 'https://picsum.photos/seed/mocktail-chanh-sa-gung/800/600', true, false, 5);

-- ========== RESTAURANT INFO ==========
insert into public.restaurant_info (
  id, name_vi, name_en, tagline_vi, tagline_en, description_vi, description_en,
  address, phone, email, opening_hours, map_embed_url,
  facebook_url, instagram_url, logo_url, hero_image_url
) values (
  1,
  'Hương Việt', 'Huong Viet Fine Dining',
  'Tinh hoa ẩm thực ba miền', 'The Soul of Vietnamese Cuisine',
  'Hương Việt tôn vinh tinh hoa ẩm thực Bắc – Trung – Nam, kết hợp kỹ thuật chế biến hiện đại với nguyên liệu bản địa cao cấp. Không gian sang trọng pha trộn nét truyền thống với thiết kế đương đại.',
  'Huong Viet celebrates the essence of Northern, Central, and Southern Vietnamese cuisine, blending modern technique with premium local ingredients in a refined space that pairs tradition with contemporary design.',
  '15 Đồng Khởi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
  '028 3822 9999',
  'contact@huongvietrestaurant.vn',
  '11:00 – 14:00 (trưa) và 17:30 – 22:30 (tối), tất cả các ngày trong tuần',
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.395!2d106.7025!3d10.7772!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!5e0!3m2!1svi!2s!4v1700000000000',
  'https://facebook.com/huongvietrestaurant',
  'https://instagram.com/huongvietrestaurant',
  '',
  'https://picsum.photos/seed/huong-viet-hero/1920/1080'
);

-- ========== GALLERY IMAGES ==========
insert into public.gallery_images (image_url, caption_vi, caption_en, display_order) values
('https://picsum.photos/seed/hv-gallery-1/1200/900', 'Không gian chính của nhà hàng', 'The restaurant''s main dining area', 1),
('https://picsum.photos/seed/hv-gallery-2/1200/900', 'Phòng riêng cho tiệc gia đình', 'Private room for family gatherings', 2),
('https://picsum.photos/seed/hv-gallery-3/1200/900', 'Quầy bar và khu vực chờ', 'Bar and waiting area', 3),
('https://picsum.photos/seed/hv-gallery-4/1200/900', 'Sân vườn ngoài trời', 'Outdoor garden seating', 4),
('https://picsum.photos/seed/hv-gallery-5/1200/900', 'Chi tiết trang trí sơn mài truyền thống', 'Traditional lacquer decor details', 5),
('https://picsum.photos/seed/hv-gallery-6/1200/900', 'Bếp mở nơi đầu bếp chế biến món ăn', 'Open kitchen where chefs prepare each dish', 6);
