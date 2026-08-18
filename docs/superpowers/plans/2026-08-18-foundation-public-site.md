# Foundation + Public Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Next.js + Supabase foundation and ship the fully working, anonymously-browsable public restaurant website (home, menu, about, gallery, contact) with VI/EN language toggle, backed by a real Supabase project seeded with sample data.

**Architecture:** Next.js 14 App Router + TypeScript project with a `(site)` route group. Server Components fetch data directly from Supabase (Postgres, RLS allows public `SELECT`) via thin query functions in `lib/supabase/queries.ts`. Bilingual content is stored as `_vi`/`_en` columns and picked at render time by a pure `localize()` helper — no runtime translation. Language preference persists in a cookie read by the root layout. This plan does NOT build the admin panel (separate follow-up plan) — sample data is seeded directly via Supabase migrations/SQL so the public site has real content to render.

**Tech Stack:** Next.js 14.2.5 (App Router), TypeScript 5.4, Tailwind CSS 3.4, `@supabase/supabase-js` + `@supabase/ssr`, Vitest 1.6 + React Testing Library for unit tests, Chrome/Playwright browser tool for end-to-end verification (not installed as a repo dependency — used ad hoc via the available browser automation tool).

**Spec:** `KE-HOACH-DU-AN.md` (sections 0–4, 6, 7, plus the "Quyết định bổ sung" section 12) — this plan implements the public-site portion of that spec plus the shared Supabase/i18n foundation the admin panel (next plan) will also depend on.

## Global Constraints

- Song ngữ VI/EN mặc định tiếng Việt; mọi nội dung động có cột `_vi`/`_en`, không dịch runtime (spec §4).
- Bảng màu: burgundy `#7A1F2B`, vàng đồng `#C9A24B`, than đen `#1C1A17`, trắng ngà `#F5F0E6` (spec §1).
- Font: heading = Playfair Display, nội dung = Be Vietnam Pro, cả hai qua `next/font/google` (spec §1).
- Ảnh dùng `next/image`, tỉ lệ ảnh món ăn cố định 4:3 hoặc 1:1 (spec §6).
- Responsive bắt buộc cho toàn bộ site khách (spec §6).
- Supabase project mới, độc lập — KHÔNG dùng project `123an-clound's Project` (ref `xsspvdgnhelzprcqaiek`) (spec §0, §11).
- `SUPABASE_SERVICE_ROLE_KEY` chỉ dùng ở server/script, không bao giờ lộ ra client hay commit vào git (spec §7).
- RLS: public chỉ có quyền SELECT trên `categories`, `menu_items`, `restaurant_info`, `gallery_images` (spec §3.2) — các trang public trong plan này chỉ đọc dữ liệu, không ghi.

---

### Task 1: Project scaffold (Next.js + TypeScript + Tailwind)

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.mjs`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`
- Create: `.eslintrc.json`
- Create: `.gitignore`
- Create: `app/layout.tsx`
- Create: `app/globals.css`
- Create: `app/page.tsx` (temporary placeholder, replaced in Task 11 when `(site)` route group takes over `/`)

**Interfaces:**
- Produces: a bootable Next.js dev server (`npm run dev`) and a `npm run build` that type-checks cleanly. Later tasks add files under `app/`, `components/`, `lib/` without touching this task's config files except `tailwind.config.ts` content paths (already broad enough to cover them).

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "huong-viet-restaurant",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "@supabase/supabase-js": "2.45.4",
    "@supabase/ssr": "0.5.1"
  },
  "devDependencies": {
    "typescript": "5.4.5",
    "@types/node": "20.14.9",
    "@types/react": "18.3.3",
    "@types/react-dom": "18.3.0",
    "tailwindcss": "3.4.4",
    "postcss": "8.4.39",
    "autoprefixer": "10.4.19",
    "eslint": "8.57.0",
    "eslint-config-next": "14.2.5",
    "vitest": "1.6.0",
    "@vitejs/plugin-react": "4.3.1",
    "jsdom": "24.1.0",
    "@testing-library/react": "16.0.0",
    "@testing-library/jest-dom": "6.4.6"
  }
}
```

- [ ] **Step 2: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Write `next.config.mjs`**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 4: Write `postcss.config.mjs`**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 5: Write `tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        burgundy: '#7A1F2B',
        gold: '#C9A24B',
        charcoal: '#1C1A17',
        ivory: '#F5F0E6',
      },
      fontFamily: {
        heading: ['var(--font-playfair)', 'serif'],
        body: ['var(--font-be-vietnam-pro)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 6: Write `.eslintrc.json`**

```json
{
  "extends": "next/core-web-vitals"
}
```

- [ ] **Step 7: Write `.gitignore`**

```
node_modules
.next
.env.local
.env*.local
npm-debug.log*
.DS_Store
*.tsbuildinfo
next-env.d.ts
coverage
```

- [ ] **Step 8: Write `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-burgundy: #7A1F2B;
  --color-gold: #C9A24B;
  --color-charcoal: #1C1A17;
  --color-ivory: #F5F0E6;
}

body {
  background-color: var(--color-ivory);
  color: var(--color-charcoal);
}
```

- [ ] **Step 9: Write `app/layout.tsx`**

```tsx
import type { Metadata } from 'next';
import { Playfair_Display, Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-playfair',
  display: 'swap',
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-be-vietnam-pro',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Hương Việt | Huong Viet Fine Dining',
  description: 'Tinh hoa ẩm thực ba miền — The Soul of Vietnamese Cuisine',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={`${playfair.variable} ${beVietnamPro.variable} font-body`}>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 10: Write temporary `app/page.tsx`**

```tsx
export default function Home() {
  return <main className="p-8">Hương Việt — coming soon.</main>;
}
```

- [ ] **Step 11: Install dependencies**

Run: `npm install`
Expected: installs without errors, creates `node_modules/` and `package-lock.json`.

- [ ] **Step 12: Verify dev server boots**

Run: `npm run dev` (start in background, then stop it after checking)
Expected: server starts on `http://localhost:3000` with no compile errors; visiting `/` renders "Hương Việt — coming soon."

- [ ] **Step 13: Verify production build type-checks**

Run: `npm run build`
Expected: build completes successfully with no TypeScript errors.

- [ ] **Step 14: Init git and commit**

```bash
git init
git add package.json package-lock.json tsconfig.json next.config.mjs postcss.config.mjs tailwind.config.ts .eslintrc.json .gitignore app/layout.tsx app/globals.css app/page.tsx KE-HOACH-DU-AN.md docs/superpowers/plans/2026-08-18-foundation-public-site.md
git commit -m "chore: scaffold Next.js + TypeScript + Tailwind project"
```

---

### Task 2: Vitest test harness

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `lib/env.test.ts`
- Modify: `package.json` (already has `test`/`test:watch` scripts from Task 1 — no change needed here)

**Interfaces:**
- Produces: `npm test` running Vitest in jsdom mode with React Testing Library + jest-dom matchers available globally, and the `@/*` path alias resolving the same way it does in Next.js. Every later task's `*.test.ts(x)` file relies on this.

- [ ] **Step 1: Write the failing test**

`lib/env.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

describe('vitest harness', () => {
  it('runs in the test environment', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
});
```

- [ ] **Step 2: Run test to verify it fails (no config yet)**

Run: `npx vitest run lib/env.test.ts`
Expected: FAIL — Vitest either isn't configured for the `@/*` alias/jsdom yet or errors immediately (no `vitest.config.ts` present means defaults apply and this specific assertion may already pass by luck, but the command should still surface the missing jsdom/RTL setup once Step 3 files are added — treat any error here as confirming the harness isn't wired yet).

- [ ] **Step 3: Write `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './') },
  },
});
```

- [ ] **Step 4: Write `vitest.setup.ts`**

```typescript
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test`
Expected: PASS — 1 test passed (`vitest harness > runs in the test environment`).

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts vitest.setup.ts lib/env.test.ts
git commit -m "test: add Vitest + React Testing Library harness"
```

---

### Task 3: Supabase client factories with env validation

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/env.test.ts`
- Create: `.env.local.example`
- Modify: `.gitignore` (already ignores `.env.local` from Task 1 — no change needed)

**Interfaces:**
- Consumes: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` env vars.
- Produces: `createBrowserSupabaseClient(): SupabaseClient` (from `lib/supabase/client.ts`) for Client Components; `createServerSupabaseClient(): Promise<SupabaseClient>` (from `lib/supabase/server.ts`) for Server Components/Actions. Task 10 (`lib/supabase/queries.ts`) and the admin plan both call these.

- [ ] **Step 1: Write the failing tests**

`lib/supabase/env.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const ORIGINAL_ENV = { ...process.env };

describe('createBrowserSupabaseClient', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('throws a clear error when NEXT_PUBLIC_SUPABASE_URL is missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    const { createBrowserSupabaseClient } = await import('./client');
    expect(() => createBrowserSupabaseClient()).toThrow(
      'Missing env var: NEXT_PUBLIC_SUPABASE_URL'
    );
  });

  it('throws a clear error when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const { createBrowserSupabaseClient } = await import('./client');
    expect(() => createBrowserSupabaseClient()).toThrow(
      'Missing env var: NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  });

  it('creates a client when both env vars are present', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    const { createBrowserSupabaseClient } = await import('./client');
    const client = createBrowserSupabaseClient();
    expect(client).toBeDefined();
    expect(typeof client.from).toBe('function');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/supabase/env.test.ts`
Expected: FAIL with "Cannot find module './client'" (file doesn't exist yet).

- [ ] **Step 3: Write `lib/supabase/client.ts`**

```typescript
import { createBrowserClient } from '@supabase/ssr';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }
  return value;
}

export function createBrowserSupabaseClient() {
  const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
  const anonKey = requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  return createBrowserClient(url, anonKey);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/supabase/env.test.ts`
Expected: PASS — all 3 tests pass.

- [ ] **Step 5: Write `lib/supabase/server.ts`** (Server Component / Server Action client — not directly unit tested because `next/headers` only works inside the Next.js request runtime; it is exercised end-to-end in Task 16's browser verification)

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }
  return value;
}

export async function createServerSupabaseClient() {
  const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
  const anonKey = requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component that can't set cookies — safe to
          // ignore because session refresh happens in middleware instead.
        }
      },
    },
  });
}
```

- [ ] **Step 6: Write `.env.local.example`**

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-public-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

- [ ] **Step 7: Commit**

```bash
git add lib/supabase/client.ts lib/supabase/server.ts lib/supabase/env.test.ts .env.local.example
git commit -m "feat: add Supabase client factories with env validation"
```

---

### Task 4: Create Supabase project and apply schema migration

**Files:**
- Create: `supabase/migrations/0001_init.sql`
- Create: `.env.local` (not committed — contains real secrets)

**Interfaces:**
- Produces: a live Supabase project with the `categories`, `menu_items`, `restaurant_info`, `gallery_images`, `admin_users` tables, RLS policies, and `dish-images`/`site-media` storage buckets described in spec §3.2. Task 5 (seed data) and Task 10 (queries) depend on this schema existing.

- [ ] **Step 1: Write `supabase/migrations/0001_init.sql`**

Copy verbatim from `KE-HOACH-DU-AN.md` §3.2 (the full `create table` / RLS / storage bucket SQL block, lines 115–247 of that file).

- [ ] **Step 2: Create the Supabase project via MCP**

Use `mcp__claude_ai_Supabase__list_organizations` to find the target org, then `mcp__claude_ai_Supabase__create_project` with:
- `name`: `huong-viet-restaurant`
- `region`: Southeast Asia (Singapore) region id
- organization id from the previous step

If `confirm_cost` is required by the tool, call `mcp__claude_ai_Supabase__get_cost` first, present the cost to the user, and only proceed with `confirm_cost` after explicit user confirmation.

Expected: tool returns a project with `id` (project ref), status transitions to `ACTIVE_HEALTHY` (poll `mcp__claude_ai_Supabase__get_project` if it starts as `COMING_UP`).

- [ ] **Step 3: Apply the migration**

Use `mcp__claude_ai_Supabase__apply_migration` with the target project id, migration name `0001_init`, and the SQL content from Step 1.

Expected: tool reports success with no SQL errors.

- [ ] **Step 4: Verify schema**

Use `mcp__claude_ai_Supabase__list_tables` on the project.
Expected: `categories`, `menu_items`, `restaurant_info`, `gallery_images`, `admin_users` all present in the `public` schema.

Use `mcp__claude_ai_Supabase__get_advisors` (type: `security`) to confirm no RLS-disabled warnings remain on these tables.
Expected: no security advisor warnings for the 5 new tables.

- [ ] **Step 5: Fetch project URL and anon key, write `.env.local`**

Use `mcp__claude_ai_Supabase__get_project_url` and `mcp__claude_ai_Supabase__get_publishable_keys` (anon key) for the project. For `SUPABASE_SERVICE_ROLE_KEY`, retrieve it from the Supabase Dashboard → Project Settings → API (the MCP tools intentionally do not expose the service role key) — ask the user to paste it if it isn't otherwise available.

Write `.env.local` (gitignored, never printed to chat in full):

```
NEXT_PUBLIC_SUPABASE_URL=<project url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
```

- [ ] **Step 6: Verify env wiring end-to-end**

Run: `npm run dev`, then in a second terminal run a throwaway Node check:

```bash
node -e "require('dotenv').config({path:'.env.local'}); console.log(!!process.env.NEXT_PUBLIC_SUPABASE_URL, !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, !!process.env.SUPABASE_SERVICE_ROLE_KEY)"
```

Expected: prints `true true true` (if `dotenv` isn't installed, `npm install --no-save dotenv` first just for this check, or instead confirm by temporarily logging `!!process.env.NEXT_PUBLIC_SUPABASE_URL` from a Server Component and viewing the terminal output of `npm run dev`).

- [ ] **Step 7: Commit**

```bash
git add supabase/migrations/0001_init.sql
git commit -m "feat: add Supabase schema migration (categories, menu_items, restaurant_info, gallery_images, admin_users, RLS, storage buckets)"
```

(`.env.local` is gitignored and intentionally not committed.)

---

### Task 5: Seed sample data

**Files:**
- Create: `supabase/seed.sql`

**Interfaces:**
- Produces: 7 rows in `categories`, 30 rows in `menu_items` (across the 7 categories, with `is_featured = true` on the 6 signature dishes), 1 row in `restaurant_info`. Tasks 11–15 (public pages) render this data.

- [ ] **Step 1: Write `supabase/seed.sql`**

```sql
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
```

- [ ] **Step 2: Run the seed via MCP**

Use `mcp__claude_ai_Supabase__execute_sql` (or `apply_migration` with name `0002_seed`) on the project with the SQL from Step 1.

Expected: no errors; 7 rows inserted into `categories`, 30 into `menu_items`, 1 into `restaurant_info`, 6 into `gallery_images`.

- [ ] **Step 3: Verify row counts**

Use `mcp__claude_ai_Supabase__execute_sql` with:

```sql
select
  (select count(*) from public.categories) as categories,
  (select count(*) from public.menu_items) as menu_items,
  (select count(*) from public.restaurant_info) as restaurant_info,
  (select count(*) from public.gallery_images) as gallery_images,
  (select count(*) from public.menu_items where is_featured) as featured_items;
```

Expected: `categories=7, menu_items=30, restaurant_info=1, gallery_images=6, featured_items=6`.

- [ ] **Step 4: Commit**

```bash
git add supabase/seed.sql
git commit -m "feat: add sample menu, restaurant info, and gallery seed data"
```

---

### Task 6: Create the first admin account

**Files:**
- No repo files created — this task only touches the live Supabase project (schema/state, not code).

**Interfaces:**
- Produces: an `auth.users` row for `phamtuanan3939@gmail.com` and a matching row in `public.admin_users`. Not consumed by anything in this plan (the public site never checks `is_admin()`); the admin panel plan's login/middleware tasks depend on this account existing.

- [ ] **Step 1: Create the auth user via the GoTrue Admin API**

Run (PowerShell — reads the service role key from `.env.local` and the admin password from a session-only environment variable; neither is ever written to a file or echoed). Before running the script, set the password in the current shell only: `$env:HV_ADMIN_TEMP_PASSWORD = '<the password the user provided in chat>'` (this line itself must never be saved into any repo file, plan, or log — type/paste it directly in the terminal at execution time).

```powershell
$envFile = Get-Content .env.local | Where-Object { $_ -match '^\w+=' } | ConvertFrom-StringData
$body = @{ email = 'phamtuanan3939@gmail.com'; password = $env:HV_ADMIN_TEMP_PASSWORD; email_confirm = $true } | ConvertTo-Json
$headers = @{ apikey = $envFile.SUPABASE_SERVICE_ROLE_KEY; Authorization = "Bearer $($envFile.SUPABASE_SERVICE_ROLE_KEY)"; 'Content-Type' = 'application/json' }
$user = Invoke-RestMethod -Method Post -Uri "$($envFile.NEXT_PUBLIC_SUPABASE_URL)/auth/v1/admin/users" -Headers $headers -Body $body
$user.id
Remove-Item Env:\HV_ADMIN_TEMP_PASSWORD
```

Expected: prints a UUID (the new user's `id`). No password or key is printed. The last line clears the temporary env var immediately after use.

- [ ] **Step 2: Insert into `admin_users`**

Use `mcp__claude_ai_Supabase__execute_sql` with the UUID from Step 1:

```sql
insert into public.admin_users (user_id, full_name)
values ('<uuid-from-step-1>', 'Chủ nhà hàng');
```

Expected: 1 row inserted.

- [ ] **Step 3: Verify**

```sql
select u.email, a.full_name
from public.admin_users a
join auth.users u on u.id = a.user_id;
```

Expected: one row with `email = 'phamtuanan3939@gmail.com'`.

- [ ] **Step 4: Advise the user to rotate the password**

Report to the user: the admin account is live; because the password was shared in chat, they should sign in once the admin panel plan ships and change it immediately (Supabase Auth → the user's own password-change flow, or Dashboard → Authentication → Users → reset).

No commit — no repo files changed in this task.

---

### Task 7: i18n dictionaries and localize helper

**Files:**
- Create: `lib/i18n/localize.ts`
- Create: `lib/i18n/localize.test.ts`
- Create: `lib/i18n/dictionaries.ts`
- Create: `lib/i18n/dictionaries.test.ts`

**Interfaces:**
- Produces: `type Locale = 'vi' | 'en'` and `localize(vi: string, en: string, locale: Locale): string` (picks the right column value, falling back to Vietnamese when English is blank) — used by every page component that renders a bilingual DB field. Also `getDictionary(locale: Locale)` returning the static UI-string dictionary — used by `Navbar`, `Footer`, and every page for non-DB labels (nav links, buttons, section headings).

- [ ] **Step 1: Write the failing test for `localize`**

`lib/i18n/localize.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { localize } from './localize';

describe('localize', () => {
  it('returns the Vietnamese value when locale is vi', () => {
    expect(localize('Xin chào', 'Hello', 'vi')).toBe('Xin chào');
  });

  it('returns the English value when locale is en', () => {
    expect(localize('Xin chào', 'Hello', 'en')).toBe('Hello');
  });

  it('falls back to Vietnamese when locale is en but the English value is empty', () => {
    expect(localize('Xin chào', '', 'en')).toBe('Xin chào');
  });

  it('falls back to Vietnamese when the English value is only whitespace', () => {
    expect(localize('Xin chào', '   ', 'en')).toBe('Xin chào');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/i18n/localize.test.ts`
Expected: FAIL with "Cannot find module './localize'".

- [ ] **Step 3: Write `lib/i18n/localize.ts`**

```typescript
export type Locale = 'vi' | 'en';

export function localize(vi: string, en: string, locale: Locale): string {
  if (locale === 'en') {
    return en.trim().length > 0 ? en : vi;
  }
  return vi;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/i18n/localize.test.ts`
Expected: PASS — all 4 tests pass.

- [ ] **Step 5: Write the failing test for `getDictionary`**

`lib/i18n/dictionaries.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { getDictionary } from './dictionaries';

describe('getDictionary', () => {
  it('returns Vietnamese nav labels for locale "vi"', () => {
    expect(getDictionary('vi').nav.home).toBe('Trang chủ');
    expect(getDictionary('vi').nav.menu).toBe('Thực đơn');
  });

  it('returns English nav labels for locale "en"', () => {
    expect(getDictionary('en').nav.home).toBe('Home');
    expect(getDictionary('en').nav.menu).toBe('Menu');
  });

  it('has the same set of "common" keys in both locales', () => {
    const viKeys = Object.keys(getDictionary('vi').common).sort();
    const enKeys = Object.keys(getDictionary('en').common).sort();
    expect(enKeys).toEqual(viKeys);
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npx vitest run lib/i18n/dictionaries.test.ts`
Expected: FAIL with "Cannot find module './dictionaries'".

- [ ] **Step 7: Write `lib/i18n/dictionaries.ts`**

```typescript
import type { Locale } from './localize';

export const dictionaries = {
  vi: {
    nav: {
      home: 'Trang chủ',
      menu: 'Thực đơn',
      about: 'Giới thiệu',
      gallery: 'Không gian',
      contact: 'Liên hệ',
    },
    common: {
      viewMenuCta: 'Xem thực đơn',
      featuredDishesHeading: 'Món đặc trưng',
      soldOutBadge: 'Hết món',
      viewMoreGallery: 'Xem thêm không gian',
      openingHoursLabel: 'Giờ mở cửa',
      addressLabel: 'Địa chỉ',
      phoneLabel: 'Điện thoại',
      emailLabel: 'Email',
      ourStoryHeading: 'Câu chuyện của chúng tôi',
      ourSpaceHeading: 'Không gian nhà hàng',
      contactHeading: 'Liên hệ với chúng tôi',
    },
  },
  en: {
    nav: {
      home: 'Home',
      menu: 'Menu',
      about: 'About',
      gallery: 'Gallery',
      contact: 'Contact',
    },
    common: {
      viewMenuCta: 'View Menu',
      featuredDishesHeading: 'Signature Dishes',
      soldOutBadge: 'Sold Out',
      viewMoreGallery: 'See More of Our Space',
      openingHoursLabel: 'Opening Hours',
      addressLabel: 'Address',
      phoneLabel: 'Phone',
      emailLabel: 'Email',
      ourStoryHeading: 'Our Story',
      ourSpaceHeading: 'Our Space',
      contactHeading: 'Contact Us',
    },
  },
} as const satisfies Record<Locale, unknown>;

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npx vitest run lib/i18n/dictionaries.test.ts`
Expected: PASS — all 3 tests pass.

- [ ] **Step 9: Commit**

```bash
git add lib/i18n/localize.ts lib/i18n/localize.test.ts lib/i18n/dictionaries.ts lib/i18n/dictionaries.test.ts
git commit -m "feat: add i18n localize helper and VI/EN dictionaries"
```

---

### Task 8: Locale cookie helper and LanguageProvider

**Files:**
- Create: `lib/i18n/locale.ts`
- Create: `lib/i18n/locale.test.ts`
- Create: `lib/i18n/LanguageProvider.tsx`
- Create: `lib/i18n/LanguageProvider.test.tsx`

**Interfaces:**
- Consumes: `Locale` from `lib/i18n/localize.ts` (Task 7).
- Produces: `LOCALE_COOKIE_NAME` (string constant) and `normalizeLocale(value: string | undefined | null): Locale` — used by the `(site)` layout (Task 10) to read the cookie server-side and by `LanguageProvider`/`useLanguage()` — the client context Task 10's `LanguageToggle` and all page components use to read/set the active locale.

- [ ] **Step 1: Write the failing test for `normalizeLocale`**

`lib/i18n/locale.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { normalizeLocale } from './locale';

describe('normalizeLocale', () => {
  it('returns "en" when the value is exactly "en"', () => {
    expect(normalizeLocale('en')).toBe('en');
  });

  it('returns "vi" when the value is "vi"', () => {
    expect(normalizeLocale('vi')).toBe('vi');
  });

  it('defaults to "vi" for undefined', () => {
    expect(normalizeLocale(undefined)).toBe('vi');
  });

  it('defaults to "vi" for null', () => {
    expect(normalizeLocale(null)).toBe('vi');
  });

  it('defaults to "vi" for any unexpected value', () => {
    expect(normalizeLocale('fr')).toBe('vi');
    expect(normalizeLocale('')).toBe('vi');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/i18n/locale.test.ts`
Expected: FAIL with "Cannot find module './locale'".

- [ ] **Step 3: Write `lib/i18n/locale.ts`**

```typescript
import type { Locale } from './localize';

export const LOCALE_COOKIE_NAME = 'hv_locale';

export function normalizeLocale(value: string | undefined | null): Locale {
  return value === 'en' ? 'en' : 'vi';
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/i18n/locale.test.ts`
Expected: PASS — all 5 tests pass.

- [ ] **Step 5: Write the failing test for `LanguageProvider`**

`lib/i18n/LanguageProvider.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider, useLanguage } from './LanguageProvider';

function Consumer() {
  const { locale, setLocale } = useLanguage();
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <button onClick={() => setLocale('en')}>switch to en</button>
    </div>
  );
}

describe('LanguageProvider', () => {
  beforeEach(() => {
    document.cookie = 'hv_locale=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  });

  it('provides the initial locale to consumers', () => {
    render(
      <LanguageProvider initialLocale="vi">
        <Consumer />
      </LanguageProvider>
    );
    expect(screen.getByTestId('locale')).toHaveTextContent('vi');
  });

  it('updates the locale and persists it to a cookie when setLocale is called', () => {
    render(
      <LanguageProvider initialLocale="vi">
        <Consumer />
      </LanguageProvider>
    );
    fireEvent.click(screen.getByText('switch to en'));
    expect(screen.getByTestId('locale')).toHaveTextContent('en');
    expect(document.cookie).toContain('hv_locale=en');
  });

  it('throws when useLanguage is used outside a LanguageProvider', () => {
    function Broken() {
      useLanguage();
      return null;
    }
    expect(() => render(<Broken />)).toThrow(
      'useLanguage must be used within a LanguageProvider'
    );
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npx vitest run lib/i18n/LanguageProvider.test.tsx`
Expected: FAIL with "Cannot find module './LanguageProvider'".

- [ ] **Step 7: Write `lib/i18n/LanguageProvider.tsx`**

```tsx
'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import type { Locale } from './localize';
import { LOCALE_COOKIE_NAME } from './locale';

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    document.cookie = `${LOCALE_COOKIE_NAME}=${next}; path=/; max-age=31536000`;
  }, []);

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npx vitest run lib/i18n/LanguageProvider.test.tsx`
Expected: PASS — all 3 tests pass.

- [ ] **Step 9: Commit**

```bash
git add lib/i18n/locale.ts lib/i18n/locale.test.ts lib/i18n/LanguageProvider.tsx lib/i18n/LanguageProvider.test.tsx
git commit -m "feat: add locale cookie helper and LanguageProvider"
```

---

### Task 9: Data types and Supabase query functions

**Files:**
- Create: `lib/types.ts`
- Create: `lib/supabase/test-helpers.ts`
- Create: `lib/supabase/queries.ts`
- Create: `lib/supabase/queries.test.ts`

**Interfaces:**
- Consumes: `SupabaseClient` from `@supabase/supabase-js` (the objects created by `lib/supabase/client.ts` / `server.ts`, Task 3).
- Produces: `getCategories`, `getMenuItems`, `getFeaturedMenuItems`, `getRestaurantInfo`, `getGalleryImages` — all `(supabase: SupabaseClient, ...) => Promise<...>` — called by every page in Tasks 11–15. Also the `Category`, `MenuItem`, `RestaurantInfo`, `GalleryImage` types those pages and components type their props with.

- [ ] **Step 1: Write `lib/types.ts`**

```typescript
export type Category = {
  id: string;
  name_vi: string;
  name_en: string;
  slug: string;
  description_vi: string;
  description_en: string;
  display_order: number;
};

export type MenuItem = {
  id: string;
  category_id: string | null;
  name_vi: string;
  name_en: string;
  description_vi: string;
  description_en: string;
  price: number;
  image_url: string;
  is_available: boolean;
  is_featured: boolean;
  display_order: number;
};

export type RestaurantInfo = {
  id: number;
  name_vi: string;
  name_en: string;
  tagline_vi: string;
  tagline_en: string;
  description_vi: string;
  description_en: string;
  address: string;
  phone: string;
  email: string;
  opening_hours: string;
  map_embed_url: string;
  facebook_url: string;
  instagram_url: string;
  logo_url: string;
  hero_image_url: string;
};

export type GalleryImage = {
  id: string;
  image_url: string;
  caption_vi: string;
  caption_en: string;
  display_order: number;
};
```

- [ ] **Step 2: Write the test double for the Supabase query builder**

`lib/supabase/test-helpers.ts` (not a `*.test.ts` file — a shared fake used by test files, not run as a suite itself):

```typescript
import type { SupabaseClient } from '@supabase/supabase-js';

type FakeResult = { data: unknown; error: unknown };

function createQueryBuilder(result: FakeResult) {
  const builder: Record<string, unknown> = {
    select: () => builder,
    eq: () => builder,
    order: () => builder,
    limit: () => builder,
    single: () => builder,
    then: (resolve: (value: FakeResult) => unknown) =>
      Promise.resolve(result).then(resolve),
  };
  return builder;
}

export function createFakeSupabase(result: FakeResult): SupabaseClient {
  return {
    from: () => createQueryBuilder(result),
  } as unknown as SupabaseClient;
}
```

- [ ] **Step 3: Write the failing tests**

`lib/supabase/queries.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { createFakeSupabase } from './test-helpers';
import {
  getCategories,
  getMenuItems,
  getFeaturedMenuItems,
  getRestaurantInfo,
  getGalleryImages,
} from './queries';

describe('getCategories', () => {
  it('returns the rows from the query', async () => {
    const rows = [{ id: '1', slug: 'khai-vi' }];
    const supabase = createFakeSupabase({ data: rows, error: null });
    await expect(getCategories(supabase)).resolves.toEqual(rows);
  });

  it('returns an empty array when data is null', async () => {
    const supabase = createFakeSupabase({ data: null, error: null });
    await expect(getCategories(supabase)).resolves.toEqual([]);
  });

  it('throws when the query returns an error', async () => {
    const supabase = createFakeSupabase({ data: null, error: new Error('db down') });
    await expect(getCategories(supabase)).rejects.toThrow('db down');
  });
});

describe('getMenuItems', () => {
  it('returns the rows from the query', async () => {
    const rows = [{ id: '1', name_vi: 'Phở' }];
    const supabase = createFakeSupabase({ data: rows, error: null });
    await expect(getMenuItems(supabase)).resolves.toEqual(rows);
  });
});

describe('getFeaturedMenuItems', () => {
  it('returns the rows from the query', async () => {
    const rows = [{ id: '1', is_featured: true }];
    const supabase = createFakeSupabase({ data: rows, error: null });
    await expect(getFeaturedMenuItems(supabase)).resolves.toEqual(rows);
  });
});

describe('getRestaurantInfo', () => {
  it('returns the single row', async () => {
    const row = { id: 1, name_vi: 'Hương Việt' };
    const supabase = createFakeSupabase({ data: row, error: null });
    await expect(getRestaurantInfo(supabase)).resolves.toEqual(row);
  });

  it('throws when the query returns an error', async () => {
    const supabase = createFakeSupabase({ data: null, error: new Error('not found') });
    await expect(getRestaurantInfo(supabase)).rejects.toThrow('not found');
  });
});

describe('getGalleryImages', () => {
  it('returns the rows from the query', async () => {
    const rows = [{ id: '1', image_url: 'x.jpg' }];
    const supabase = createFakeSupabase({ data: rows, error: null });
    await expect(getGalleryImages(supabase)).resolves.toEqual(rows);
  });
});
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `npx vitest run lib/supabase/queries.test.ts`
Expected: FAIL with "Cannot find module './queries'".

- [ ] **Step 5: Write `lib/supabase/queries.ts`**

```typescript
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Category, GalleryImage, MenuItem, RestaurantInfo } from '@/lib/types';

export async function getCategories(supabase: SupabaseClient): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function getMenuItems(supabase: SupabaseClient): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('display_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as MenuItem[];
}

export async function getFeaturedMenuItems(
  supabase: SupabaseClient,
  limit = 6
): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('is_featured', true)
    .order('display_order', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as MenuItem[];
}

export async function getRestaurantInfo(supabase: SupabaseClient): Promise<RestaurantInfo> {
  const { data, error } = await supabase
    .from('restaurant_info')
    .select('*')
    .eq('id', 1)
    .single();
  if (error) throw error;
  return data as RestaurantInfo;
}

export async function getGalleryImages(
  supabase: SupabaseClient,
  limit?: number
): Promise<GalleryImage[]> {
  const base = supabase
    .from('gallery_images')
    .select('*')
    .order('display_order', { ascending: true });
  const query = limit ? base.limit(limit) : base;
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as GalleryImage[];
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run lib/supabase/queries.test.ts`
Expected: PASS — all 8 tests pass.

- [ ] **Step 7: Commit**

```bash
git add lib/types.ts lib/supabase/test-helpers.ts lib/supabase/queries.ts lib/supabase/queries.test.ts
git commit -m "feat: add restaurant data types and Supabase query functions"
```

---

### Task 10: Navbar, Footer, LanguageToggle, and the `(site)` layout

**Files:**
- Create: `components/site/LanguageToggle.tsx`
- Create: `components/site/LanguageToggle.test.tsx`
- Create: `components/site/Navbar.tsx`
- Create: `components/site/Navbar.test.tsx`
- Create: `components/site/Footer.tsx`
- Create: `components/site/Footer.test.tsx`
- Create: `app/(site)/layout.tsx`

**Interfaces:**
- Consumes: `useLanguage()` (Task 8), `getDictionary()` (Task 7), `RestaurantInfo` type + `getRestaurantInfo()` (Task 9), `createServerSupabaseClient()` (Task 3), `LOCALE_COOKIE_NAME`/`normalizeLocale()` (Task 8).
- Produces: `<Navbar />`, `<Footer restaurantInfo={RestaurantInfo} />`, `<LanguageToggle />` — rendered by every `(site)` page via the shared layout. The `(site)` layout wraps every route under it in `LanguageProvider`, so Tasks 11–15 pages can call `useLanguage()`/`localize()` freely.

- [ ] **Step 1: Write the failing test for `LanguageToggle`**

`components/site/LanguageToggle.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider } from '@/lib/i18n/LanguageProvider';
import { LanguageToggle } from './LanguageToggle';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

function renderWithProvider(initialLocale: 'vi' | 'en' = 'vi') {
  return render(
    <LanguageProvider initialLocale={initialLocale}>
      <LanguageToggle />
    </LanguageProvider>
  );
}

describe('LanguageToggle', () => {
  it('marks VI as pressed by default', () => {
    renderWithProvider('vi');
    expect(screen.getByText('VI')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('EN')).toHaveAttribute('aria-pressed', 'false');
  });

  it('switches to EN when the EN button is clicked', () => {
    renderWithProvider('vi');
    fireEvent.click(screen.getByText('EN'));
    expect(screen.getByText('EN')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('VI')).toHaveAttribute('aria-pressed', 'false');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/site/LanguageToggle.test.tsx`
Expected: FAIL with "Cannot find module './LanguageToggle'".

- [ ] **Step 3: Write `components/site/LanguageToggle.tsx`**

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import type { Locale } from '@/lib/i18n/localize';

export function LanguageToggle() {
  const { locale, setLocale } = useLanguage();
  const router = useRouter();

  function handleSelect(next: Locale) {
    setLocale(next);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1 text-sm font-medium" role="group" aria-label="Language">
      <button
        type="button"
        onClick={() => handleSelect('vi')}
        aria-pressed={locale === 'vi'}
        className={locale === 'vi' ? 'text-gold' : 'text-charcoal/60'}
      >
        VI
      </button>
      <span aria-hidden="true">/</span>
      <button
        type="button"
        onClick={() => handleSelect('en')}
        aria-pressed={locale === 'en'}
        className={locale === 'en' ? 'text-gold' : 'text-charcoal/60'}
      >
        EN
      </button>
    </div>
  );
}
```

`router.refresh()` re-runs the Server Components in the current route with the new `hv_locale` cookie value, so server-fetched bilingual content (dish names, descriptions, restaurant info) updates immediately alongside the client-side `LanguageProvider` context that `Navbar`/`Footer` read.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/site/LanguageToggle.test.tsx`
Expected: PASS — both tests pass.

- [ ] **Step 5: Write the failing test for `Navbar`**

`components/site/Navbar.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LanguageProvider } from '@/lib/i18n/LanguageProvider';
import { Navbar } from './Navbar';

describe('Navbar', () => {
  it('renders Vietnamese nav labels by default', () => {
    render(
      <LanguageProvider initialLocale="vi">
        <Navbar />
      </LanguageProvider>
    );
    expect(screen.getByText('Thực đơn')).toBeInTheDocument();
    expect(screen.getByText('Liên hệ')).toBeInTheDocument();
  });

  it('renders English nav labels when initial locale is en', () => {
    render(
      <LanguageProvider initialLocale="en">
        <Navbar />
      </LanguageProvider>
    );
    expect(screen.getByText('Menu')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npx vitest run components/site/Navbar.test.tsx`
Expected: FAIL with "Cannot find module './Navbar'".

- [ ] **Step 7: Write `components/site/Navbar.tsx`**

```tsx
'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { LanguageToggle } from './LanguageToggle';

const NAV_ITEMS = [
  { href: '/', key: 'home' } as const,
  { href: '/menu', key: 'menu' } as const,
  { href: '/about', key: 'about' } as const,
  { href: '/gallery', key: 'gallery' } as const,
  { href: '/contact', key: 'contact' } as const,
];

export function Navbar() {
  const { locale } = useLanguage();
  const dict = getDictionary(locale);

  return (
    <header className="sticky top-0 z-40 border-b border-gold/30 bg-ivory/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-heading text-xl text-burgundy">
          {locale === 'vi' ? 'Hương Việt' : 'Huong Viet'}
        </Link>
        <nav className="hidden gap-6 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-charcoal hover:text-burgundy"
            >
              {dict.nav[item.key]}
            </Link>
          ))}
        </nav>
        <LanguageToggle />
      </div>
    </header>
  );
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npx vitest run components/site/Navbar.test.tsx`
Expected: PASS — both tests pass.

- [ ] **Step 9: Write the failing test for `Footer`**

`components/site/Footer.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LanguageProvider } from '@/lib/i18n/LanguageProvider';
import type { RestaurantInfo } from '@/lib/types';
import { Footer } from './Footer';

const restaurantInfo: RestaurantInfo = {
  id: 1,
  name_vi: 'Hương Việt',
  name_en: 'Huong Viet Fine Dining',
  tagline_vi: '',
  tagline_en: '',
  description_vi: '',
  description_en: '',
  address: '15 Đồng Khởi, Quận 1, TP. Hồ Chí Minh',
  phone: '028 3822 9999',
  email: 'contact@huongvietrestaurant.vn',
  opening_hours: '11:00 – 14:00 và 17:30 – 22:30',
  map_embed_url: '',
  facebook_url: '',
  instagram_url: '',
  logo_url: '',
  hero_image_url: '',
};

describe('Footer', () => {
  it('renders the Vietnamese name and contact details by default', () => {
    render(
      <LanguageProvider initialLocale="vi">
        <Footer restaurantInfo={restaurantInfo} />
      </LanguageProvider>
    );
    expect(screen.getByText('Hương Việt')).toBeInTheDocument();
    expect(screen.getByText(restaurantInfo.address)).toBeInTheDocument();
    expect(screen.getByText(restaurantInfo.phone)).toBeInTheDocument();
  });

  it('renders the English name when locale is en', () => {
    render(
      <LanguageProvider initialLocale="en">
        <Footer restaurantInfo={restaurantInfo} />
      </LanguageProvider>
    );
    expect(screen.getByText('Huong Viet Fine Dining')).toBeInTheDocument();
  });
});
```

- [ ] **Step 10: Run test to verify it fails**

Run: `npx vitest run components/site/Footer.test.tsx`
Expected: FAIL with "Cannot find module './Footer'".

- [ ] **Step 11: Write `components/site/Footer.tsx`**

```tsx
'use client';

import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { RestaurantInfo } from '@/lib/types';

export function Footer({ restaurantInfo }: { restaurantInfo: RestaurantInfo }) {
  const { locale } = useLanguage();
  const dict = getDictionary(locale);
  const name = locale === 'vi' ? restaurantInfo.name_vi : restaurantInfo.name_en;

  return (
    <footer className="mt-16 border-t border-gold/30 bg-charcoal py-10 text-ivory">
      <div className="mx-auto max-w-6xl px-4">
        <p className="font-heading text-lg text-gold">{name}</p>
        <dl className="mt-4 grid gap-2 text-sm">
          <div>
            <dt className="inline text-gold">{dict.common.addressLabel}: </dt>
            <dd className="inline">{restaurantInfo.address}</dd>
          </div>
          <div>
            <dt className="inline text-gold">{dict.common.phoneLabel}: </dt>
            <dd className="inline">{restaurantInfo.phone}</dd>
          </div>
          <div>
            <dt className="inline text-gold">{dict.common.openingHoursLabel}: </dt>
            <dd className="inline">{restaurantInfo.opening_hours}</dd>
          </div>
        </dl>
      </div>
    </footer>
  );
}
```

- [ ] **Step 12: Run test to verify it passes**

Run: `npx vitest run components/site/Footer.test.tsx`
Expected: PASS — both tests pass.

- [ ] **Step 13: Write `app/(site)/layout.tsx`** (Server Component — reads the locale cookie and fetches `restaurant_info` server-side; not unit tested, verified in Task 16's browser pass)

```tsx
import { cookies } from 'next/headers';
import { LanguageProvider } from '@/lib/i18n/LanguageProvider';
import { LOCALE_COOKIE_NAME, normalizeLocale } from '@/lib/i18n/locale';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getRestaurantInfo } from '@/lib/supabase/queries';
import { Navbar } from '@/components/site/Navbar';
import { Footer } from '@/components/site/Footer';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);
  const supabase = await createServerSupabaseClient();
  const restaurantInfo = await getRestaurantInfo(supabase);

  return (
    <LanguageProvider initialLocale={locale}>
      <Navbar />
      <main>{children}</main>
      <Footer restaurantInfo={restaurantInfo} />
    </LanguageProvider>
  );
}
```

- [ ] **Step 14: Commit**

```bash
git add components/site/LanguageToggle.tsx components/site/LanguageToggle.test.tsx components/site/Navbar.tsx components/site/Navbar.test.tsx components/site/Footer.tsx components/site/Footer.test.tsx "app/(site)/layout.tsx"
git commit -m "feat: add Navbar, Footer, LanguageToggle, and (site) layout"
```

---

### Task 11: Home page

**Files:**
- Create: `lib/format.ts`
- Create: `lib/format.test.ts`
- Create: `components/site/DishCard.tsx`
- Create: `components/site/DishCard.test.tsx`
- Create: `lib/i18n/server-locale.ts`
- Create: `app/(site)/page.tsx`
- Modify: `app/(site)/layout.tsx` (use `getServerLocale()` instead of the inline cookie read from Task 10)
- Delete: `app/page.tsx` (the Task 1 placeholder — `app/(site)/page.tsx` now owns the `/` route; having both would be a route conflict)

**Interfaces:**
- Consumes: `getDictionary`/`localize` (Task 7), `LOCALE_COOKIE_NAME`/`normalizeLocale` (Task 8), `getRestaurantInfo`/`getFeaturedMenuItems`/`getGalleryImages`/`createServerSupabaseClient` (Tasks 3, 9).
- Produces: `formatPrice(price: number): string` (used by `DishCard` here and by the menu page in Task 12), `<DishCard item={MenuItem} locale={Locale} />` (used by Home here and Menu in Task 12), `getServerLocale(): Promise<Locale>` (used by every remaining page task and the `(site)` layout).

- [ ] **Step 1: Write the failing test for `formatPrice`**

`lib/format.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { formatPrice } from './format';

describe('formatPrice', () => {
  it('formats a price with thousands separators and a đ suffix', () => {
    expect(formatPrice(165000)).toBe('165.000đ');
  });

  it('formats a large price correctly', () => {
    expect(formatPrice(1200000)).toBe('1.200.000đ');
  });

  it('formats zero', () => {
    expect(formatPrice(0)).toBe('0đ');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/format.test.ts`
Expected: FAIL with "Cannot find module './format'".

- [ ] **Step 3: Write `lib/format.ts`**

```typescript
export function formatPrice(price: number): string {
  return `${price.toLocaleString('vi-VN')}đ`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/format.test.ts`
Expected: PASS — all 3 tests pass.

- [ ] **Step 5: Write the failing test for `DishCard`**

`components/site/DishCard.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { MenuItem } from '@/lib/types';
import { DishCard } from './DishCard';

const item: MenuItem = {
  id: '1',
  category_id: 'c1',
  name_vi: 'Phở bò Wagyu',
  name_en: 'Wagyu Beef Pho',
  description_vi: 'Phở nước dùng ninh 12 tiếng.',
  description_en: 'Broth simmered for 12 hours.',
  price: 285000,
  image_url: 'https://picsum.photos/seed/pho/800/600',
  is_available: true,
  is_featured: true,
  display_order: 1,
};

describe('DishCard', () => {
  it('renders the Vietnamese name, description, and formatted price by default', () => {
    render(<DishCard item={item} locale="vi" />);
    expect(screen.getByText('Phở bò Wagyu')).toBeInTheDocument();
    expect(screen.getByText('Phở nước dùng ninh 12 tiếng.')).toBeInTheDocument();
    expect(screen.getByText('285.000đ')).toBeInTheDocument();
  });

  it('renders the English name and description when locale is en', () => {
    render(<DishCard item={item} locale="en" />);
    expect(screen.getByText('Wagyu Beef Pho')).toBeInTheDocument();
    expect(screen.getByText('Broth simmered for 12 hours.')).toBeInTheDocument();
  });

  it('shows the sold-out badge when is_available is false', () => {
    render(<DishCard item={{ ...item, is_available: false }} locale="vi" />);
    expect(screen.getByText('Hết món')).toBeInTheDocument();
  });

  it('does not show the sold-out badge when the item is available', () => {
    render(<DishCard item={item} locale="vi" />);
    expect(screen.queryByText('Hết món')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npx vitest run components/site/DishCard.test.tsx`
Expected: FAIL with "Cannot find module './DishCard'".

- [ ] **Step 7: Write `components/site/DishCard.tsx`**

```tsx
import Image from 'next/image';
import { localize } from '@/lib/i18n/localize';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { formatPrice } from '@/lib/format';
import type { Locale } from '@/lib/i18n/localize';
import type { MenuItem } from '@/lib/types';

export function DishCard({ item, locale }: { item: MenuItem; locale: Locale }) {
  const dict = getDictionary(locale);
  const name = localize(item.name_vi, item.name_en, locale);
  const description = localize(item.description_vi, item.description_en, locale);

  return (
    <article className="overflow-hidden rounded-lg border border-gold/20 bg-white shadow-sm">
      <div className="relative aspect-square w-full">
        <Image
          src={item.image_url}
          alt={name}
          fill
          className="object-cover"
          sizes="(min-width: 768px) 33vw, 100vw"
        />
        {!item.is_available && (
          <span className="absolute right-2 top-2 rounded bg-charcoal/80 px-2 py-1 text-xs text-ivory">
            {dict.common.soldOutBadge}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-heading text-lg text-charcoal">{name}</h3>
        {description && <p className="mt-1 text-sm text-charcoal/70">{description}</p>}
        <p className="mt-2 font-medium text-burgundy">{formatPrice(item.price)}</p>
      </div>
    </article>
  );
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npx vitest run components/site/DishCard.test.tsx`
Expected: PASS — all 4 tests pass.

- [ ] **Step 9: Write `lib/i18n/server-locale.ts`** (server-only — reads the request cookie; not unit tested here, exercised by every page's browser check in Task 16)

```typescript
import { cookies } from 'next/headers';
import { LOCALE_COOKIE_NAME, normalizeLocale } from './locale';

export async function getServerLocale() {
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);
}
```

- [ ] **Step 10: Update `app/(site)/layout.tsx` to use `getServerLocale()`**

Replace the file's full contents with:

```tsx
import { LanguageProvider } from '@/lib/i18n/LanguageProvider';
import { getServerLocale } from '@/lib/i18n/server-locale';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getRestaurantInfo } from '@/lib/supabase/queries';
import { Navbar } from '@/components/site/Navbar';
import { Footer } from '@/components/site/Footer';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const locale = await getServerLocale();
  const supabase = await createServerSupabaseClient();
  const restaurantInfo = await getRestaurantInfo(supabase);

  return (
    <LanguageProvider initialLocale={locale}>
      <Navbar />
      <main>{children}</main>
      <Footer restaurantInfo={restaurantInfo} />
    </LanguageProvider>
  );
}
```

- [ ] **Step 11: Delete the placeholder `app/page.tsx`**

Run: `rm app/page.tsx` (PowerShell: `Remove-Item app/page.tsx`)

- [ ] **Step 12: Write `app/(site)/page.tsx`**

```tsx
import Image from 'next/image';
import Link from 'next/link';
import { getServerLocale } from '@/lib/i18n/server-locale';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localize } from '@/lib/i18n/localize';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  getRestaurantInfo,
  getFeaturedMenuItems,
  getGalleryImages,
} from '@/lib/supabase/queries';
import { DishCard } from '@/components/site/DishCard';

export default async function HomePage() {
  const locale = await getServerLocale();
  const dict = getDictionary(locale);
  const supabase = await createServerSupabaseClient();
  const [restaurantInfo, featuredItems, galleryPreview] = await Promise.all([
    getRestaurantInfo(supabase),
    getFeaturedMenuItems(supabase, 6),
    getGalleryImages(supabase, 6),
  ]);

  const name = localize(restaurantInfo.name_vi, restaurantInfo.name_en, locale);
  const tagline = localize(restaurantInfo.tagline_vi, restaurantInfo.tagline_en, locale);
  const description = localize(
    restaurantInfo.description_vi,
    restaurantInfo.description_en,
    locale
  );

  return (
    <>
      <section className="relative flex h-[70vh] min-h-[420px] items-end">
        <Image src={restaurantInfo.hero_image_url} alt={name} fill priority className="object-cover" />
        <div className="absolute inset-0 bg-charcoal/50" />
        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 text-ivory">
          <h1 className="font-heading text-4xl md:text-6xl">{name}</h1>
          <p className="mt-2 text-lg text-gold">{tagline}</p>
          <Link
            href="/menu"
            className="mt-6 inline-block rounded-full bg-burgundy px-6 py-3 text-sm font-medium text-ivory hover:bg-burgundy/90"
          >
            {dict.common.viewMenuCta}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-charcoal/80">{description}</p>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-heading text-3xl text-burgundy">{dict.common.featuredDishesHeading}</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredItems.map((item) => (
            <DishCard key={item.id} item={item} locale={locale} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-3xl text-burgundy">{dict.common.ourSpaceHeading}</h2>
          <Link href="/gallery" className="text-sm font-medium text-burgundy underline">
            {dict.common.viewMoreGallery}
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
          {galleryPreview.map((image) => (
            <div key={image.id} className="relative aspect-square overflow-hidden rounded-lg">
              <Image
                src={image.image_url}
                alt={localize(image.caption_vi, image.caption_en, locale)}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 33vw, 50vw"
              />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 13: Verify the app builds and the home page renders real data**

Run: `npm run build`
Expected: build succeeds with no type errors.

Run: `npm run dev`, open `http://localhost:3000/` in a browser (manually or via the browser tool).
Expected: hero shows "Hương Việt" / tagline, 6 featured dishes render with real names/prices from Supabase, gallery preview shows 6 images. (A full cross-browser/responsive/console-error pass happens in Task 16 — this step is just a sanity check before moving on.)

- [ ] **Step 14: Commit**

```bash
git add lib/format.ts lib/format.test.ts components/site/DishCard.tsx components/site/DishCard.test.tsx lib/i18n/server-locale.ts "app/(site)/layout.tsx" "app/(site)/page.tsx"
git rm app/page.tsx
git commit -m "feat: add Home page with hero, featured dishes, and gallery preview"
```

---

### Task 12: Menu page with category tabs

**Files:**
- Create: `components/site/CategoryTabs.tsx`
- Create: `components/site/CategoryTabs.test.tsx`
- Create: `app/(site)/menu/page.tsx`

**Interfaces:**
- Consumes: `localize` (Task 7), `Category`/`MenuItem` types (Task 9), `DishCard` (Task 11), `getServerLocale`/`getCategories`/`getMenuItems`/`createServerSupabaseClient` (Tasks 3, 9, 11).
- Produces: `<CategoryTabs categories={Category[]} items={MenuItem[]} locale={Locale} />` — self-contained, not reused elsewhere in this plan.

- [ ] **Step 1: Write the failing test**

`components/site/CategoryTabs.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { Category, MenuItem } from '@/lib/types';
import { CategoryTabs } from './CategoryTabs';

const categories: Category[] = [
  {
    id: 'c1',
    name_vi: 'Khai vị',
    name_en: 'Appetizers',
    slug: 'khai-vi',
    description_vi: '',
    description_en: '',
    display_order: 1,
  },
  {
    id: 'c2',
    name_vi: 'Súp',
    name_en: 'Soups',
    slug: 'sup',
    description_vi: '',
    description_en: '',
    display_order: 2,
  },
];

const items: MenuItem[] = [
  {
    id: 'i1',
    category_id: 'c1',
    name_vi: 'Gỏi cuốn',
    name_en: 'Spring Rolls',
    description_vi: '',
    description_en: '',
    price: 165000,
    image_url: 'https://picsum.photos/seed/i1/800/600',
    is_available: true,
    is_featured: false,
    display_order: 1,
  },
  {
    id: 'i2',
    category_id: 'c2',
    name_vi: 'Súp măng cua',
    name_en: 'Crab Soup',
    description_vi: '',
    description_en: '',
    price: 165000,
    image_url: 'https://picsum.photos/seed/i2/800/600',
    is_available: true,
    is_featured: false,
    display_order: 1,
  },
];

describe('CategoryTabs', () => {
  it('shows items from the first category by default', () => {
    render(<CategoryTabs categories={categories} items={items} locale="vi" />);
    expect(screen.getByText('Gỏi cuốn')).toBeInTheDocument();
    expect(screen.queryByText('Súp măng cua')).not.toBeInTheDocument();
  });

  it('switches to the selected category when its tab is clicked', () => {
    render(<CategoryTabs categories={categories} items={items} locale="vi" />);
    fireEvent.click(screen.getByText('Súp'));
    expect(screen.getByText('Súp măng cua')).toBeInTheDocument();
    expect(screen.queryByText('Gỏi cuốn')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/site/CategoryTabs.test.tsx`
Expected: FAIL with "Cannot find module './CategoryTabs'".

- [ ] **Step 3: Write `components/site/CategoryTabs.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { localize } from '@/lib/i18n/localize';
import type { Locale } from '@/lib/i18n/localize';
import type { Category, MenuItem } from '@/lib/types';
import { DishCard } from './DishCard';

export function CategoryTabs({
  categories,
  items,
  locale,
}: {
  categories: Category[];
  items: MenuItem[];
  locale: Locale;
}) {
  const [activeId, setActiveId] = useState(categories[0]?.id ?? '');
  const itemsForActive = items.filter((item) => item.category_id === activeId);

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto border-b border-gold/30 pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setActiveId(category.id)}
            aria-pressed={category.id === activeId}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
              category.id === activeId
                ? 'bg-burgundy text-ivory'
                : 'bg-transparent text-charcoal'
            }`}
          >
            {localize(category.name_vi, category.name_en, locale)}
          </button>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {itemsForActive.map((item) => (
          <DishCard key={item.id} item={item} locale={locale} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/site/CategoryTabs.test.tsx`
Expected: PASS — both tests pass.

- [ ] **Step 5: Write `app/(site)/menu/page.tsx`**

```tsx
import { getServerLocale } from '@/lib/i18n/server-locale';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getCategories, getMenuItems } from '@/lib/supabase/queries';
import { CategoryTabs } from '@/components/site/CategoryTabs';

export default async function MenuPage() {
  const locale = await getServerLocale();
  const supabase = await createServerSupabaseClient();
  const [categories, items] = await Promise.all([
    getCategories(supabase),
    getMenuItems(supabase),
  ]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <CategoryTabs categories={categories} items={items} locale={locale} />
    </section>
  );
}
```

- [ ] **Step 6: Verify against real data**

Run: `npm run dev`, open `http://localhost:3000/menu`.
Expected: 7 category tabs render; clicking each shows that category's dishes with correct names/prices; "Hết món" badge does not appear (all seed items are `is_available = true`).

- [ ] **Step 7: Commit**

```bash
git add components/site/CategoryTabs.tsx components/site/CategoryTabs.test.tsx "app/(site)/menu/page.tsx"
git commit -m "feat: add Menu page with category tabs"
```

---

### Task 13: About page

**Files:**
- Create: `app/(site)/about/page.tsx`

**Interfaces:**
- Consumes: `getServerLocale` (Task 11), `getDictionary`/`localize` (Task 7), `getRestaurantInfo`/`createServerSupabaseClient` (Tasks 3, 9). Produces nothing consumed elsewhere — this page is a leaf.

- [ ] **Step 1: Write `app/(site)/about/page.tsx`**

```tsx
import Image from 'next/image';
import { getServerLocale } from '@/lib/i18n/server-locale';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localize } from '@/lib/i18n/localize';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getRestaurantInfo } from '@/lib/supabase/queries';

export default async function AboutPage() {
  const locale = await getServerLocale();
  const dict = getDictionary(locale);
  const supabase = await createServerSupabaseClient();
  const restaurantInfo = await getRestaurantInfo(supabase);

  const description = localize(
    restaurantInfo.description_vi,
    restaurantInfo.description_en,
    locale
  );

  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-heading text-3xl text-burgundy">{dict.common.ourStoryHeading}</h1>
      <p className="mt-6 whitespace-pre-line text-charcoal/80">{description}</p>
      <div className="relative mt-10 aspect-video w-full overflow-hidden rounded-lg">
        <Image
          src={restaurantInfo.hero_image_url}
          alt={localize(restaurantInfo.name_vi, restaurantInfo.name_en, locale)}
          fill
          className="object-cover"
        />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify against real data**

Run: `npm run dev`, open `http://localhost:3000/about`.
Expected: brand story paragraph and hero image render.

- [ ] **Step 3: Commit**

```bash
git add "app/(site)/about/page.tsx"
git commit -m "feat: add About page"
```

---

### Task 14: Gallery page with lightbox

**Files:**
- Create: `components/site/GalleryGrid.tsx`
- Create: `components/site/GalleryGrid.test.tsx`
- Create: `app/(site)/gallery/page.tsx`

**Interfaces:**
- Consumes: `localize` (Task 7), `GalleryImage` type (Task 9), `getServerLocale`/`getGalleryImages`/`createServerSupabaseClient` (Tasks 3, 9, 11).
- Produces: `<GalleryGrid images={GalleryImage[]} locale={Locale} />` — self-contained, not reused elsewhere in this plan (the Home page's gallery preview in Task 11 renders its own simple grid without a lightbox, per spec §4 which only requires the lightbox on the dedicated `/gallery` page).

- [ ] **Step 1: Write the failing test**

`components/site/GalleryGrid.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { GalleryImage } from '@/lib/types';
import { GalleryGrid } from './GalleryGrid';

const images: GalleryImage[] = [
  {
    id: 'g1',
    image_url: 'https://picsum.photos/seed/g1/1200/900',
    caption_vi: 'Không gian chính',
    caption_en: 'Main dining area',
    display_order: 1,
  },
  {
    id: 'g2',
    image_url: 'https://picsum.photos/seed/g2/1200/900',
    caption_vi: 'Sân vườn',
    caption_en: 'Garden',
    display_order: 2,
  },
];

describe('GalleryGrid', () => {
  it('does not show the lightbox initially', () => {
    render(<GalleryGrid images={images} locale="vi" />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the lightbox with the clicked image when a thumbnail is clicked', () => {
    render(<GalleryGrid images={images} locale="vi" />);
    fireEvent.click(screen.getByAltText('Sân vườn'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getAllByAltText('Sân vườn')).toHaveLength(2);
  });

  it('closes the lightbox when the close button is clicked', () => {
    render(<GalleryGrid images={images} locale="vi" />);
    fireEvent.click(screen.getByAltText('Không gian chính'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Close'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/site/GalleryGrid.test.tsx`
Expected: FAIL with "Cannot find module './GalleryGrid'".

- [ ] **Step 3: Write `components/site/GalleryGrid.tsx`**

```tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { localize } from '@/lib/i18n/localize';
import type { Locale } from '@/lib/i18n/localize';
import type { GalleryImage } from '@/lib/types';

export function GalleryGrid({ images, locale }: { images: GalleryImage[]; locale: Locale }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const openImage = images.find((image) => image.id === openId) ?? null;

  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {images.map((image) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setOpenId(image.id)}
            className="relative aspect-square overflow-hidden rounded-lg"
          >
            <Image
              src={image.image_url}
              alt={localize(image.caption_vi, image.caption_en, locale)}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 33vw, 50vw"
            />
          </button>
        ))}
      </div>

      {openImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/90 p-4"
          onClick={() => setOpenId(null)}
        >
          <div className="relative aspect-video w-full max-w-4xl">
            <Image
              src={openImage.image_url}
              alt={localize(openImage.caption_vi, openImage.caption_en, locale)}
              fill
              className="object-contain"
            />
          </div>
          <button
            type="button"
            onClick={() => setOpenId(null)}
            aria-label="Close"
            className="absolute right-4 top-4 text-2xl text-ivory"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/site/GalleryGrid.test.tsx`
Expected: PASS — all 3 tests pass.

- [ ] **Step 5: Write `app/(site)/gallery/page.tsx`**

```tsx
import { getServerLocale } from '@/lib/i18n/server-locale';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getGalleryImages } from '@/lib/supabase/queries';
import { GalleryGrid } from '@/components/site/GalleryGrid';

export default async function GalleryPage() {
  const locale = await getServerLocale();
  const supabase = await createServerSupabaseClient();
  const images = await getGalleryImages(supabase);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <GalleryGrid images={images} locale={locale} />
    </section>
  );
}
```

- [ ] **Step 6: Verify against real data**

Run: `npm run dev`, open `http://localhost:3000/gallery`.
Expected: 6 seeded images render in a grid; clicking one opens the lightbox with the larger image; clicking the close button or the backdrop closes it.

- [ ] **Step 7: Commit**

```bash
git add components/site/GalleryGrid.tsx components/site/GalleryGrid.test.tsx "app/(site)/gallery/page.tsx"
git commit -m "feat: add Gallery page with lightbox"
```

---

### Task 15: Contact page

**Files:**
- Create: `components/site/MapEmbed.tsx`
- Create: `components/site/MapEmbed.test.tsx`
- Create: `app/(site)/contact/page.tsx`

**Interfaces:**
- Consumes: `getServerLocale`/`getDictionary`/`localize`/`getRestaurantInfo`/`createServerSupabaseClient` (Tasks 3, 7, 9, 11).
- Produces: `<MapEmbed mapEmbedUrl={string} title={string} />` — self-contained, not reused elsewhere in this plan.

- [ ] **Step 1: Write the failing test**

`components/site/MapEmbed.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MapEmbed } from './MapEmbed';

describe('MapEmbed', () => {
  it('renders an iframe with the given src and title', () => {
    render(<MapEmbed mapEmbedUrl="https://maps.example.com/embed" title="Hương Việt" />);
    const iframe = screen.getByTitle('Hương Việt');
    expect(iframe).toHaveAttribute('src', 'https://maps.example.com/embed');
  });

  it('renders nothing when mapEmbedUrl is empty', () => {
    const { container } = render(<MapEmbed mapEmbedUrl="" title="Hương Việt" />);
    expect(container).toBeEmptyDOMElement();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/site/MapEmbed.test.tsx`
Expected: FAIL with "Cannot find module './MapEmbed'".

- [ ] **Step 3: Write `components/site/MapEmbed.tsx`**

```tsx
export function MapEmbed({ mapEmbedUrl, title }: { mapEmbedUrl: string; title: string }) {
  if (!mapEmbedUrl) {
    return null;
  }

  return (
    <iframe
      src={mapEmbedUrl}
      title={title}
      className="h-80 w-full rounded-lg border-0"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/site/MapEmbed.test.tsx`
Expected: PASS — both tests pass.

- [ ] **Step 5: Write `app/(site)/contact/page.tsx`**

```tsx
import { getServerLocale } from '@/lib/i18n/server-locale';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localize } from '@/lib/i18n/localize';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getRestaurantInfo } from '@/lib/supabase/queries';
import { MapEmbed } from '@/components/site/MapEmbed';

export default async function ContactPage() {
  const locale = await getServerLocale();
  const dict = getDictionary(locale);
  const supabase = await createServerSupabaseClient();
  const restaurantInfo = await getRestaurantInfo(supabase);
  const name = localize(restaurantInfo.name_vi, restaurantInfo.name_en, locale);

  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-heading text-3xl text-burgundy">{dict.common.contactHeading}</h1>
      <dl className="mt-6 grid gap-3 text-charcoal/80">
        <div>
          <dt className="font-medium text-charcoal">{dict.common.addressLabel}</dt>
          <dd>{restaurantInfo.address}</dd>
        </div>
        <div>
          <dt className="font-medium text-charcoal">{dict.common.phoneLabel}</dt>
          <dd>{restaurantInfo.phone}</dd>
        </div>
        <div>
          <dt className="font-medium text-charcoal">{dict.common.emailLabel}</dt>
          <dd>{restaurantInfo.email}</dd>
        </div>
        <div>
          <dt className="font-medium text-charcoal">{dict.common.openingHoursLabel}</dt>
          <dd>{restaurantInfo.opening_hours}</dd>
        </div>
      </dl>
      <div className="mt-8">
        <MapEmbed mapEmbedUrl={restaurantInfo.map_embed_url} title={name} />
      </div>
      <div className="mt-6 flex gap-4 text-sm">
        {restaurantInfo.facebook_url && (
          <a
            href={restaurantInfo.facebook_url}
            className="text-burgundy underline"
            target="_blank"
            rel="noreferrer"
          >
            Facebook
          </a>
        )}
        {restaurantInfo.instagram_url && (
          <a
            href={restaurantInfo.instagram_url}
            className="text-burgundy underline"
            target="_blank"
            rel="noreferrer"
          >
            Instagram
          </a>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Verify against real data**

Run: `npm run dev`, open `http://localhost:3000/contact`.
Expected: address/phone/email/hours render, map iframe loads, Facebook/Instagram links present.

- [ ] **Step 7: Commit**

```bash
git add components/site/MapEmbed.tsx components/site/MapEmbed.test.tsx "app/(site)/contact/page.tsx"
git commit -m "feat: add Contact page with map embed"
```

---

### Task 16: Full verification pass (unit tests, build, and real-browser check)

**Files:**
- No new files expected. Fix whatever Steps 3–6 surface; if a fix touches a file from an earlier task, edit it in place and note the change in the commit message.

**Interfaces:**
- Consumes: every file from Tasks 1–15.
- Produces: nothing — this is the plan's exit gate. Do not report the plan as done until every step below passes.

- [ ] **Step 1: Run the full unit test suite**

Run: `npm test`
Expected: all tests across every `*.test.ts`/`*.test.tsx` file from Tasks 2–15 pass (harness sanity, env validation, localize, dictionaries, locale, LanguageProvider, queries, LanguageToggle, Navbar, Footer, format, DishCard, CategoryTabs, GalleryGrid, MapEmbed).

- [ ] **Step 2: Run the production build**

Run: `npm run build`
Expected: succeeds with no TypeScript or lint errors.

- [ ] **Step 3: Start the app and load it in a real browser**

Run: `npm run dev` (background). Using the available browser automation tool (Chrome MCP or Playwright MCP — load its tools via ToolSearch if deferred), open `http://localhost:3000/`.

Check, in order, on desktop viewport (1440×900):
1. `/` — hero renders "Hương Việt" + tagline + hero image, intro paragraph, 6 featured dish cards with real names/prices, 6-image gallery preview, footer with address/phone/hours.
2. `/menu` — 7 category tabs; clicking each swaps the dish grid to that category's items; prices formatted like `165.000đ`.
3. `/about` — brand story paragraph + image render.
4. `/gallery` — 6 images in a grid; clicking one opens the lightbox with the larger image and a working close button/backdrop click.
5. `/contact` — address/phone/email/hours render, map iframe loads, Facebook/Instagram links present and point to the seeded URLs.

- [ ] **Step 4: Check the language toggle**

On `/menu`, click the "EN" toggle in the navbar. Verify: nav labels switch to English, dish names/descriptions switch to their `_en` values, the "Hết món"/"Sold Out" badge (if any item is toggled unavailable via a manual DB check) reflects the language. Reload the page and confirm the choice persisted (cookie). Switch back to "VI" and confirm content reverts.

- [ ] **Step 5: Check responsive layouts**

Resize/re-check at:
- Mobile: 375×812 — nav collapses sensibly (no horizontal overflow), category tabs scroll horizontally, dish grid becomes single-column, hero text remains legible.
- Tablet: 768×1024 — 2-column dish/gallery grids, no layout breakage.

Expected: no horizontal scrollbar on the page body at any of the three viewports (desktop from Step 3, tablet, mobile here).

- [ ] **Step 6: Check the browser console**

Read the browser console log for the session covering Steps 3–5.
Expected: no errors (warnings from third-party scripts, if any, are acceptable; React/Next errors, hydration mismatches, or failed network requests are not).

- [ ] **Step 7: Fix any issues found, then re-verify**

If Steps 3–6 surfaced a bug (layout break, console error, wrong locale text, broken lightbox, etc.), fix it in the relevant file from Tasks 1–15, re-run the affected unit tests (Step 1) if the fix touched tested logic, and repeat Steps 3–6 for the affected page(s) until clean.

- [ ] **Step 8: Final commit**

```bash
git add -A
git commit -m "chore: verify public site end-to-end (tests, build, browser, responsive)"
```

(Skip this commit if Steps 1–6 passed clean on the first attempt with no file changes.)

---

## Handoff

Once Task 16 passes, the public site is complete and running locally against the real Supabase project, per the "Build + Supabase, chưa deploy Vercel" scope agreed in `KE-HOACH-DU-AN.md` §12. Remaining spec items — the admin panel (`/admin/**`: login, dashboard, menu item / category / restaurant info / gallery CRUD) and eventual Vercel deploy — are out of scope for this plan and will be their own follow-up plan(s), per spec §5, §8, and the brainstorming decomposition.
