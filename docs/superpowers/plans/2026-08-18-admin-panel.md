# Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `/admin/**` — an auth-gated dashboard where the restaurant owner manages menu items, categories, restaurant info, and gallery images without touching code or the Supabase Dashboard.

**Architecture:** A separate `app/admin/(dashboard)/` route group (nested under the literal `app/admin/` folder, so it actually contributes the `/admin` URL segment — see Task 8's routing note) with its own light-theme layout (sidebar, no shared Navbar/Footer/LanguageProvider from the public site). `middleware.ts` gates every `/admin/**` route except `/admin/login` using `@supabase/ssr`'s `getUser()` (never `getSession()` — it doesn't revalidate against the auth server) plus the existing `is_admin()` RPC. All row mutations go through Next.js Server Actions using the existing session-bound `createServerSupabaseClient()`, so Postgres RLS enforces authorization on every write independently of the app-level checks. Images upload directly from the browser to Supabase Storage via `createBrowserSupabaseClient()`, then the resulting public URL is handed to a Server Action to persist.

**Tech Stack:** Next.js 14.2.35 (App Router, Server Actions), TypeScript, Tailwind CSS 3.4.4, shadcn/ui (hand-copied source, not CLI-installed), react-hook-form + zod, `@dnd-kit/react` + `@dnd-kit/helpers` for drag-and-drop reordering, Supabase (Postgres + Auth + Storage), Vitest + React Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-18-admin-panel-design.md`

## Global Constraints

- Do not change pinned versions from the previous plan: `next@14.2.35`, `react@18.3.1`, `react-dom@18.3.1`, `@supabase/supabase-js@2.45.4`, `@supabase/ssr@0.5.1`, `typescript@5.4.5`, `tailwindcss@3.4.4`, `vitest@3.2.6`.
- New dependency versions (pin exactly, verified installable and React-18-compatible via `npm view` at plan-writing time): `react-hook-form@7.85.0`, `zod@3.25.76` (v3, not v4 — v4 changes error-message APIs and isn't needed here), `@hookform/resolvers@5.9.1`, `@dnd-kit/react@0.5.0`, `@dnd-kit/helpers@0.5.0`, `lucide-react@1.31.0`, `class-variance-authority@0.7.1`, `clsx@2.1.1`, `tailwind-merge@3.6.0`, `sonner@2.0.8`, `tailwindcss-animate@1.0.7` (dev), `@radix-ui/react-slot@1.3.3`, `@radix-ui/react-label@2.1.15`, `@radix-ui/react-dialog@1.1.23`, `@radix-ui/react-select@2.3.7`, `@radix-ui/react-switch@1.3.7`.
- shadcn/ui components are hand-authored source files copied into `components/ui/` (that's how shadcn/ui works — it's not an installable package). Use the classic per-package Radix import style (`@radix-ui/react-dialog`, not the unified `radix-ui` meta-package) since that's what's compatible with this project's Tailwind v3 setup — the unified package and some newer utility class names (`outline-hidden`, etc.) are Tailwind v4-only.
- Use `@dnd-kit/react` + `@dnd-kit/helpers` (the current dnd-kit v2 API — `DragDropProvider`, `useSortable({id, index})`, `move()`), never the legacy `@dnd-kit/core`/`@dnd-kit/sortable`/`@dnd-kit/utilities` trio (dnd-kit's own docs mark that trio legacy with a migration guide to the packages used here).
- `getUser()`, never `getSession()`, for every auth decision (middleware, admin layout, any place that decides whether to show admin content). `getSession()` only reads cookies without revalidating against the auth server.
- Server Actions never `throw` for business/validation/Supabase errors — they return `ActionResult` (defined in Task 11) so forms can display the error. Only genuinely unexpected infrastructure failures should propagate to an error boundary.
- Image upload is client-side only (browser → Supabase Storage directly), never routed through a Server Action — this avoids raising Server Actions' default 1MB body limit and keeps large file bytes off the Next.js server entirely. Max 5MB per file, accepted types `image/jpeg`, `image/png`, `image/webp`.
- Admin UI is light-theme only, no dark mode — the Sonner `Toaster` is configured with a hardcoded `theme="light"` prop and this project does **not** add the `next-themes` dependency (unlike shadcn's default Sonner setup, which assumes a dark-mode toggle exists).
- `app/admin/(dashboard)/` route group does not import anything from `(site)` (`Navbar`, `Footer`, `LanguageProvider`, `lib/i18n/*`) — admin UI is not bilingual, only the VI/EN data fields it edits are.
- All new `.tsx`/`.ts` files use the existing `@/*` path alias (`tsconfig.json` `paths`) exactly like the current codebase.

---

### Task 1: Dependencies, `cn()` helper, shadcn theme tokens

**Files:**
- Modify: `package.json`
- Create: `lib/utils.ts`
- Create: `lib/utils.test.ts`
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`

**Interfaces:**
- Produces: `cn(...inputs: ClassValue[]): string` from `lib/utils.ts` — every later shadcn component imports this.
- Produces: Tailwind color tokens `border`, `input`, `ring`, `background`, `foreground`, `primary`, `primary-foreground`, `secondary`, `secondary-foreground`, `destructive`, `destructive-foreground`, `muted`, `muted-foreground`, `accent`, `accent-foreground`, `popover`, `popover-foreground`, `card`, `card-foreground`, plus `borderRadius` tokens `lg`/`md`/`sm` — every later shadcn component uses these class names (e.g. `bg-background`, `text-muted-foreground`, `rounded-lg`).

- [ ] **Step 1: Add the new dependencies to `package.json`**

Add to `"dependencies"`:

```json
    "react-hook-form": "7.85.0",
    "zod": "3.25.76",
    "@hookform/resolvers": "5.9.1",
    "@dnd-kit/react": "0.5.0",
    "@dnd-kit/helpers": "0.5.0",
    "lucide-react": "1.31.0",
    "class-variance-authority": "0.7.1",
    "clsx": "2.1.1",
    "tailwind-merge": "3.6.0",
    "sonner": "2.0.8",
    "@radix-ui/react-slot": "1.3.3",
    "@radix-ui/react-label": "2.1.15",
    "@radix-ui/react-dialog": "1.1.23",
    "@radix-ui/react-select": "2.3.7",
    "@radix-ui/react-switch": "1.3.7",
```

Add to `"devDependencies"`:

```json
    "tailwindcss-animate": "1.0.7",
```

- [ ] **Step 2: Install**

Run: `npm install`
Expected: installs cleanly, no peer-dependency errors (all versions above were verified React-18-compatible before writing this plan).

- [ ] **Step 3: Write the failing test for `cn()`**

Create `lib/utils.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('joins class names and drops falsy values', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c');
  });

  it('lets a later conflicting Tailwind class win over an earlier one', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npx vitest run lib/utils.test.ts`
Expected: FAIL — `Cannot find module './utils'` (file doesn't exist yet).

- [ ] **Step 5: Create `lib/utils.ts`**

```ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run lib/utils.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 7: Add shadcn theme tokens to `tailwind.config.ts`**

Replace the file's contents with:

```ts
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
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        heading: ['var(--font-playfair)', 'serif'],
        body: ['var(--font-be-vietnam-pro)', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

(`burgundy`/`gold`/`charcoal`/`ivory`/`fontFamily` are unchanged from before — this only adds the shadcn tokens alongside them. The public site's classes are untouched.)

- [ ] **Step 8: Add the shadcn CSS variables to `app/globals.css`**

Replace the file's contents with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-burgundy: #7A1F2B;
  --color-gold: #C9A24B;
  --color-charcoal: #1C1A17;
  --color-ivory: #F5F0E6;

  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}

body {
  background-color: var(--color-ivory);
  color: var(--color-charcoal);
}
```

(These are the standard shadcn/ui "slate" light-theme HSL values — light-only, no `.dark` block, matching the spec's "light theme, no dark mode" decision. `body`'s ivory background is unchanged — the admin layout, built in Task 9, overrides it locally with an opaque `bg-background` wrapper rather than touching this shared global rule.)

- [ ] **Step 9: Verify the full site still builds**

Run: `npm run build`
Expected: succeeds, same 6 routes as before (this task adds no new routes).

- [ ] **Step 10: Commit**

```bash
git add package.json package-lock.json lib/utils.ts lib/utils.test.ts tailwind.config.ts app/globals.css
git commit -m "feat: add admin panel dependencies, cn() helper, and shadcn theme tokens"
```

---

### Task 2: shadcn primitives — Button, Input, Label, Textarea, Card

**Files:**
- Create: `components/ui/button.tsx`
- Create: `components/ui/input.tsx`
- Create: `components/ui/label.tsx`
- Create: `components/ui/textarea.tsx`
- Create: `components/ui/card.tsx`
- Test: `components/ui/button.test.tsx`

**Interfaces:**
- Consumes: `cn` from `lib/utils.ts` (Task 1).
- Produces: `Button` (props: standard `<button>` attrs + `variant?: 'default'|'destructive'|'outline'|'secondary'|'ghost'|'link'`, `size?: 'default'|'sm'|'lg'|'icon'`, `asChild?: boolean`), `buttonVariants`, `Input`, `Label`, `Textarea`, `Card`/`CardHeader`/`CardTitle`/`CardDescription`/`CardContent`/`CardFooter` — every later admin form/page imports these by these exact names from `@/components/ui/<file>`.

- [ ] **Step 1: Write the failing test for `Button`**

Create `components/ui/button.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders its children and responds to click', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Lưu</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies the destructive variant class', () => {
    render(<Button variant="destructive">Xoá</Button>);
    expect(screen.getByRole('button', { name: 'Xoá' }).className).toContain('bg-destructive');
  });

  it('is disabled when the disabled prop is set', () => {
    render(<Button disabled>Đang lưu</Button>);
    expect(screen.getByRole('button', { name: 'Đang lưu' })).toBeDisabled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/ui/button.test.tsx`
Expected: FAIL — `Cannot find module './button'`

- [ ] **Step 3: Create `components/ui/button.tsx`**

```tsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/ui/button.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Create `components/ui/input.tsx`**

```tsx
import * as React from 'react';

import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
```

- [ ] **Step 6: Create `components/ui/label.tsx`**

```tsx
'use client';

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
```

- [ ] **Step 7: Create `components/ui/textarea.tsx`**

```tsx
import * as React from 'react';

import { cn } from '@/lib/utils';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
```

- [ ] **Step 8: Create `components/ui/card.tsx`**

```tsx
import * as React from 'react';

import { cn } from '@/lib/utils';

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-2xl font-semibold leading-none tracking-tight', className)} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
```

- [ ] **Step 9: Run the full test suite to confirm nothing broke**

Run: `npm test`
Expected: all previous tests still pass, plus the 3 new `Button` tests.

- [ ] **Step 10: Commit**

```bash
git add components/ui/button.tsx components/ui/button.test.tsx components/ui/input.tsx components/ui/label.tsx components/ui/textarea.tsx components/ui/card.tsx
git commit -m "feat: add shadcn Button, Input, Label, Textarea, Card primitives"
```

---

### Task 3: shadcn primitives — Select, Switch, Dialog

**Files:**
- Create: `components/ui/select.tsx`
- Create: `components/ui/switch.tsx`
- Create: `components/ui/dialog.tsx`
- Test: `components/ui/dialog.test.tsx`

**Interfaces:**
- Consumes: `cn` from `lib/utils.ts`.
- Produces: `Select`/`SelectTrigger`/`SelectValue`/`SelectContent`/`SelectItem`, `Switch`, `Dialog`/`DialogTrigger`/`DialogContent`/`DialogHeader`/`DialogFooter`/`DialogTitle`/`DialogDescription`/`DialogClose` — Task 11 (`ConfirmDeleteDialog`) and every resource form import these.

- [ ] **Step 1: Write the failing test for `Dialog`**

Create `components/ui/dialog.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';

describe('Dialog', () => {
  it('opens its content when the trigger is clicked', () => {
    render(
      <Dialog>
        <DialogTrigger>Mở</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tiêu đề</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
    expect(screen.queryByText('Tiêu đề')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Mở'));
    expect(screen.getByText('Tiêu đề')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/ui/dialog.test.tsx`
Expected: FAIL — `Cannot find module './dialog'`

- [ ] **Step 3: Create `components/ui/dialog.tsx`**

```tsx
'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg',
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
        <X className="h-4 w-4" />
        <span className="sr-only">Đóng</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/ui/dialog.test.tsx`
Expected: PASS

- [ ] **Step 5: Create `components/ui/select.tsx`**

```tsx
'use client';

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

const Select = SelectPrimitive.Root;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        position === 'popper' && 'translate-y-1',
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

export { Select, SelectValue, SelectTrigger, SelectContent, SelectItem };
```

- [ ] **Step 6: Create `components/ui/switch.tsx`**

```tsx
'use client';

import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';

import { cn } from '@/lib/utils';

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0'
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
```

- [ ] **Step 7: Run the full test suite**

Run: `npm test`
Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add components/ui/select.tsx components/ui/switch.tsx components/ui/dialog.tsx components/ui/dialog.test.tsx
git commit -m "feat: add shadcn Select, Switch, Dialog primitives"
```

---

### Task 4: shadcn primitives — Table, Sonner Toaster

**Files:**
- Create: `components/ui/table.tsx`
- Create: `components/ui/sonner.tsx`
- Test: `components/ui/table.test.tsx`

**Interfaces:**
- Consumes: `cn` from `lib/utils.ts`.
- Produces: `Table`/`TableHeader`/`TableBody`/`TableFooter`/`TableRow`/`TableHead`/`TableCell`/`TableCaption`, `Toaster` (Sonner wrapper) — Task 9's admin layout mounts `<Toaster />` once; every list page (categories/menu-items) uses the `Table` set.

- [ ] **Step 1: Write the failing test for `Table`**

Create `components/ui/table.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './table';

describe('Table', () => {
  it('renders header and body rows', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Phở bò Wagyu</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByText('Tên')).toBeInTheDocument();
    expect(screen.getByText('Phở bò Wagyu')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/ui/table.test.tsx`
Expected: FAIL — `Cannot find module './table'`

- [ ] **Step 3: Create `components/ui/table.tsx`**

```tsx
import * as React from 'react';

import { cn } from '@/lib/utils';

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table ref={ref} className={cn('w-full caption-bottom text-sm', className)} {...props} />
    </div>
  )
);
Table.displayName = 'Table';

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />
);
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
  )
);
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot ref={ref} className={cn('border-t bg-muted/50 font-medium', className)} {...props} />
  )
);
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn('border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted', className)}
      {...props}
    />
  )
);
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  )
);
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td ref={ref} className={cn('p-2 align-middle [&:has([role=checkbox])]:pr-0', className)} {...props} />
  )
);
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => (
    <caption ref={ref} className={cn('mt-4 text-sm text-muted-foreground', className)} {...props} />
  )
);
TableCaption.displayName = 'TableCaption';

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/ui/table.test.tsx`
Expected: PASS

- [ ] **Step 5: Create `components/ui/sonner.tsx`**

```tsx
'use client';

import { Toaster as SonnerToaster, type ToasterProps } from 'sonner';

const Toaster = (props: ToasterProps) => {
  return (
    <SonnerToaster
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
```

(No `next-themes` — the theme is hardcoded to `"light"` per the Global Constraints, since this admin panel has no dark-mode toggle.)

- [ ] **Step 6: Run the full test suite**

Run: `npm test`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add components/ui/table.tsx components/ui/table.test.tsx components/ui/sonner.tsx
git commit -m "feat: add shadcn Table and Sonner Toaster primitives"
```

---

### Task 5: shadcn Form primitives (react-hook-form integration)

**Files:**
- Create: `components/ui/form.tsx`
- Test: `components/ui/form.test.tsx`

**Interfaces:**
- Consumes: `Label` (Task 2), `cn` from `lib/utils.ts`, `react-hook-form`, `zod`.
- Produces: `Form` (alias for `FormProvider`), `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`, `useFormField()` — every resource form (`CategoryForm`, `MenuItemForm`, `RestaurantInfoForm`, and the login form) is built from these.

- [ ] **Step 1: Write the failing test**

Create `components/ui/form.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from './form';
import { Input } from './input';

const schema = z.object({ name: z.string().min(1, 'Tên là bắt buộc') });

function TestForm() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
  });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => {})}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit">Gửi</button>
      </form>
    </Form>
  );
}

describe('Form', () => {
  it('shows the zod validation message when the field is invalid', async () => {
    render(<TestForm />);
    fireEvent.click(screen.getByText('Gửi'));
    await waitFor(() => {
      expect(screen.getByText('Tên là bắt buộc')).toBeInTheDocument();
    });
  });

  it('associates the label with the input for accessibility', () => {
    render(<TestForm />);
    expect(screen.getByLabelText('Tên')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/ui/form.test.tsx`
Expected: FAIL — `Cannot find module './form'`

- [ ] **Step 3: Create `components/ui/form.tsx`**

```tsx
'use client';

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { Slot } from '@radix-ui/react-slot';
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = { id: string };

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const id = React.useId();
    return (
      <FormItemContext.Provider value={{ id }}>
        <div ref={ref} className={cn('space-y-2', className)} {...props} />
      </FormItemContext.Provider>
    );
  }
);
FormItem.displayName = 'FormItem';

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();
  return (
    <Label
      ref={ref}
      className={cn(error && 'text-destructive', className)}
      htmlFor={formItemId}
      {...props}
    />
  );
});
FormLabel.displayName = 'FormLabel';

const FormControl = React.forwardRef<React.ElementRef<typeof Slot>, React.ComponentPropsWithoutRef<typeof Slot>>(
  ({ ...props }, ref) => {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
    return (
      <Slot
        ref={ref}
        id={formItemId}
        aria-describedby={!error ? formDescriptionId : `${formDescriptionId} ${formMessageId}`}
        aria-invalid={!!error}
        {...props}
      />
    );
  }
);
FormControl.displayName = 'FormControl';

const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const { formDescriptionId } = useFormField();
    return (
      <p ref={ref} id={formDescriptionId} className={cn('text-sm text-muted-foreground', className)} {...props} />
    );
  }
);
FormDescription.displayName = 'FormDescription';

const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    const { error, formMessageId } = useFormField();
    const body = error ? String(error?.message) : children;
    if (!body) {
      return null;
    }
    return (
      <p ref={ref} id={formMessageId} className={cn('text-sm font-medium text-destructive', className)} {...props}>
        {body}
      </p>
    );
  }
);
FormMessage.displayName = 'FormMessage';

export { useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/ui/form.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Run the full test suite**

Run: `npm test`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add components/ui/form.tsx components/ui/form.test.tsx
git commit -m "feat: add shadcn Form primitives wired to react-hook-form"
```

---

### Task 6: `slugify()` pure helper

**Files:**
- Create: `lib/slug.ts`
- Create: `lib/slug.test.ts`

**Interfaces:**
- Produces: `slugify(input: string): string` — Task 13's category Server Action calls this to auto-generate `slug` from `name_vi`.

(An earlier draft of this task also planned a hand-rolled `moveItem<T>(items, from, to)` array-reorder helper for `SortableList` to call in its drag-end handler. It's not here: Task 12's `SortableList` reorders via `@dnd-kit/helpers`'s own `move()` function, which operates directly on a dnd-kit `DragEndEvent` — a hand-rolled `moveItem(items, fromIndex, toIndex)` would need the *same* indices `move()` already extracts from that event, so reimplementing it would only duplicate what the library does correctly, not replace a real need.)

- [ ] **Step 1: Write the failing test for `slugify`**

Create `lib/slug.test.ts`. The expected outputs are cross-checked against the real slugs already in `supabase/seed.sql` (e.g. `'Cơm & Mì, Bún'` → `'com-mi-bun'`, `'Đồ uống'` → `'do-uong'`), so a passing test here is evidence the function reproduces real production data, not just a synthetic case:

```ts
import { describe, it, expect } from 'vitest';
import { slugify } from './slug';

describe('slugify', () => {
  it('lowercases and strips Vietnamese diacritics', () => {
    expect(slugify('Khai vị')).toBe('khai-vi');
  });

  it('handles the standalone đ/Đ letter, which NFD normalization does not decompose', () => {
    expect(slugify('Đồ uống')).toBe('do-uong');
  });

  it('collapses punctuation and multiple spaces into single hyphens', () => {
    expect(slugify('Cơm & Mì, Bún')).toBe('com-mi-bun');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('  Tráng miệng!  ')).toBe('trang-mieng');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/slug.test.ts`
Expected: FAIL — `Cannot find module './slug'`

- [ ] **Step 3: Create `lib/slug.ts`**

```ts
// Matches Unicode combining diacritical marks (U+0300-U+036F) left behind
// after NFD normalization splits an accented letter into base + mark.
const COMBINING_DIACRITICS = /[̀-ͯ]/g;

export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(COMBINING_DIACRITICS, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/slug.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/slug.ts lib/slug.test.ts
git commit -m "feat: add slugify pure helper"
```

---

### Task 7: Auth guard logic + middleware

**Files:**
- Create: `lib/auth/admin-guard.ts`
- Create: `lib/auth/admin-guard.test.ts`
- Create: `lib/supabase/middleware.ts`
- Create: `middleware.ts`

**Interfaces:**
- Consumes: `@supabase/ssr`'s `createServerClient` (same package/pattern as `lib/supabase/server.ts`, but bound to `NextRequest`/`NextResponse` cookies instead of `next/headers`).
- Produces: `resolveAdminRedirect(pathname: string, isAuthenticated: boolean, isAdmin: boolean): string | null` — pure decision function, the only piece of the auth-gate that gets a real unit test (the rest is Next.js/Supabase wiring, verified live in Task 23).
- Produces: `createMiddlewareSupabaseClient(request: NextRequest): { supabase: SupabaseClient; response: NextResponse }` — `response` starts as `NextResponse.next()` and accumulates any refreshed session cookies as a side effect of calling `supabase.auth.getUser()`.

- [ ] **Step 1: Write the failing test for `resolveAdminRedirect`**

Create `lib/auth/admin-guard.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { resolveAdminRedirect } from './admin-guard';

describe('resolveAdminRedirect', () => {
  it('sends an unauthenticated visitor to /admin/login', () => {
    expect(resolveAdminRedirect('/admin', false, false)).toBe('/admin/login');
  });

  it('sends an authenticated non-admin to /admin/login with an error flag', () => {
    expect(resolveAdminRedirect('/admin', true, false)).toBe('/admin/login?error=unauthorized');
  });

  it('allows an authenticated admin through', () => {
    expect(resolveAdminRedirect('/admin', true, true)).toBeNull();
  });

  it('allows an unauthenticated visitor to see the login page', () => {
    expect(resolveAdminRedirect('/admin/login', false, false)).toBeNull();
  });

  it('redirects an already-authenticated admin away from the login page', () => {
    expect(resolveAdminRedirect('/admin/login', true, true)).toBe('/admin');
  });

  it('does not redirect an authenticated non-admin sitting on the login page', () => {
    expect(resolveAdminRedirect('/admin/login', true, false)).toBeNull();
  });

  it('is a no-op for paths outside /admin', () => {
    expect(resolveAdminRedirect('/menu', false, false)).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/auth/admin-guard.test.ts`
Expected: FAIL — `Cannot find module './admin-guard'`

- [ ] **Step 3: Create `lib/auth/admin-guard.ts`**

```ts
export function resolveAdminRedirect(
  pathname: string,
  isAuthenticated: boolean,
  isAdmin: boolean
): string | null {
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return isAuthenticated && isAdmin ? '/admin' : null;
  }

  if (!pathname.startsWith('/admin')) {
    return null;
  }

  if (!isAuthenticated) {
    return '/admin/login';
  }

  if (!isAdmin) {
    return '/admin/login?error=unauthorized';
  }

  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/auth/admin-guard.test.ts`
Expected: PASS (7 tests)

- [ ] **Step 5: Create `lib/supabase/middleware.ts`**

```ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }
  return value;
}

export function createMiddlewareSupabaseClient(request: NextRequest) {
  const response = NextResponse.next({ request: { headers: request.headers } });

  const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
  const anonKey = requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  return { supabase, response };
}
```

(This duplicates the small `requireEnv` helper already private to `lib/supabase/server.ts` and `lib/supabase/client.ts` rather than sharing it — consistent with the existing codebase, where those two already diverged for unrelated reasons and were deliberately left un-DRY'd.)

- [ ] **Step 6: Create `middleware.ts`** (project root, next to `next.config.mjs`)

```ts
import { NextResponse, type NextRequest } from 'next/server';
import { createMiddlewareSupabaseClient } from '@/lib/supabase/middleware';
import { resolveAdminRedirect } from '@/lib/auth/admin-guard';

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareSupabaseClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data } = await supabase.rpc('is_admin');
    isAdmin = data === true;
  }

  const redirectPath = resolveAdminRedirect(request.nextUrl.pathname, !!user, isAdmin);

  if (redirectPath) {
    const redirectResponse = NextResponse.redirect(new URL(redirectPath, request.url));
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
```

`getUser()` (never `getSession()`) is what actually contacts the Supabase auth server to verify the JWT — this is the one place in the whole app that decides whether to show the admin UI at all, so it must not trust an unverified cookie. `is_admin()` RPC re-checks the allowlist on every `/admin/**` request; Postgres RLS (already in `0001_init.sql`) is the ultimate authority underneath this, but this UI-level check stops a logged-in-but-non-admin user from ever seeing the admin shell.

- [ ] **Step 7: Verify the full site still builds**

Run: `npm run build`
Expected: succeeds. `middleware.ts` compiles into the Edge Runtime bundle Next.js reports separately in the build output; no `/admin/**` routes exist yet so there's nothing to manually test through the browser yet — that happens starting Task 8.

- [ ] **Step 8: Run the full test suite**

Run: `npm test`
Expected: all pass, including the 7 new `resolveAdminRedirect` tests.

- [ ] **Step 9: Commit**

```bash
git add lib/auth/admin-guard.ts lib/auth/admin-guard.test.ts lib/supabase/middleware.ts middleware.ts
git commit -m "feat: add admin route protection middleware"
```

---

### Task 8: Login page

**Files:**
- Create: `components/admin/LoginForm.tsx`
- Create: `components/admin/LoginForm.test.tsx`
- Create: `app/admin/login/page.tsx`

**Interfaces:**
- Consumes: `createBrowserSupabaseClient` from `lib/supabase/client.ts` (already fixed in the previous review round to read `NEXT_PUBLIC_*` vars via literal `process.env` access — this is the first real production call site that exercises that fix), `Form`/`FormField`/`FormItem`/`FormLabel`/`FormControl`/`FormMessage` (Task 5), `Button`/`Input` (Task 2).
- Produces: `LoginForm` — a standalone component, no other task consumes it directly.

**A routing note before this task — corrected after Task 14 caught a real build failure (see the ledger's Task 14 entry):** `app/admin/login/page.tsx` deliberately lives directly under the **literal** `app/admin/` folder, sibling to a **nested route group** `app/admin/(dashboard)/` used from Task 9 onward for every other admin route. Route-group parentheses are invisible to the URL — that cuts both ways. A single top-level group folder named e.g. `(admin)` containing a `page.tsx` would NOT put `/admin` in the URL at all; it would resolve to plain `/`, colliding with the public site's own `/` (this is exactly the bug Task 14 hit and this plan originally specified by mistake) — a route group never contributes a URL segment by itself, it only groups files for a shared layout. `admin` has to be a real, literal folder to put `/admin` in the URL at all; `(dashboard)` nested inside that literal folder then scopes the sidebar layout + auth check (Task 9) to everything under it without applying it to the sibling `app/admin/login/` — since `(dashboard)` is invisible to the URL, `app/admin/(dashboard)/page.tsx` resolves to `/admin`, `app/admin/(dashboard)/categories/page.tsx` resolves to `/admin/categories`, and so on. `app/admin/login/page.tsx` (→ `/admin/login`) and `app/admin/(dashboard)/page.tsx` (→ `/admin`, built in Task 10) coexist as sibling trees under `app/admin/` without conflict — this is the standard, Next.js-documented way to exclude one route from an otherwise-shared layout.

- [ ] **Step 1: Write the failing test**

Create `components/admin/LoginForm.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from './LoginForm';

const pushMock = vi.fn();
const refreshMock = vi.fn();
const signInWithPasswordMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/supabase/client', () => ({
  createBrowserSupabaseClient: () => ({
    auth: { signInWithPassword: signInWithPasswordMock },
  }),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    pushMock.mockClear();
    refreshMock.mockClear();
    signInWithPasswordMock.mockReset();
  });

  it('shows a validation error when submitted empty', async () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));
    await waitFor(() => {
      expect(screen.getByText('Email là bắt buộc')).toBeInTheDocument();
    });
  });

  it('redirects to /admin on successful login', async () => {
    signInWithPasswordMock.mockResolvedValue({ error: null });
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'admin@example.com' } });
    fireEvent.change(screen.getByLabelText('Mật khẩu'), { target: { value: 'secret123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/admin');
    });
    expect(refreshMock).toHaveBeenCalled();
  });

  it('shows an error message when Supabase rejects the credentials', async () => {
    signInWithPasswordMock.mockResolvedValue({ error: { message: 'Invalid login credentials' } });
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'admin@example.com' } });
    fireEvent.change(screen.getByLabelText('Mật khẩu'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Email hoặc mật khẩu không đúng.');
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/admin/LoginForm.test.tsx`
Expected: FAIL — `Cannot find module './LoginForm'`

- [ ] **Step 3: Create `components/admin/LoginForm.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

const loginSchema = z.object({
  email: z.string().min(1, 'Email là bắt buộc').email('Email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu là bắt buộc'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(
    searchParams.get('error') === 'unauthorized' ? 'Tài khoản không có quyền truy cập.' : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);
    setIsSubmitting(true);
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword(values);
    setIsSubmitting(false);
    if (error) {
      setServerError('Email hoặc mật khẩu không đúng.');
      return;
    }
    router.push('/admin');
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mật khẩu</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {serverError && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {serverError}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
        </Button>
      </form>
    </Form>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/admin/LoginForm.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Create `app/admin/login/page.tsx`**

```tsx
import { Suspense } from 'react';
import { LoginForm } from '@/components/admin/LoginForm';

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg border bg-card p-8 shadow-sm">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">Đăng nhập quản trị</h1>
          <p className="text-sm text-muted-foreground">Hương Việt Admin</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
```

(`LoginForm` is wrapped in `<Suspense>` because it calls `useSearchParams()` — Next.js 14 requires that inside a boundary or the build emits a CSR-bailout warning for the page.)

- [ ] **Step 6: Verify the full site builds and the route appears**

Run: `npm run build`
Expected: succeeds; `/admin/login` appears in the route list.

- [ ] **Step 7: Run the full test suite**

Run: `npm test`
Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add components/admin/LoginForm.tsx components/admin/LoginForm.test.tsx app/admin/login/page.tsx
git commit -m "feat: add admin login page"
```

---

### Task 9: Sidebar, admin layout, admin error boundary

**Files:**
- Create: `components/admin/Sidebar.tsx`
- Create: `components/admin/Sidebar.test.tsx`
- Create: `app/admin/(dashboard)/layout.tsx`
- Create: `app/admin/(dashboard)/error.tsx`

**Interfaces:**
- Consumes: `createBrowserSupabaseClient` (Sidebar's logout), `createServerSupabaseClient` (layout's server-side double-check), `Toaster` (Task 4), `cn` (Task 1), `Button` (Task 2).
- Produces: `Sidebar` — mounted only by `app/admin/(dashboard)/layout.tsx`.

- [ ] **Step 1: Write the failing test for `Sidebar`**

Create `components/admin/Sidebar.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Sidebar } from './Sidebar';

const pushMock = vi.fn();
const refreshMock = vi.fn();
const signOutMock = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/menu-items',
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}));

vi.mock('@/lib/supabase/client', () => ({
  createBrowserSupabaseClient: () => ({ auth: { signOut: signOutMock } }),
}));

describe('Sidebar', () => {
  beforeEach(() => {
    pushMock.mockClear();
    refreshMock.mockClear();
    signOutMock.mockReset().mockResolvedValue({ error: null });
  });

  it('renders every nav item', () => {
    render(<Sidebar />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Món ăn')).toBeInTheDocument();
    expect(screen.getByText('Danh mục')).toBeInTheDocument();
    expect(screen.getByText('Thông tin nhà hàng')).toBeInTheDocument();
    expect(screen.getByText('Thư viện ảnh')).toBeInTheDocument();
  });

  it('marks the current route as active', () => {
    render(<Sidebar />);
    expect(screen.getByText('Món ăn').className).toContain('bg-accent');
    expect(screen.getByText('Dashboard').className).not.toContain('bg-accent');
  });

  it('signs out and redirects to the login page on logout', async () => {
    render(<Sidebar />);
    fireEvent.click(screen.getByText('Đăng xuất'));
    await waitFor(() => {
      expect(signOutMock).toHaveBeenCalled();
    });
    expect(pushMock).toHaveBeenCalledWith('/admin/login');
    expect(refreshMock).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/admin/Sidebar.test.tsx`
Expected: FAIL — `Cannot find module './Sidebar'`

- [ ] **Step 3: Create `components/admin/Sidebar.tsx`**

```tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/menu-items', label: 'Món ăn' },
  { href: '/admin/categories', label: 'Danh mục' },
  { href: '/admin/restaurant-info', label: 'Thông tin nhà hàng' },
  { href: '/admin/gallery', label: 'Thư viện ảnh' },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="border-b p-4">
        <p className="font-semibold">Hương Việt Admin</p>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block rounded-md px-3 py-2 text-sm font-medium',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-2">
        <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
          Đăng xuất
        </Button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/admin/Sidebar.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Create `app/admin/(dashboard)/layout.tsx`**

```tsx
import { redirect } from 'next/navigation';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/admin/Sidebar';
import { Toaster } from '@/components/ui/sonner';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();

  let isAuthenticated = false;
  let isAdmin = false;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isAuthenticated = !!user;

    if (isAuthenticated) {
      const { data } = await supabase.rpc('is_admin');
      isAdmin = data === true;
    }
  } catch {
    // A genuine infrastructure failure (network error, Supabase outage)
    // leaves isAuthenticated/isAdmin at their fail-closed defaults (false) —
    // the redirect below then sends the visitor to the login page exactly
    // as it would for "not logged in". Deliberately outside this try block:
    // redirect() itself works by throwing a special Next.js control-flow
    // signal, and putting the redirect() calls inside here would mean this
    // catch swallows that signal instead of letting Next.js's router handle
    // it.
  }

  if (!isAuthenticated) {
    redirect('/admin/login');
  }

  if (!isAdmin) {
    redirect('/admin/login?error=unauthorized');
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
      <Toaster />
    </div>
  );
}
```

This double-checks `getUser()` + `is_admin()` even though `middleware.ts` (Task 7) already ran first — deliberate defense-in-depth per the spec, not redundant dead code: middleware and layout are two independently-deployable checks, and this project's global constraints call for not trusting any single layer absolutely.

- [ ] **Step 6: Create `app/admin/(dashboard)/error.tsx`**

```tsx
'use client';

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-xl font-semibold">Đã có lỗi xảy ra</h2>
      <p className="text-sm text-muted-foreground">
        Vui lòng thử lại. Nếu lỗi tiếp tục, liên hệ người quản trị hệ thống.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Thử lại
      </button>
    </div>
  );
}
```

**Placement note (same rule the public-site branch's final review caught):** `app/admin/(dashboard)/error.tsx` only catches errors thrown by *pages inside* the `(dashboard)` group — not errors thrown by `(dashboard)/layout.tsx` itself. A `getUser()`/`rpc('is_admin')` network failure inside the layout above falls through to the already-existing `app/error.tsx` (built in the public-site plan), which sits one level higher and does catch it — `app/admin/` itself has no `layout.tsx` of its own (nothing to fail there), so the chain is simply root → `app/admin/(dashboard)/layout.tsx` → `app/error.tsx` on failure. `redirect()` calls are not caught by either boundary — Next.js gives `redirect()` special handling specifically so it escapes error boundaries rather than being treated as a thrown error.

- [ ] **Step 7: Verify the full site builds**

Run: `npm run build`
Expected: succeeds. `/admin` now exists as a route (though its `page.tsx` doesn't exist until Task 10 — Next.js will report a 404 for it at this point, which is fine; nothing in this task depends on the dashboard page existing yet).

- [ ] **Step 8: Run the full test suite**

Run: `npm test`
Expected: all pass.

- [ ] **Step 9: Commit**

```bash
git add components/admin/Sidebar.tsx components/admin/Sidebar.test.tsx "app/admin/(dashboard)/layout.tsx" "app/admin/(dashboard)/error.tsx"
git commit -m "feat: add admin sidebar, layout auth double-check, and error boundary"
```

---

### Task 10: Dashboard

**Files:**
- Modify: `lib/supabase/test-helpers.ts`
- Create: `lib/supabase/admin-queries.ts`
- Create: `lib/supabase/admin-queries.test.ts`
- Create: `app/admin/(dashboard)/page.tsx`

**Interfaces:**
- Produces: `createFakeSupabaseSequence(results: FakeResult[]): SupabaseClient` — a second fake-client constructor alongside the existing `createFakeSupabase`, for tests where a function queries more than one table with different expected results per call, consumed in the order `.from()` is called. Later resource-schema tasks that test multi-query logic can reuse it.
- Produces: `getDashboardCounts(supabase): Promise<{ menuItemCount: number; unavailableMenuItemCount: number; categoryCount: number; galleryImageCount: number }>`.

- [ ] **Step 1: Write the failing test for `getDashboardCounts`**

First, extend `lib/supabase/test-helpers.ts` so `FakeResult` can carry a `count` field (Supabase's `count: 'exact', head: true` query style returns `{ count, error }` instead of `{ data, error }`) and add `createFakeSupabaseSequence`. Replace the file's contents with:

```ts
import type { SupabaseClient } from '@supabase/supabase-js';

type FakeResult = { data?: unknown; error: unknown; count?: number | null };

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

export function createFakeSupabaseSequence(results: FakeResult[]): SupabaseClient {
  const queue = [...results];
  return {
    from: () => createQueryBuilder(queue.shift() ?? { data: null, error: null }),
  } as unknown as SupabaseClient;
}
```

(`data` becomes optional rather than required — every existing call site already passes `data`, so this is backward compatible; it only relaxes what's *allowed*, per `lib/supabase/queries.test.ts`.)

Create `lib/supabase/admin-queries.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { createFakeSupabaseSequence } from './test-helpers';
import { getDashboardCounts } from './admin-queries';

describe('getDashboardCounts', () => {
  it('returns all four counts from the queries in order', async () => {
    const supabase = createFakeSupabaseSequence([
      { data: null, error: null, count: 30 },
      { data: null, error: null, count: 2 },
      { data: null, error: null, count: 7 },
      { data: null, error: null, count: 6 },
    ]);
    await expect(getDashboardCounts(supabase)).resolves.toEqual({
      menuItemCount: 30,
      unavailableMenuItemCount: 2,
      categoryCount: 7,
      galleryImageCount: 6,
    });
  });

  it('defaults a null count to 0', async () => {
    const supabase = createFakeSupabaseSequence([
      { data: null, error: null, count: null },
      { data: null, error: null, count: null },
      { data: null, error: null, count: null },
      { data: null, error: null, count: null },
    ]);
    await expect(getDashboardCounts(supabase)).resolves.toEqual({
      menuItemCount: 0,
      unavailableMenuItemCount: 0,
      categoryCount: 0,
      galleryImageCount: 0,
    });
  });

  it('throws when any of the four queries returns an error', async () => {
    const supabase = createFakeSupabaseSequence([
      { data: null, error: null, count: 30 },
      { data: null, error: new Error('db down'), count: null },
      { data: null, error: null, count: 7 },
      { data: null, error: null, count: 6 },
    ]);
    await expect(getDashboardCounts(supabase)).rejects.toThrow('db down');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/supabase/admin-queries.test.ts`
Expected: FAIL — `Cannot find module './admin-queries'`

- [ ] **Step 3: Run the existing `queries.test.ts` to confirm the `test-helpers.ts` change didn't break it**

Run: `npx vitest run lib/supabase/queries.test.ts`
Expected: PASS (still 8/8 — confirms the `FakeResult.data` optionality change is backward compatible).

- [ ] **Step 4: Create `lib/supabase/admin-queries.ts`**

```ts
import type { SupabaseClient } from '@supabase/supabase-js';

export type DashboardCounts = {
  menuItemCount: number;
  unavailableMenuItemCount: number;
  categoryCount: number;
  galleryImageCount: number;
};

export async function getDashboardCounts(supabase: SupabaseClient): Promise<DashboardCounts> {
  const [menuItems, unavailable, categories, gallery] = await Promise.all([
    supabase.from('menu_items').select('*', { count: 'exact', head: true }),
    supabase.from('menu_items').select('*', { count: 'exact', head: true }).eq('is_available', false),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase.from('gallery_images').select('*', { count: 'exact', head: true }),
  ]);

  for (const result of [menuItems, unavailable, categories, gallery]) {
    if (result.error) throw result.error;
  }

  return {
    menuItemCount: menuItems.count ?? 0,
    unavailableMenuItemCount: unavailable.count ?? 0,
    categoryCount: categories.count ?? 0,
    galleryImageCount: gallery.count ?? 0,
  };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run lib/supabase/admin-queries.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 6: Create `app/admin/(dashboard)/page.tsx`**

```tsx
import Link from 'next/link';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getDashboardCounts } from '@/lib/supabase/admin-queries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const STAT_CARDS = [
  { key: 'menuItemCount', label: 'Tổng số món ăn', href: '/admin/menu-items' },
  { key: 'unavailableMenuItemCount', label: 'Món hết hàng', href: '/admin/menu-items' },
  { key: 'categoryCount', label: 'Danh mục', href: '/admin/categories' },
  { key: 'galleryImageCount', label: 'Ảnh gallery', href: '/admin/gallery' },
] as const;

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const counts = await getDashboardCounts(supabase);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((stat) => (
          <Link key={stat.key} href={stat.href}>
            <Card className="transition-colors hover:border-primary">
              <CardHeader>
                <CardTitle className="text-3xl">{counts[stat.key]}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Run the full test suite**

Run: `npm test`
Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add lib/supabase/test-helpers.ts lib/supabase/admin-queries.ts lib/supabase/admin-queries.test.ts "app/admin/(dashboard)/page.tsx"
git commit -m "feat: add admin dashboard with live counts"
```

---

### Task 11: `ActionResult` type and `ConfirmDeleteDialog`

**Files:**
- Create: `lib/actions/types.ts`
- Create: `components/admin/ConfirmDeleteDialog.tsx`
- Create: `components/admin/ConfirmDeleteDialog.test.tsx`

**Interfaces:**
- Produces: `type ActionResult = { success: true } | { success: false; error: string }` — every Server Action from Task 13 onward returns this.
- Produces: `ConfirmDeleteDialog` (props: `open: boolean`, `onOpenChange: (open: boolean) => void`, `onConfirm: () => void`, `itemName: string`) — every resource's list page (Tasks 15, 18, 22) uses this for delete confirmation.

- [ ] **Step 1: Create `lib/actions/types.ts`** (no test needed — this is a type-only file, nothing to run)

```ts
export type ActionResult = { success: true } | { success: false; error: string };
```

- [ ] **Step 2: Write the failing test for `ConfirmDeleteDialog`**

Create `components/admin/ConfirmDeleteDialog.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';

describe('ConfirmDeleteDialog', () => {
  it('does not render its content when closed', () => {
    render(<ConfirmDeleteDialog open={false} onOpenChange={vi.fn()} onConfirm={vi.fn()} itemName="Phở bò" />);
    expect(screen.queryByText('Xoá "Phở bò"?')).not.toBeInTheDocument();
  });

  it('shows the item name and calls onConfirm when confirmed', () => {
    const onConfirm = vi.fn();
    render(<ConfirmDeleteDialog open={true} onOpenChange={vi.fn()} onConfirm={onConfirm} itemName="Phở bò" />);
    expect(screen.getByText('Xoá "Phở bò"?')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Xoá' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenChange(false) when Huỷ is clicked', () => {
    const onOpenChange = vi.fn();
    render(<ConfirmDeleteDialog open={true} onOpenChange={onOpenChange} onConfirm={vi.fn()} itemName="Phở bò" />);
    fireEvent.click(screen.getByRole('button', { name: 'Huỷ' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run components/admin/ConfirmDeleteDialog.test.tsx`
Expected: FAIL — `Cannot find module './ConfirmDeleteDialog'`

- [ ] **Step 4: Create `components/admin/ConfirmDeleteDialog.tsx`**

```tsx
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  itemName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  itemName: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xoá &quot;{itemName}&quot;?</DialogTitle>
          <DialogDescription>Hành động này không thể hoàn tác.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Huỷ
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Xoá
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run components/admin/ConfirmDeleteDialog.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 6: Run the full test suite**

Run: `npm test`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add lib/actions/types.ts components/admin/ConfirmDeleteDialog.tsx components/admin/ConfirmDeleteDialog.test.tsx
git commit -m "feat: add ActionResult type and ConfirmDeleteDialog"
```

---

### Task 12: `ImageUploader` and `SortableList`

**Files:**
- Create: `components/admin/ImageUploader.tsx`
- Create: `components/admin/ImageUploader.test.tsx`
- Create: `components/admin/SortableList.tsx`
- Create: `components/admin/SortableList.test.tsx`

**Interfaces:**
- Consumes: `createBrowserSupabaseClient` (Task 4 of the public-site plan, since fixed), `Button`/`Label` (Task 2), `@dnd-kit/react`'s `DragDropProvider`/`useSortable`, `@dnd-kit/helpers`'s `move`.
- Produces: `ImageUploader` (props: `bucket: 'dish-images' | 'site-media'`, `existingUrl?: string`, `label: string`, `onUploaded: (url: string) => void`) — Task 17 (menu item form), Task 20 (restaurant info form, used twice for logo + hero), and Task 22 (gallery page) all use this.
- Produces: `SortableList<T extends {id: string}>` (props: `items: T[]`, `onReorder: (orderedIds: string[]) => void`, `renderItem: (item: T, index: number) => ReactNode`) — Task 15 (categories list), Task 18 (menu items list), and Task 22 (gallery) all use this.

- [ ] **Step 1: Write the failing test for `ImageUploader`**

Create `components/admin/ImageUploader.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImageUploader } from './ImageUploader';

const uploadMock = vi.fn();
const getPublicUrlMock = vi.fn();
const removeMock = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createBrowserSupabaseClient: () => ({
    storage: {
      from: () => ({
        upload: uploadMock,
        getPublicUrl: getPublicUrlMock,
        remove: removeMock,
      }),
    },
  }),
}));

function makeFile(name: string, type: string, sizeBytes: number) {
  return new File(['x'.repeat(sizeBytes)], name, { type });
}

describe('ImageUploader', () => {
  beforeEach(() => {
    uploadMock.mockReset();
    getPublicUrlMock.mockReset();
    removeMock.mockReset().mockResolvedValue({ error: null });
  });

  it('rejects a file with a disallowed type', async () => {
    render(<ImageUploader bucket="dish-images" label="Ảnh món ăn" onUploaded={vi.fn()} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile('a.gif', 'image/gif', 100)] } });
    expect(await screen.findByText('Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.')).toBeInTheDocument();
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it('rejects a file larger than 5MB', async () => {
    render(<ImageUploader bucket="dish-images" label="Ảnh món ăn" onUploaded={vi.fn()} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile('big.jpg', 'image/jpeg', 6 * 1024 * 1024)] } });
    expect(await screen.findByText('Dung lượng ảnh tối đa là 5MB.')).toBeInTheDocument();
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it('uploads a valid file and calls onUploaded with the public URL', async () => {
    uploadMock.mockResolvedValue({ error: null });
    getPublicUrlMock.mockReturnValue({
      data: { publicUrl: 'https://x.supabase.co/storage/v1/object/public/dish-images/abc.jpg' },
    });
    const onUploaded = vi.fn();
    render(<ImageUploader bucket="dish-images" label="Ảnh món ăn" onUploaded={onUploaded} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile('dish.jpg', 'image/jpeg', 1024)] } });
    await waitFor(() => {
      expect(onUploaded).toHaveBeenCalledWith(
        'https://x.supabase.co/storage/v1/object/public/dish-images/abc.jpg'
      );
    });
    expect(removeMock).not.toHaveBeenCalled();
  });

  it('deletes the previous file from storage when an existing image is replaced', async () => {
    uploadMock.mockResolvedValue({ error: null });
    getPublicUrlMock.mockReturnValue({
      data: { publicUrl: 'https://x.supabase.co/storage/v1/object/public/dish-images/new.jpg' },
    });
    render(
      <ImageUploader
        bucket="dish-images"
        label="Ảnh món ăn"
        existingUrl="https://x.supabase.co/storage/v1/object/public/dish-images/old.jpg"
        onUploaded={vi.fn()}
      />
    );
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile('new.jpg', 'image/jpeg', 1024)] } });
    await waitFor(() => {
      expect(removeMock).toHaveBeenCalledWith(['old.jpg']);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/admin/ImageUploader.test.tsx`
Expected: FAIL — `Cannot find module './ImageUploader'`

- [ ] **Step 3: Create `components/admin/ImageUploader.tsx`**

```tsx
'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';

import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function extractStoragePath(url: string, bucket: string): string | null {
  const marker = `/object/public/${bucket}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return url.slice(index + marker.length);
}

export function ImageUploader({
  bucket,
  existingUrl,
  onUploaded,
  label,
}: {
  bucket: 'dish-images' | 'site-media';
  existingUrl?: string;
  onUploaded: (url: string) => void;
  label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(existingUrl);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError('Dung lượng ảnh tối đa là 5MB.');
      return;
    }

    setError(null);
    setIsUploading(true);

    const supabase = createBrowserSupabaseClient();
    const extension = file.name.split('.').pop();
    const path = `${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file);
    setIsUploading(false);

    if (uploadError) {
      setError('Upload ảnh thất bại. Vui lòng thử lại.');
      return;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);

    // Spec §6: once the new file is safely uploaded, delete the file it
    // replaces so Storage doesn't accumulate orphaned images. This reads
    // `previewUrl` (the *current* state, which already reflects any earlier
    // replacement made in this same session) rather than the `existingUrl`
    // prop, so a second replace-in-a-row cleans up the first replacement's
    // file, not the original one from before the component mounted.
    const previousPath = previewUrl ? extractStoragePath(previewUrl, bucket) : null;
    if (previousPath) {
      await supabase.storage.from(bucket).remove([previousPath]);
    }

    setPreviewUrl(data.publicUrl);
    onUploaded(data.publicUrl);
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {previewUrl && (
        <div className="relative h-32 w-32 overflow-hidden rounded-md border">
          <Image src={previewUrl} alt={label} fill className="object-cover" sizes="128px" />
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={isUploading}>
        {isUploading ? 'Đang tải lên…' : previewUrl ? 'Đổi ảnh' : 'Tải ảnh lên'}
      </Button>
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
```

`bucket` is a plain prop, not derived from `existingUrl` — the caller (each form) always knows which bucket it's writing to (`dish-images` for menu items, `site-media` for restaurant info/gallery), so there's no ambiguity to resolve at runtime.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/admin/ImageUploader.test.tsx`
Expected: PASS (5 tests)

- [ ] **Step 5: Write the failing test for `SortableList`**

Create `components/admin/SortableList.test.tsx`. This only smoke-tests render order, not actual drag physics — jsdom has no real pointer/layout engine to drive dnd-kit's sensors meaningfully, so the codebase's established pattern (per the spec: verify Supabase-touching and interaction-heavy code live rather than mocking it into meaninglessness) applies here too. The reorder math itself is `@dnd-kit/helpers`'s own `move()`, a library function this plan doesn't need to re-verify; the actual drag interaction gets verified in a real browser in Task 23.

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SortableList } from './SortableList';

describe('SortableList', () => {
  it('renders every item in the given order', () => {
    const items = [
      { id: '1', name: 'Khai vị' },
      { id: '2', name: 'Súp' },
      { id: '3', name: 'Tráng miệng' },
    ];
    render(
      <SortableList items={items} onReorder={vi.fn()} renderItem={(item) => <span>{item.name}</span>} />
    );
    const rendered = screen.getAllByRole('listitem').map((el) => el.textContent);
    expect(rendered).toEqual(['Khai vị', 'Súp', 'Tráng miệng']);
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npx vitest run components/admin/SortableList.test.tsx`
Expected: FAIL — `Cannot find module './SortableList'`

- [ ] **Step 7: Create `components/admin/SortableList.tsx`**

```tsx
'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { DragDropProvider } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { move } from '@dnd-kit/helpers';

export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
}: {
  items: T[];
  onReorder: (orderedIds: string[]) => void;
  renderItem: (item: T, index: number) => ReactNode;
}) {
  const [localItems, setLocalItems] = useState(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return;
        setLocalItems((current) => {
          const next = move(current, event);
          onReorder(next.map((item) => item.id));
          return next;
        });
      }}
    >
      <ul className="space-y-2">
        {localItems.map((item, index) => (
          <SortableRow key={item.id} id={item.id} index={index}>
            {renderItem(item, index)}
          </SortableRow>
        ))}
      </ul>
    </DragDropProvider>
  );
}

function SortableRow({ id, index, children }: { id: string; index: number; children: ReactNode }) {
  const { ref, isDragging } = useSortable({ id, index });

  return (
    <li ref={ref} className={isDragging ? 'opacity-50' : undefined}>
      {children}
    </li>
  );
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npx vitest run components/admin/SortableList.test.tsx`
Expected: PASS

- [ ] **Step 9: Run the full test suite**

Run: `npm test`
Expected: all pass.

- [ ] **Step 10: Commit**

```bash
git add components/admin/ImageUploader.tsx components/admin/ImageUploader.test.tsx components/admin/SortableList.tsx components/admin/SortableList.test.tsx
git commit -m "feat: add ImageUploader and SortableList shared components"
```

---

### Task 13: Category validation schema + Server Actions

**Files:**
- Create: `lib/validation/category.ts`
- Create: `lib/validation/category.test.ts`
- Create: `app/actions/categories.ts`

**Interfaces:**
- Produces: `categorySchema` (zod), `type CategoryFormValues = z.infer<typeof categorySchema>` — Task 14's `CategoryForm` uses both.
- Produces: `createCategory(formData: FormData): Promise<ActionResult>`, `updateCategory(id: string, formData: FormData): Promise<ActionResult>`, `deleteCategory(id: string): Promise<ActionResult>`, `reorderCategories(orderedIds: string[]): Promise<ActionResult>` — Task 14 (`CategoryForm`) and Task 15 (`CategoriesTable`) call these by these exact names.
- Consumes: `slugify` (Task 6), `ActionResult` (Task 11), `createServerSupabaseClient` (already exists).

**Not unit-tested (per the spec's test strategy — verified live in Task 23 instead):** the four Server Actions themselves, since they only make sense against a real Postgres connection with real RLS. Only the zod schema gets a real test here.

- [ ] **Step 1: Write the failing test for `categorySchema`**

Create `lib/validation/category.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { categorySchema } from './category';

describe('categorySchema', () => {
  it('accepts a valid category', () => {
    const result = categorySchema.safeParse({
      name_vi: 'Khai vị',
      name_en: 'Appetizers',
      description_vi: '',
      description_en: '',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a missing Vietnamese name', () => {
    const result = categorySchema.safeParse({
      name_vi: '',
      name_en: 'Appetizers',
      description_vi: '',
      description_en: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a missing English name', () => {
    const result = categorySchema.safeParse({
      name_vi: 'Khai vị',
      name_en: '',
      description_vi: '',
      description_en: '',
    });
    expect(result.success).toBe(false);
  });

  it('defaults description fields to empty strings when omitted', () => {
    const result = categorySchema.safeParse({ name_vi: 'Khai vị', name_en: 'Appetizers' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description_vi).toBe('');
      expect(result.data.description_en).toBe('');
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/validation/category.test.ts`
Expected: FAIL — `Cannot find module './category'`

- [ ] **Step 3: Create `lib/validation/category.ts`**

```ts
import { z } from 'zod';

export const categorySchema = z.object({
  name_vi: z.string().min(1, 'Tên tiếng Việt là bắt buộc'),
  name_en: z.string().min(1, 'Tên tiếng Anh là bắt buộc'),
  description_vi: z.string().default(''),
  description_en: z.string().default(''),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/validation/category.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Create `app/actions/categories.ts`**

```ts
'use server';

import { revalidatePath } from 'next/cache';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { categorySchema } from '@/lib/validation/category';
import { slugify } from '@/lib/slug';
import type { ActionResult } from '@/lib/actions/types';

function parseFormData(formData: FormData) {
  return categorySchema.safeParse({
    name_vi: formData.get('name_vi'),
    name_en: formData.get('name_en'),
    description_vi: formData.get('description_vi') ?? '',
    description_en: formData.get('description_en') ?? '',
  });
}

export async function createCategory(formData: FormData): Promise<ActionResult> {
  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createServerSupabaseClient();
  const { count } = await supabase.from('categories').select('*', { count: 'exact', head: true });

  const { error } = await supabase.from('categories').insert({
    ...parsed.data,
    slug: slugify(parsed.data.name_vi),
    display_order: (count ?? 0) + 1,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/menu');
  revalidatePath('/');
  return { success: true };
}

export async function updateCategory(id: string, formData: FormData): Promise<ActionResult> {
  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from('categories')
    .update({ ...parsed.data, slug: slugify(parsed.data.name_vi) })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/menu');
  revalidatePath('/');
  return { success: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from('categories').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/menu');
  revalidatePath('/');
  return { success: true };
}

export async function reorderCategories(orderedIds: string[]): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();

  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('categories').update({ display_order: index + 1 }).eq('id', id)
    )
  );

  const failed = results.find((result) => result.error);
  if (failed?.error) {
    return { success: false, error: failed.error.message };
  }

  revalidatePath('/menu');
  return { success: true };
}
```

Reordering uses one `.update()` call per row (`Promise.all`'d) rather than a single `.upsert()` — `categories.name_vi`/`name_en`/`slug` are `NOT NULL` with no default, and an `.upsert()` given only `{id, display_order}` risks failing that constraint on the attempted-insert path before Postgres ever reaches the `ON CONFLICT DO UPDATE` branch. Per-row `.update()` only ever touches the one column being changed, so it can't violate an unrelated `NOT NULL` constraint. The list sizes here (a handful of categories, a few dozen menu items) make N small updates entirely reasonable — this is not a hot path.

`createCategory`'s `display_order` (existing count + 1) has a benign race if two creates happen in the same instant — acceptable for a single-admin tool with no concurrent-editor requirement (per the spec's explicit non-goal: no multi-admin support this round).

- [ ] **Step 6: Verify the full site still builds**

Run: `npm run build`
Expected: succeeds (Server Actions compile as part of the route they're imported from; none are imported anywhere yet, so this just confirms no syntax/type errors).

- [ ] **Step 7: Run the full test suite**

Run: `npm test`
Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add lib/validation/category.ts lib/validation/category.test.ts app/actions/categories.ts
git commit -m "feat: add category validation schema and Server Actions"
```

---

### Task 14: `CategoryForm` and its new/edit pages

**Files:**
- Create: `components/admin/CategoryForm.tsx`
- Create: `components/admin/CategoryForm.test.tsx`
- Create: `app/admin/(dashboard)/categories/new/page.tsx`
- Create: `app/admin/(dashboard)/categories/[id]/edit/page.tsx`

**Interfaces:**
- Consumes: `categorySchema`/`CategoryFormValues` (Task 13), `createCategory`/`updateCategory` (Task 13), `Category` type (`lib/types.ts`, already exists), `Form`/`FormField`/etc. (Task 5), `Button`/`Input`/`Textarea` (Task 2).
- Produces: `CategoryForm` (props: `category?: Category` — omitted means "create" mode, present means "edit" mode).

- [ ] **Step 1: Write the failing test for `CategoryForm`**

Create `components/admin/CategoryForm.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CategoryForm } from './CategoryForm';

const pushMock = vi.fn();
const refreshMock = vi.fn();
const createCategoryMock = vi.fn();
const updateCategoryMock = vi.fn();
const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}));

vi.mock('@/app/actions/categories', () => ({
  createCategory: (...args: unknown[]) => createCategoryMock(...args),
  updateCategory: (...args: unknown[]) => updateCategoryMock(...args),
}));

vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

describe('CategoryForm', () => {
  beforeEach(() => {
    pushMock.mockClear();
    refreshMock.mockClear();
    createCategoryMock.mockReset();
    updateCategoryMock.mockReset();
    toastSuccessMock.mockClear();
    toastErrorMock.mockClear();
  });

  it('shows a validation error when the Vietnamese name is empty', async () => {
    render(<CategoryForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
    await waitFor(() => {
      expect(screen.getByText('Tên tiếng Việt là bắt buộc')).toBeInTheDocument();
    });
    expect(createCategoryMock).not.toHaveBeenCalled();
  });

  it('calls createCategory and redirects on success when adding a new category', async () => {
    createCategoryMock.mockResolvedValue({ success: true });
    render(<CategoryForm />);
    fireEvent.change(screen.getByLabelText('Tên (Tiếng Việt)'), { target: { value: 'Khai vị' } });
    fireEvent.change(screen.getByLabelText('Tên (Tiếng Anh)'), { target: { value: 'Appetizers' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
    await waitFor(() => {
      expect(createCategoryMock).toHaveBeenCalledTimes(1);
    });
    expect(pushMock).toHaveBeenCalledWith('/admin/categories');
    expect(toastSuccessMock).toHaveBeenCalled();
  });

  it('calls updateCategory instead of createCategory when a category is passed in', async () => {
    updateCategoryMock.mockResolvedValue({ success: true });
    render(
      <CategoryForm
        category={{
          id: 'cat-1',
          name_vi: 'Khai vị',
          name_en: 'Appetizers',
          slug: 'khai-vi',
          description_vi: '',
          description_en: '',
          display_order: 1,
        }}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
    await waitFor(() => {
      expect(updateCategoryMock).toHaveBeenCalledWith('cat-1', expect.any(FormData));
    });
    expect(createCategoryMock).not.toHaveBeenCalled();
  });

  it('shows a toast error and does not redirect when the action fails', async () => {
    createCategoryMock.mockResolvedValue({ success: false, error: 'Slug đã tồn tại.' });
    render(<CategoryForm />);
    fireEvent.change(screen.getByLabelText('Tên (Tiếng Việt)'), { target: { value: 'Khai vị' } });
    fireEvent.change(screen.getByLabelText('Tên (Tiếng Anh)'), { target: { value: 'Appetizers' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('Slug đã tồn tại.');
    });
    expect(pushMock).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/admin/CategoryForm.test.tsx`
Expected: FAIL — `Cannot find module './CategoryForm'`

- [ ] **Step 3: Create `components/admin/CategoryForm.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { categorySchema, type CategoryFormValues } from '@/lib/validation/category';
import { createCategory, updateCategory } from '@/app/actions/categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import type { Category } from '@/lib/types';

export function CategoryForm({ category }: { category?: Category }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name_vi: category?.name_vi ?? '',
      name_en: category?.name_en ?? '',
      description_vi: category?.description_vi ?? '',
      description_en: category?.description_en ?? '',
    },
  });

  async function onSubmit(values: CategoryFormValues) {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.set('name_vi', values.name_vi);
    formData.set('name_en', values.name_en);
    formData.set('description_vi', values.description_vi);
    formData.set('description_en', values.description_en);

    const result = category
      ? await updateCategory(category.id, formData)
      : await createCategory(formData);

    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(category ? 'Đã cập nhật danh mục.' : 'Đã thêm danh mục.');
    router.push('/admin/categories');
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-lg space-y-4">
        <FormField
          control={form.control}
          name="name_vi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên (Tiếng Việt)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name_en"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên (Tiếng Anh)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description_vi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả (Tiếng Việt)</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description_en"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả (Tiếng Anh)</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Đang lưu…' : 'Lưu'}
        </Button>
      </form>
    </Form>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/admin/CategoryForm.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 5: Create `app/admin/(dashboard)/categories/new/page.tsx`**

```tsx
import { CategoryForm } from '@/components/admin/CategoryForm';

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Thêm danh mục</h1>
      <CategoryForm />
    </div>
  );
}
```

- [ ] **Step 6: Create `app/admin/(dashboard)/categories/[id]/edit/page.tsx`**

```tsx
import { notFound } from 'next/navigation';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { CategoryForm } from '@/components/admin/CategoryForm';

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabaseClient();
  const { data: category } = await supabase.from('categories').select('*').eq('id', params.id).single();

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Sửa danh mục</h1>
      <CategoryForm category={category} />
    </div>
  );
}
```

- [ ] **Step 7: Verify the full site builds**

Run: `npm run build`
Expected: succeeds; `/admin/categories/new` and `/admin/categories/[id]/edit` appear as routes.

- [ ] **Step 8: Run the full test suite**

Run: `npm test`
Expected: all pass.

- [ ] **Step 9: Commit**

```bash
git add components/admin/CategoryForm.tsx components/admin/CategoryForm.test.tsx "app/admin/(dashboard)/categories/new/page.tsx" "app/admin/(dashboard)/categories/[id]/edit/page.tsx"
git commit -m "feat: add category create/edit form and pages"
```

---

### Task 15: Categories list page

**Files:**
- Create: `components/admin/CategoriesTable.tsx`
- Create: `components/admin/CategoriesTable.test.tsx`
- Create: `app/admin/(dashboard)/categories/page.tsx`

**Interfaces:**
- Consumes: `getCategories` (already exists in `lib/supabase/queries.ts` — the same public-site query function, reused as-is since "all categories ordered by `display_order`" is exactly what the admin list needs too), `deleteCategory`/`reorderCategories` (Task 13), `SortableList` (Task 12), `ConfirmDeleteDialog` (Task 11).
- Produces: `CategoriesTable` (props: `categories: Category[]`).

- [ ] **Step 1: Write the failing test for `CategoriesTable`**

Create `components/admin/CategoriesTable.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { CategoriesTable } from './CategoriesTable';

const refreshMock = vi.fn();
const deleteCategoryMock = vi.fn();
const reorderCategoriesMock = vi.fn();
const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

vi.mock('@/app/actions/categories', () => ({
  deleteCategory: (...args: unknown[]) => deleteCategoryMock(...args),
  reorderCategories: (...args: unknown[]) => reorderCategoriesMock(...args),
}));

vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

const categories = [
  {
    id: '1',
    name_vi: 'Khai vị',
    name_en: 'Appetizers',
    slug: 'khai-vi',
    description_vi: '',
    description_en: '',
    display_order: 1,
  },
  {
    id: '2',
    name_vi: 'Súp',
    name_en: 'Soups',
    slug: 'sup',
    description_vi: '',
    description_en: '',
    display_order: 2,
  },
];

describe('CategoriesTable', () => {
  beforeEach(() => {
    refreshMock.mockClear();
    deleteCategoryMock.mockReset();
    reorderCategoriesMock.mockReset();
    toastSuccessMock.mockClear();
    toastErrorMock.mockClear();
  });

  it('renders every category', () => {
    render(<CategoriesTable categories={categories} />);
    expect(screen.getByText('Khai vị')).toBeInTheDocument();
    expect(screen.getByText('Súp')).toBeInTheDocument();
  });

  it('opens the confirm dialog with the right item name when Xoá is clicked', () => {
    render(<CategoriesTable categories={categories} />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Xoá' })[0]);
    expect(screen.getByText('Xoá "Khai vị"?')).toBeInTheDocument();
  });

  it('calls deleteCategory and refreshes on confirm', async () => {
    deleteCategoryMock.mockResolvedValue({ success: true });
    render(<CategoriesTable categories={categories} />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Xoá' })[0]);
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xoá' }));
    await waitFor(() => {
      expect(deleteCategoryMock).toHaveBeenCalledWith('1');
    });
    expect(refreshMock).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/admin/CategoriesTable.test.tsx`
Expected: FAIL — `Cannot find module './CategoriesTable'`

- [ ] **Step 3: Create `components/admin/CategoriesTable.tsx`**

```tsx
'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { deleteCategory, reorderCategories } from '@/app/actions/categories';
import { SortableList } from '@/components/admin/SortableList';
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteDialog';
import { Button } from '@/components/ui/button';
import type { Category } from '@/lib/types';

export function CategoriesTable({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const [, startTransition] = useTransition();

  function handleReorder(orderedIds: string[]) {
    startTransition(async () => {
      const result = await reorderCategories(orderedIds);
      if (!result.success) {
        toast.error(result.error);
      }
    });
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    const result = await deleteCategory(pendingDelete.id);
    setPendingDelete(null);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success('Đã xoá danh mục.');
    router.refresh();
  }

  return (
    <>
      <SortableList
        items={categories}
        onReorder={handleReorder}
        renderItem={(category) => (
          <div className="flex items-center justify-between rounded-md border bg-card p-4">
            <div>
              <p className="font-medium">{category.name_vi}</p>
              <p className="text-sm text-muted-foreground">{category.name_en}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/categories/${category.id}/edit`}>Sửa</Link>
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setPendingDelete(category)}>
                Xoá
              </Button>
            </div>
          </div>
        )}
      />
      <ConfirmDeleteDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
        itemName={pendingDelete?.name_vi ?? ''}
      />
    </>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/admin/CategoriesTable.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Create `app/admin/(dashboard)/categories/page.tsx`**

```tsx
import Link from 'next/link';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getCategories } from '@/lib/supabase/queries';
import { Button } from '@/components/ui/button';
import { CategoriesTable } from '@/components/admin/CategoriesTable';

export default async function CategoriesPage() {
  const supabase = await createServerSupabaseClient();
  const categories = await getCategories(supabase);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Danh mục</h1>
        <Button asChild>
          <Link href="/admin/categories/new">Thêm danh mục</Link>
        </Button>
      </div>
      <CategoriesTable categories={categories} />
    </div>
  );
}
```

- [ ] **Step 6: Verify the full site builds**

Run: `npm run build`
Expected: succeeds; `/admin/categories` appears as a route.

- [ ] **Step 7: Run the full test suite**

Run: `npm test`
Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add components/admin/CategoriesTable.tsx components/admin/CategoriesTable.test.tsx "app/admin/(dashboard)/categories/page.tsx"
git commit -m "feat: add categories list page with reorder and delete"
```

---

### Task 16: Menu item validation schema + Server Actions

**Files:**
- Create: `lib/validation/menu-item.ts`
- Create: `lib/validation/menu-item.test.ts`
- Create: `app/actions/menu-items.ts`

**Interfaces:**
- Produces: `menuItemSchema`, `type MenuItemFormValues` — Task 17's `MenuItemForm` uses both.
- Produces: `createMenuItem`, `updateMenuItem`, `deleteMenuItem`, `reorderMenuItems` (all `Promise<ActionResult>`) — Tasks 17 and 18 call these.

**A zod-coercion pitfall this schema deliberately avoids:** `z.coerce.boolean()` on a `"false"` string evaluates to `true`, because JS's `Boolean("false")` is `true` for any non-empty string — a classic footgun. `is_available`/`is_featured` are typed as plain `z.boolean()` here, and the Server Action converts the `FormData` string itself (`formData.get('is_available') === 'true'`) *before* handing it to zod, rather than letting zod's coercion touch it.

- [ ] **Step 1: Write the failing test for `menuItemSchema`**

Create `lib/validation/menu-item.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { menuItemSchema } from './menu-item';

const validInput = {
  category_id: 'cat-1',
  name_vi: 'Phở bò Wagyu',
  name_en: 'Wagyu Beef Pho',
  description_vi: '',
  description_en: '',
  price: 285000,
  image_url: '',
  is_available: true,
  is_featured: false,
};

describe('menuItemSchema', () => {
  it('accepts a valid menu item', () => {
    expect(menuItemSchema.safeParse(validInput).success).toBe(true);
  });

  it('requires a category', () => {
    expect(menuItemSchema.safeParse({ ...validInput, category_id: '' }).success).toBe(false);
  });

  it('requires a Vietnamese name', () => {
    expect(menuItemSchema.safeParse({ ...validInput, name_vi: '' }).success).toBe(false);
  });

  it('requires an English name', () => {
    expect(menuItemSchema.safeParse({ ...validInput, name_en: '' }).success).toBe(false);
  });

  it('rejects a zero or negative price', () => {
    expect(menuItemSchema.safeParse({ ...validInput, price: 0 }).success).toBe(false);
    expect(menuItemSchema.safeParse({ ...validInput, price: -10 }).success).toBe(false);
  });

  it('coerces a numeric string price', () => {
    const result = menuItemSchema.safeParse({ ...validInput, price: '285000' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe(285000);
    }
  });

  it('defaults is_available to true and is_featured to false when omitted', () => {
    const { is_available, is_featured, ...rest } = validInput;
    const result = menuItemSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.is_available).toBe(true);
      expect(result.data.is_featured).toBe(false);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/validation/menu-item.test.ts`
Expected: FAIL — `Cannot find module './menu-item'`

- [ ] **Step 3: Create `lib/validation/menu-item.ts`**

```ts
import { z } from 'zod';

export const menuItemSchema = z.object({
  category_id: z.string().min(1, 'Danh mục là bắt buộc'),
  name_vi: z.string().min(1, 'Tên tiếng Việt là bắt buộc'),
  name_en: z.string().min(1, 'Tên tiếng Anh là bắt buộc'),
  description_vi: z.string().default(''),
  description_en: z.string().default(''),
  price: z.coerce.number().positive('Giá phải lớn hơn 0'),
  image_url: z.string().default(''),
  is_available: z.boolean().default(true),
  is_featured: z.boolean().default(false),
});

export type MenuItemFormValues = z.infer<typeof menuItemSchema>;
```

(`price` uses `z.coerce.number()` — that coercion is safe, unlike boolean: `Number("285000")` and `Number("")` both behave exactly as expected, with no equivalent footgun.)

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/validation/menu-item.test.ts`
Expected: PASS (7 tests)

- [ ] **Step 5: Create `app/actions/menu-items.ts`**

```ts
'use server';

import { revalidatePath } from 'next/cache';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { menuItemSchema } from '@/lib/validation/menu-item';
import type { ActionResult } from '@/lib/actions/types';

function parseFormData(formData: FormData) {
  return menuItemSchema.safeParse({
    category_id: formData.get('category_id'),
    name_vi: formData.get('name_vi'),
    name_en: formData.get('name_en'),
    description_vi: formData.get('description_vi') ?? '',
    description_en: formData.get('description_en') ?? '',
    price: formData.get('price'),
    image_url: formData.get('image_url') ?? '',
    is_available: formData.get('is_available') === 'true',
    is_featured: formData.get('is_featured') === 'true',
  });
}

export async function createMenuItem(formData: FormData): Promise<ActionResult> {
  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createServerSupabaseClient();
  const { count } = await supabase
    .from('menu_items')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', parsed.data.category_id);

  const { error } = await supabase.from('menu_items').insert({
    ...parsed.data,
    display_order: (count ?? 0) + 1,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/menu');
  revalidatePath('/');
  return { success: true };
}

export async function updateMenuItem(id: string, formData: FormData): Promise<ActionResult> {
  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from('menu_items').update(parsed.data).eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/menu');
  revalidatePath('/');
  return { success: true };
}

export async function deleteMenuItem(id: string): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from('menu_items').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/menu');
  revalidatePath('/');
  return { success: true };
}

export async function reorderMenuItems(orderedIds: string[]): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();

  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('menu_items').update({ display_order: index + 1 }).eq('id', id)
    )
  );

  const failed = results.find((result) => result.error);
  if (failed?.error) {
    return { success: false, error: failed.error.message };
  }

  revalidatePath('/menu');
  revalidatePath('/');
  return { success: true };
}
```

Same per-row-`.update()` reordering pattern as `reorderCategories` (Task 13), for the same reason: `menu_items` has several `NOT NULL` columns an `.upsert()` given only `{id, display_order}` would risk violating.

- [ ] **Step 6: Run the full test suite**

Run: `npm test`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add lib/validation/menu-item.ts lib/validation/menu-item.test.ts app/actions/menu-items.ts
git commit -m "feat: add menu item validation schema and Server Actions"
```

---

### Task 17: `MenuItemForm` and its new/edit pages

**Files:**
- Create: `components/admin/MenuItemForm.tsx`
- Create: `components/admin/MenuItemForm.test.tsx`
- Create: `app/admin/(dashboard)/menu-items/new/page.tsx`
- Create: `app/admin/(dashboard)/menu-items/[id]/edit/page.tsx`

**Interfaces:**
- Consumes: `menuItemSchema`/`MenuItemFormValues` (Task 16), `createMenuItem`/`updateMenuItem` (Task 16), `ImageUploader` (Task 12), `Switch` (Task 3), `Select`/`SelectTrigger`/`SelectValue`/`SelectContent`/`SelectItem` (Task 3), `Category`/`MenuItem` types (`lib/types.ts`), `getCategories` (already exists).
- Produces: `MenuItemForm` (props: `item?: MenuItem`, `categories: Category[]`).

- [ ] **Step 1: Write the failing test for `MenuItemForm`**

Create `components/admin/MenuItemForm.test.tsx`. `ImageUploader` is mocked to a trivial stub — its own upload logic is already covered by Task 12's tests, so re-testing it here would only duplicate that coverage while adding noise to what this test is actually checking (form wiring):

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MenuItemForm } from './MenuItemForm';

const pushMock = vi.fn();
const refreshMock = vi.fn();
const createMenuItemMock = vi.fn();
const updateMenuItemMock = vi.fn();
const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}));

vi.mock('@/app/actions/menu-items', () => ({
  createMenuItem: (...args: unknown[]) => createMenuItemMock(...args),
  updateMenuItem: (...args: unknown[]) => updateMenuItemMock(...args),
}));

vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

vi.mock('@/components/admin/ImageUploader', () => ({
  ImageUploader: ({ label }: { label: string }) => <div>{label}</div>,
}));

const categories = [
  {
    id: 'cat-1',
    name_vi: 'Khai vị',
    name_en: 'Appetizers',
    slug: 'khai-vi',
    description_vi: '',
    description_en: '',
    display_order: 1,
  },
];

describe('MenuItemForm', () => {
  beforeEach(() => {
    pushMock.mockClear();
    refreshMock.mockClear();
    createMenuItemMock.mockReset();
    updateMenuItemMock.mockReset();
    toastSuccessMock.mockClear();
    toastErrorMock.mockClear();
  });

  it('shows a validation error when the price is not positive', async () => {
    render(<MenuItemForm categories={categories} />);
    fireEvent.change(screen.getByLabelText('Tên (Tiếng Việt)'), { target: { value: 'Phở bò' } });
    fireEvent.change(screen.getByLabelText('Tên (Tiếng Anh)'), { target: { value: 'Beef Pho' } });
    fireEvent.change(screen.getByLabelText('Giá (VNĐ)'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
    await waitFor(() => {
      expect(screen.getByText('Giá phải lớn hơn 0')).toBeInTheDocument();
    });
    expect(createMenuItemMock).not.toHaveBeenCalled();
  });

  it('calls updateMenuItem when an item is passed in', async () => {
    updateMenuItemMock.mockResolvedValue({ success: true });
    render(
      <MenuItemForm
        categories={categories}
        item={{
          id: 'item-1',
          category_id: 'cat-1',
          name_vi: 'Phở bò',
          name_en: 'Beef Pho',
          description_vi: '',
          description_en: '',
          price: 100000,
          image_url: '',
          is_available: true,
          is_featured: false,
          display_order: 1,
        }}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
    await waitFor(() => {
      expect(updateMenuItemMock).toHaveBeenCalledWith('item-1', expect.any(FormData));
    });
  });

  it('shows a toast error and does not redirect when the action fails', async () => {
    createMenuItemMock.mockResolvedValue({ success: false, error: 'Lỗi lưu dữ liệu.' });
    render(<MenuItemForm categories={categories} />);
    fireEvent.change(screen.getByLabelText('Tên (Tiếng Việt)'), { target: { value: 'Phở bò' } });
    fireEvent.change(screen.getByLabelText('Tên (Tiếng Anh)'), { target: { value: 'Beef Pho' } });
    fireEvent.change(screen.getByLabelText('Giá (VNĐ)'), { target: { value: '100000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('Lỗi lưu dữ liệu.');
    });
    expect(pushMock).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/admin/MenuItemForm.test.tsx`
Expected: FAIL — `Cannot find module './MenuItemForm'`

- [ ] **Step 3: Create `components/admin/MenuItemForm.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { menuItemSchema, type MenuItemFormValues } from '@/lib/validation/menu-item';
import { createMenuItem, updateMenuItem } from '@/app/actions/menu-items';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { ImageUploader } from '@/components/admin/ImageUploader';
import type { Category, MenuItem } from '@/lib/types';

export function MenuItemForm({ item, categories }: { item?: MenuItem; categories: Category[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      category_id: item?.category_id ?? '',
      name_vi: item?.name_vi ?? '',
      name_en: item?.name_en ?? '',
      description_vi: item?.description_vi ?? '',
      description_en: item?.description_en ?? '',
      price: item?.price ?? 0,
      image_url: item?.image_url ?? '',
      is_available: item?.is_available ?? true,
      is_featured: item?.is_featured ?? false,
    },
  });

  async function onSubmit(values: MenuItemFormValues) {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.set('category_id', values.category_id);
    formData.set('name_vi', values.name_vi);
    formData.set('name_en', values.name_en);
    formData.set('description_vi', values.description_vi);
    formData.set('description_en', values.description_en);
    formData.set('price', String(values.price));
    formData.set('image_url', values.image_url);
    formData.set('is_available', String(values.is_available));
    formData.set('is_featured', String(values.is_featured));

    const result = item ? await updateMenuItem(item.id, formData) : await createMenuItem(formData);

    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(item ? 'Đã cập nhật món ăn.' : 'Đã thêm món ăn.');
    router.push('/admin/menu-items');
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-lg space-y-4">
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Danh mục</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name_vi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name_vi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên (Tiếng Việt)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name_en"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên (Tiếng Anh)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description_vi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả (Tiếng Việt)</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description_en"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả (Tiếng Anh)</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Giá (VNĐ)</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <ImageUploader
                  bucket="dish-images"
                  label="Ảnh món ăn"
                  existingUrl={field.value || undefined}
                  onUploaded={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_available"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-md border p-3">
              <FormLabel>Còn hàng</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_featured"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-md border p-3">
              <FormLabel>Món nổi bật</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Đang lưu…' : 'Lưu'}
        </Button>
      </form>
    </Form>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/admin/MenuItemForm.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Create `app/admin/(dashboard)/menu-items/new/page.tsx`**

```tsx
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getCategories } from '@/lib/supabase/queries';
import { MenuItemForm } from '@/components/admin/MenuItemForm';

export default async function NewMenuItemPage() {
  const supabase = await createServerSupabaseClient();
  const categories = await getCategories(supabase);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Thêm món ăn</h1>
      <MenuItemForm categories={categories} />
    </div>
  );
}
```

- [ ] **Step 6: Create `app/admin/(dashboard)/menu-items/[id]/edit/page.tsx`**

```tsx
import { notFound } from 'next/navigation';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getCategories } from '@/lib/supabase/queries';
import { MenuItemForm } from '@/components/admin/MenuItemForm';

export default async function EditMenuItemPage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabaseClient();
  const [categories, { data: item }] = await Promise.all([
    getCategories(supabase),
    supabase.from('menu_items').select('*').eq('id', params.id).single(),
  ]);

  if (!item) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Sửa món ăn</h1>
      <MenuItemForm categories={categories} item={item} />
    </div>
  );
}
```

- [ ] **Step 7: Verify the full site builds**

Run: `npm run build`
Expected: succeeds; `/admin/menu-items/new` and `/admin/menu-items/[id]/edit` appear as routes.

- [ ] **Step 8: Run the full test suite**

Run: `npm test`
Expected: all pass.

- [ ] **Step 9: Commit**

```bash
git add components/admin/MenuItemForm.tsx components/admin/MenuItemForm.test.tsx "app/admin/(dashboard)/menu-items/new/page.tsx" "app/admin/(dashboard)/menu-items/[id]/edit/page.tsx"
git commit -m "feat: add menu item create/edit form and pages"
```

---

### Task 18: Menu items list page (search, filter, scoped reorder, delete)

**Files:**
- Create: `components/admin/MenuItemsTable.tsx`
- Create: `components/admin/MenuItemsTable.test.tsx`
- Create: `app/admin/(dashboard)/menu-items/page.tsx`

**Interfaces:**
- Consumes: `deleteMenuItem`/`reorderMenuItems` (Task 16), `SortableList` (Task 12), `ConfirmDeleteDialog` (Task 11), `formatPrice` (already exists), `getCategories`/`getMenuItems` (already exist).
- Produces: `MenuItemsTable` (props: `items: MenuItem[]`, `categories: Category[]`).

**A UX decision worth stating explicitly:** `menu_items.display_order` is a single flat column (per `0001_init.sql`) ordered globally, not scoped per category at the database level — the public site's `CategoryTabs` only ever compares `display_order` *after* filtering to one category, so items in different categories sharing the same `display_order` value never actually collide in the UI. This plan's admin list leans into that: drag-and-drop reordering is only enabled once a **specific** category is selected in the filter (reordering then only ever touches that category's own rows); the "all categories" view is read-only and grouped implicitly by relying on the existing per-category filter, with a one-line hint telling the admin to pick a category to reorder. This avoids inventing an ambiguous cross-category drag interaction the spec never asked for.

- [ ] **Step 1: Write the failing test for `MenuItemsTable`**

Create `components/admin/MenuItemsTable.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MenuItemsTable } from './MenuItemsTable';

const refreshMock = vi.fn();
const deleteMenuItemMock = vi.fn();
const reorderMenuItemsMock = vi.fn();
const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

vi.mock('@/app/actions/menu-items', () => ({
  deleteMenuItem: (...args: unknown[]) => deleteMenuItemMock(...args),
  reorderMenuItems: (...args: unknown[]) => reorderMenuItemsMock(...args),
}));

vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

const categories = [
  {
    id: 'cat-1',
    name_vi: 'Khai vị',
    name_en: 'Appetizers',
    slug: 'khai-vi',
    description_vi: '',
    description_en: '',
    display_order: 1,
  },
  {
    id: 'cat-2',
    name_vi: 'Súp',
    name_en: 'Soups',
    slug: 'sup',
    description_vi: '',
    description_en: '',
    display_order: 2,
  },
];

const items = [
  {
    id: 'item-1',
    category_id: 'cat-1',
    name_vi: 'Gỏi cuốn',
    name_en: 'Spring Rolls',
    description_vi: '',
    description_en: '',
    price: 165000,
    image_url: '',
    is_available: true,
    is_featured: false,
    display_order: 1,
  },
  {
    id: 'item-2',
    category_id: 'cat-2',
    name_vi: 'Súp măng cua',
    name_en: 'Crab Soup',
    description_vi: '',
    description_en: '',
    price: 165000,
    image_url: '',
    is_available: false,
    is_featured: true,
    display_order: 2,
  },
];

describe('MenuItemsTable', () => {
  beforeEach(() => {
    refreshMock.mockClear();
    deleteMenuItemMock.mockReset();
    reorderMenuItemsMock.mockReset();
    toastSuccessMock.mockClear();
    toastErrorMock.mockClear();
  });

  it('renders every item by default', () => {
    render(<MenuItemsTable items={items} categories={categories} />);
    expect(screen.getByText('Gỏi cuốn')).toBeInTheDocument();
    expect(screen.getByText('Súp măng cua')).toBeInTheDocument();
  });

  it('filters by search term', () => {
    render(<MenuItemsTable items={items} categories={categories} />);
    fireEvent.change(screen.getByPlaceholderText('Tìm theo tên…'), { target: { value: 'Gỏi' } });
    expect(screen.getByText('Gỏi cuốn')).toBeInTheDocument();
    expect(screen.queryByText('Súp măng cua')).not.toBeInTheDocument();
  });

  it('shows the "Hết hàng" and "Nổi bật" badges correctly', () => {
    render(<MenuItemsTable items={items} categories={categories} />);
    expect(screen.getByText('Hết hàng')).toBeInTheDocument();
    expect(screen.getByText('Nổi bật')).toBeInTheDocument();
  });

  it('opens the confirm dialog and calls deleteMenuItem on confirm', async () => {
    deleteMenuItemMock.mockResolvedValue({ success: true });
    render(<MenuItemsTable items={items} categories={categories} />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Xoá' })[0]);
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xoá' }));
    await waitFor(() => {
      expect(deleteMenuItemMock).toHaveBeenCalledWith('item-1');
    });
    expect(refreshMock).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/admin/MenuItemsTable.test.tsx`
Expected: FAIL — `Cannot find module './MenuItemsTable'`

- [ ] **Step 3: Create `components/admin/MenuItemsTable.tsx`**

```tsx
'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { deleteMenuItem, reorderMenuItems } from '@/app/actions/menu-items';
import { SortableList } from '@/components/admin/SortableList';
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { formatPrice } from '@/lib/format';
import type { Category, MenuItem } from '@/lib/types';

export function MenuItemsTable({ items, categories }: { items: MenuItem[]; categories: Category[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [pendingDelete, setPendingDelete] = useState<MenuItem | null>(null);
  const [, startTransition] = useTransition();

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch =
        term === '' || item.name_vi.toLowerCase().includes(term) || item.name_en.toLowerCase().includes(term);
      const matchesCategory = categoryFilter === 'all' || item.category_id === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, categoryFilter]);

  function handleReorder(orderedIds: string[]) {
    startTransition(async () => {
      const result = await reorderMenuItems(orderedIds);
      if (!result.success) {
        toast.error(result.error);
      }
    });
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    const result = await deleteMenuItem(pendingDelete.id);
    setPendingDelete(null);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success('Đã xoá món ăn.');
    router.refresh();
  }

  function renderRow(item: MenuItem) {
    return (
      <div className="flex items-center justify-between rounded-md border bg-card p-4">
        <div>
          <p className="font-medium">
            {item.name_vi}
            {!item.is_available && (
              <span className="ml-2 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">Hết hàng</span>
            )}
            {item.is_featured && (
              <span className="ml-2 rounded bg-accent px-2 py-0.5 text-xs text-accent-foreground">Nổi bật</span>
            )}
          </p>
          <p className="text-sm text-muted-foreground">
            {item.name_en} · {formatPrice(item.price)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/menu-items/${item.id}/edit`}>Sửa</Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setPendingDelete(item)}>
            Xoá
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Tìm theo tên…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="sm:max-w-xs">
            <SelectValue placeholder="Tất cả danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name_vi}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {categoryFilter === 'all' && (
        <p className="text-sm text-muted-foreground">
          Chọn một danh mục cụ thể để sắp xếp thứ tự bằng kéo-thả.
        </p>
      )}

      {categoryFilter === 'all' ? (
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <div key={item.id}>{renderRow(item)}</div>
          ))}
        </div>
      ) : (
        <SortableList items={filteredItems} onReorder={handleReorder} renderItem={renderRow} />
      )}

      <ConfirmDeleteDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
        itemName={pendingDelete?.name_vi ?? ''}
      />
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/admin/MenuItemsTable.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 5: Create `app/admin/(dashboard)/menu-items/page.tsx`**

```tsx
import Link from 'next/link';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getCategories, getMenuItems } from '@/lib/supabase/queries';
import { Button } from '@/components/ui/button';
import { MenuItemsTable } from '@/components/admin/MenuItemsTable';

export default async function MenuItemsPage() {
  const supabase = await createServerSupabaseClient();
  const [categories, items] = await Promise.all([getCategories(supabase), getMenuItems(supabase)]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Món ăn</h1>
        <Button asChild>
          <Link href="/admin/menu-items/new">Thêm món ăn</Link>
        </Button>
      </div>
      <MenuItemsTable items={items} categories={categories} />
    </div>
  );
}
```

(Reuses the existing `getMenuItems` from the public-site plan as-is — it already returns every item including unavailable ones, which is exactly what the admin list needs too.)

- [ ] **Step 6: Verify the full site builds**

Run: `npm run build`
Expected: succeeds; `/admin/menu-items` appears as a route.

- [ ] **Step 7: Run the full test suite**

Run: `npm test`
Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add components/admin/MenuItemsTable.tsx components/admin/MenuItemsTable.test.tsx "app/admin/(dashboard)/menu-items/page.tsx"
git commit -m "feat: add menu items list page with search, filter, and scoped reorder"
```

---

### Task 19: Restaurant info validation schema + Server Action

**Files:**
- Create: `lib/validation/restaurant-info.ts`
- Create: `lib/validation/restaurant-info.test.ts`
- Create: `app/actions/restaurant-info.ts`

**Interfaces:**
- Produces: `restaurantInfoSchema`, `type RestaurantInfoFormValues` — Task 20's `RestaurantInfoForm` uses both.
- Produces: `updateRestaurantInfo(formData: FormData): Promise<ActionResult>` — the row is a fixed singleton (`id = 1`, per `0001_init.sql`'s `single_row` check constraint), so there's no create/delete action, only update.

- [ ] **Step 1: Write the failing test for `restaurantInfoSchema`**

This schema adds real URL/email format validation — the previous branch's known issue was a fabricated, invalid `map_embed_url` sitting in the seed data with nothing to catch it; this is the form where an admin would fix that, so it should refuse another malformed URL going back in.

Create `lib/validation/restaurant-info.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { restaurantInfoSchema } from './restaurant-info';

const validInput = {
  name_vi: 'Hương Việt',
  name_en: 'Huong Viet Fine Dining',
  tagline_vi: '',
  tagline_en: '',
  description_vi: '',
  description_en: '',
  address: '',
  phone: '',
  email: '',
  opening_hours: '',
  map_embed_url: '',
  facebook_url: '',
  instagram_url: '',
  logo_url: '',
  hero_image_url: '',
};

describe('restaurantInfoSchema', () => {
  it('accepts a valid restaurant info with every optional field blank', () => {
    expect(restaurantInfoSchema.safeParse(validInput).success).toBe(true);
  });

  it('requires a Vietnamese name', () => {
    expect(restaurantInfoSchema.safeParse({ ...validInput, name_vi: '' }).success).toBe(false);
  });

  it('requires an English name', () => {
    expect(restaurantInfoSchema.safeParse({ ...validInput, name_en: '' }).success).toBe(false);
  });

  it('rejects a map_embed_url that is not a real URL', () => {
    expect(restaurantInfoSchema.safeParse({ ...validInput, map_embed_url: 'not-a-url' }).success).toBe(false);
  });

  it('accepts a valid https map_embed_url', () => {
    const result = restaurantInfoSchema.safeParse({
      ...validInput,
      map_embed_url: 'https://www.google.com/maps/embed?pb=123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email but accepts a blank one', () => {
    expect(restaurantInfoSchema.safeParse({ ...validInput, email: 'not-an-email' }).success).toBe(false);
    expect(restaurantInfoSchema.safeParse({ ...validInput, email: '' }).success).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/validation/restaurant-info.test.ts`
Expected: FAIL — `Cannot find module './restaurant-info'`

- [ ] **Step 3: Create `lib/validation/restaurant-info.ts`**

```ts
import { z } from 'zod';

const urlOrEmpty = z.union([z.literal(''), z.string().url('URL không hợp lệ')]);
const emailOrEmpty = z.union([z.literal(''), z.string().email('Email không hợp lệ')]);

export const restaurantInfoSchema = z.object({
  name_vi: z.string().min(1, 'Tên tiếng Việt là bắt buộc'),
  name_en: z.string().min(1, 'Tên tiếng Anh là bắt buộc'),
  tagline_vi: z.string().default(''),
  tagline_en: z.string().default(''),
  description_vi: z.string().default(''),
  description_en: z.string().default(''),
  address: z.string().default(''),
  phone: z.string().default(''),
  email: emailOrEmpty.default(''),
  opening_hours: z.string().default(''),
  map_embed_url: urlOrEmpty.default(''),
  facebook_url: urlOrEmpty.default(''),
  instagram_url: urlOrEmpty.default(''),
  logo_url: urlOrEmpty.default(''),
  hero_image_url: urlOrEmpty.default(''),
});

export type RestaurantInfoFormValues = z.infer<typeof restaurantInfoSchema>;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/validation/restaurant-info.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 5: Create `app/actions/restaurant-info.ts`**

```ts
'use server';

import { revalidatePath } from 'next/cache';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { restaurantInfoSchema } from '@/lib/validation/restaurant-info';
import type { ActionResult } from '@/lib/actions/types';

export async function updateRestaurantInfo(formData: FormData): Promise<ActionResult> {
  const parsed = restaurantInfoSchema.safeParse({
    name_vi: formData.get('name_vi'),
    name_en: formData.get('name_en'),
    tagline_vi: formData.get('tagline_vi') ?? '',
    tagline_en: formData.get('tagline_en') ?? '',
    description_vi: formData.get('description_vi') ?? '',
    description_en: formData.get('description_en') ?? '',
    address: formData.get('address') ?? '',
    phone: formData.get('phone') ?? '',
    email: formData.get('email') ?? '',
    opening_hours: formData.get('opening_hours') ?? '',
    map_embed_url: formData.get('map_embed_url') ?? '',
    facebook_url: formData.get('facebook_url') ?? '',
    instagram_url: formData.get('instagram_url') ?? '',
    logo_url: formData.get('logo_url') ?? '',
    hero_image_url: formData.get('hero_image_url') ?? '',
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from('restaurant_info').update(parsed.data).eq('id', 1);

  if (error) {
    return { success: false, error: error.message };
  }

  // restaurant_info is read by app/(site)/layout.tsx, which wraps every public
  // page, so 'layout' here revalidates it everywhere at once rather than just
  // at '/'. In today's build this call is actually a no-op in practice: every
  // public route already calls cookies() (via getServerLocale() and
  // createServerSupabaseClient()), which forces fully dynamic rendering with
  // no cache to invalidate — confirmed during the public-site branch's final
  // review. It's kept here anyway because that's an implementation detail of
  // the current routes, not a guarantee; the moment any public route adopts
  // static/ISR caching, this call becomes load-bearing, and it costs nothing
  // to have it already correct.
  revalidatePath('/', 'layout');
  return { success: true };
}
```

- [ ] **Step 6: Run the full test suite**

Run: `npm test`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add lib/validation/restaurant-info.ts lib/validation/restaurant-info.test.ts app/actions/restaurant-info.ts
git commit -m "feat: add restaurant info validation schema and Server Action"
```

---

### Task 20: `RestaurantInfoForm` and its page

**Files:**
- Create: `components/admin/RestaurantInfoForm.tsx`
- Create: `components/admin/RestaurantInfoForm.test.tsx`
- Create: `app/admin/(dashboard)/restaurant-info/page.tsx`

**Interfaces:**
- Consumes: `restaurantInfoSchema`/`RestaurantInfoFormValues` (Task 19), `updateRestaurantInfo` (Task 19), `ImageUploader` (Task 12, used twice — `bucket="site-media"` for both logo and hero image), `RestaurantInfo` type (already exists), `getRestaurantInfo` (already exists).
- Produces: `RestaurantInfoForm` (props: `info: RestaurantInfo` — always in "edit" mode, there is no "create" for a singleton row).

- [ ] **Step 1: Write the failing test for `RestaurantInfoForm`**

Create `components/admin/RestaurantInfoForm.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RestaurantInfoForm } from './RestaurantInfoForm';

const refreshMock = vi.fn();
const updateRestaurantInfoMock = vi.fn();
const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

vi.mock('@/app/actions/restaurant-info', () => ({
  updateRestaurantInfo: (...args: unknown[]) => updateRestaurantInfoMock(...args),
}));

vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

vi.mock('@/components/admin/ImageUploader', () => ({
  ImageUploader: ({ label }: { label: string }) => <div>{label}</div>,
}));

const info = {
  id: 1,
  name_vi: 'Hương Việt',
  name_en: 'Huong Viet Fine Dining',
  tagline_vi: '',
  tagline_en: '',
  description_vi: '',
  description_en: '',
  address: '',
  phone: '',
  email: '',
  opening_hours: '',
  map_embed_url: '',
  facebook_url: '',
  instagram_url: '',
  logo_url: '',
  hero_image_url: '',
};

describe('RestaurantInfoForm', () => {
  beforeEach(() => {
    refreshMock.mockClear();
    updateRestaurantInfoMock.mockReset();
    toastSuccessMock.mockClear();
    toastErrorMock.mockClear();
  });

  it('pre-fills the form with the existing restaurant info', () => {
    render(<RestaurantInfoForm info={info} />);
    expect(screen.getByLabelText('Tên (Tiếng Việt)')).toHaveValue('Hương Việt');
  });

  it('shows a validation error for an invalid map embed URL', async () => {
    render(<RestaurantInfoForm info={info} />);
    fireEvent.change(screen.getByLabelText('URL nhúng Google Maps'), { target: { value: 'not-a-url' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
    await waitFor(() => {
      expect(screen.getByText('URL không hợp lệ')).toBeInTheDocument();
    });
    expect(updateRestaurantInfoMock).not.toHaveBeenCalled();
  });

  it('calls updateRestaurantInfo and shows a success toast', async () => {
    updateRestaurantInfoMock.mockResolvedValue({ success: true });
    render(<RestaurantInfoForm info={info} />);
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
    await waitFor(() => {
      expect(updateRestaurantInfoMock).toHaveBeenCalledWith(expect.any(FormData));
    });
    expect(toastSuccessMock).toHaveBeenCalled();
    expect(refreshMock).toHaveBeenCalled();
  });

  it('shows a toast error when the action fails', async () => {
    updateRestaurantInfoMock.mockResolvedValue({ success: false, error: 'Lỗi lưu dữ liệu.' });
    render(<RestaurantInfoForm info={info} />);
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('Lỗi lưu dữ liệu.');
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/admin/RestaurantInfoForm.test.tsx`
Expected: FAIL — `Cannot find module './RestaurantInfoForm'`

- [ ] **Step 3: Create `components/admin/RestaurantInfoForm.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { restaurantInfoSchema, type RestaurantInfoFormValues } from '@/lib/validation/restaurant-info';
import { updateRestaurantInfo } from '@/app/actions/restaurant-info';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { ImageUploader } from '@/components/admin/ImageUploader';
import type { RestaurantInfo } from '@/lib/types';

const TEXT_FIELDS: Array<{ name: keyof RestaurantInfoFormValues; label: string; multiline?: boolean }> = [
  { name: 'name_vi', label: 'Tên (Tiếng Việt)' },
  { name: 'name_en', label: 'Tên (Tiếng Anh)' },
  { name: 'tagline_vi', label: 'Khẩu hiệu (Tiếng Việt)' },
  { name: 'tagline_en', label: 'Khẩu hiệu (Tiếng Anh)' },
  { name: 'description_vi', label: 'Mô tả (Tiếng Việt)', multiline: true },
  { name: 'description_en', label: 'Mô tả (Tiếng Anh)', multiline: true },
  { name: 'address', label: 'Địa chỉ' },
  { name: 'phone', label: 'Điện thoại' },
  { name: 'email', label: 'Email' },
  { name: 'opening_hours', label: 'Giờ mở cửa' },
  { name: 'map_embed_url', label: 'URL nhúng Google Maps' },
  { name: 'facebook_url', label: 'Facebook' },
  { name: 'instagram_url', label: 'Instagram' },
];

export function RestaurantInfoForm({ info }: { info: RestaurantInfo }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RestaurantInfoFormValues>({
    resolver: zodResolver(restaurantInfoSchema),
    defaultValues: {
      name_vi: info.name_vi,
      name_en: info.name_en,
      tagline_vi: info.tagline_vi,
      tagline_en: info.tagline_en,
      description_vi: info.description_vi,
      description_en: info.description_en,
      address: info.address,
      phone: info.phone,
      email: info.email,
      opening_hours: info.opening_hours,
      map_embed_url: info.map_embed_url,
      facebook_url: info.facebook_url,
      instagram_url: info.instagram_url,
      logo_url: info.logo_url,
      hero_image_url: info.hero_image_url,
    },
  });

  async function onSubmit(values: RestaurantInfoFormValues) {
    setIsSubmitting(true);
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => formData.set(key, value));

    const result = await updateRestaurantInfo(formData);
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success('Đã cập nhật thông tin nhà hàng.');
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-lg space-y-4">
        {TEXT_FIELDS.map(({ name, label, multiline }) => (
          <FormField
            key={name}
            control={form.control}
            name={name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>{multiline ? <Textarea {...field} /> : <Input {...field} />}</FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <FormField
          control={form.control}
          name="logo_url"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <ImageUploader
                  bucket="site-media"
                  label="Logo"
                  existingUrl={field.value || undefined}
                  onUploaded={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="hero_image_url"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <ImageUploader
                  bucket="site-media"
                  label="Ảnh hero trang chủ"
                  existingUrl={field.value || undefined}
                  onUploaded={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Đang lưu…' : 'Lưu'}
        </Button>
      </form>
    </Form>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/admin/RestaurantInfoForm.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 5: Create `app/admin/(dashboard)/restaurant-info/page.tsx`**

```tsx
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getRestaurantInfo } from '@/lib/supabase/queries';
import { RestaurantInfoForm } from '@/components/admin/RestaurantInfoForm';

export default async function RestaurantInfoPage() {
  const supabase = await createServerSupabaseClient();
  const info = await getRestaurantInfo(supabase);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Thông tin nhà hàng</h1>
      <RestaurantInfoForm info={info} />
    </div>
  );
}
```

- [ ] **Step 6: Verify the full site builds**

Run: `npm run build`
Expected: succeeds; `/admin/restaurant-info` appears as a route.

- [ ] **Step 7: Run the full test suite**

Run: `npm test`
Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add components/admin/RestaurantInfoForm.tsx components/admin/RestaurantInfoForm.test.tsx "app/admin/(dashboard)/restaurant-info/page.tsx"
git commit -m "feat: add restaurant info edit form and page"
```

---

### Task 21: Gallery image validation schema + Server Actions

**Files:**
- Create: `lib/validation/gallery-image.ts`
- Create: `lib/validation/gallery-image.test.ts`
- Create: `app/actions/gallery.ts`

**Interfaces:**
- Produces: `galleryImageSchema`, `type GalleryImageFormValues`.
- Produces: `createGalleryImage(formData: FormData): Promise<ActionResult>`, `updateGalleryImageCaption(id: string, captionVi: string, captionEn: string): Promise<ActionResult>`, `deleteGalleryImage(id: string): Promise<ActionResult>`, `reorderGalleryImages(orderedIds: string[]): Promise<ActionResult>` — Task 22's `GalleryManager` calls all four by these exact names.

- [ ] **Step 1: Write the failing test for `galleryImageSchema`**

Create `lib/validation/gallery-image.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { galleryImageSchema } from './gallery-image';

describe('galleryImageSchema', () => {
  it('accepts a valid gallery image', () => {
    const result = galleryImageSchema.safeParse({
      image_url: 'https://x.supabase.co/storage/v1/object/public/site-media/a.jpg',
      caption_vi: 'Không gian chính',
      caption_en: 'Main space',
    });
    expect(result.success).toBe(true);
  });

  it('requires an image_url', () => {
    expect(galleryImageSchema.safeParse({ image_url: '', caption_vi: '', caption_en: '' }).success).toBe(
      false
    );
  });

  it('rejects an image_url that is not a real URL', () => {
    expect(
      galleryImageSchema.safeParse({ image_url: 'not-a-url', caption_vi: '', caption_en: '' }).success
    ).toBe(false);
  });

  it('defaults captions to empty strings when omitted', () => {
    const result = galleryImageSchema.safeParse({ image_url: 'https://x.supabase.co/a.jpg' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.caption_vi).toBe('');
      expect(result.data.caption_en).toBe('');
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/validation/gallery-image.test.ts`
Expected: FAIL — `Cannot find module './gallery-image'`

- [ ] **Step 3: Create `lib/validation/gallery-image.ts`**

```ts
import { z } from 'zod';

export const galleryImageSchema = z.object({
  image_url: z.string().min(1, 'Ảnh là bắt buộc').url('URL ảnh không hợp lệ'),
  caption_vi: z.string().default(''),
  caption_en: z.string().default(''),
});

export type GalleryImageFormValues = z.infer<typeof galleryImageSchema>;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/validation/gallery-image.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Create `app/actions/gallery.ts`**

```ts
'use server';

import { revalidatePath } from 'next/cache';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { galleryImageSchema } from '@/lib/validation/gallery-image';
import type { ActionResult } from '@/lib/actions/types';

export async function createGalleryImage(formData: FormData): Promise<ActionResult> {
  const parsed = galleryImageSchema.safeParse({
    image_url: formData.get('image_url'),
    caption_vi: formData.get('caption_vi') ?? '',
    caption_en: formData.get('caption_en') ?? '',
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createServerSupabaseClient();
  const { count } = await supabase.from('gallery_images').select('*', { count: 'exact', head: true });

  const { error } = await supabase.from('gallery_images').insert({
    ...parsed.data,
    display_order: (count ?? 0) + 1,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/gallery');
  revalidatePath('/');
  return { success: true };
}

export async function updateGalleryImageCaption(
  id: string,
  captionVi: string,
  captionEn: string
): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from('gallery_images')
    .update({ caption_vi: captionVi, caption_en: captionEn })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/gallery');
  return { success: true };
}

export async function deleteGalleryImage(id: string): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from('gallery_images').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/gallery');
  revalidatePath('/');
  return { success: true };
}

export async function reorderGalleryImages(orderedIds: string[]): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();

  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('gallery_images').update({ display_order: index + 1 }).eq('id', id)
    )
  );

  const failed = results.find((result) => result.error);
  if (failed?.error) {
    return { success: false, error: failed.error.message };
  }

  revalidatePath('/gallery');
  return { success: true };
}
```

`updateGalleryImageCaption` takes both caption fields on every call (not a single-field patch) — the caller (Task 22) always has both current values in hand and sends them both back, which keeps this action's shape identical to the others (one full logical write per call) rather than introducing a partial-update variant used nowhere else in this codebase.

- [ ] **Step 6: Run the full test suite**

Run: `npm test`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add lib/validation/gallery-image.ts lib/validation/gallery-image.test.ts app/actions/gallery.ts
git commit -m "feat: add gallery image validation schema and Server Actions"
```

---

### Task 22: Gallery management page (multi-upload, captions, reorder, delete)

**Files:**
- Create: `components/admin/GalleryManager.tsx`
- Create: `components/admin/GalleryManager.test.tsx`
- Create: `app/admin/(dashboard)/gallery/page.tsx`

**Interfaces:**
- Consumes: `createBrowserSupabaseClient`, `createGalleryImage`/`updateGalleryImageCaption`/`deleteGalleryImage`/`reorderGalleryImages` (Task 21), `SortableList` (Task 12), `ConfirmDeleteDialog` (Task 11), `getGalleryImages` (already exists).
- Produces: `GalleryManager` (props: `images: GalleryImage[]`).

**Why this doesn't reuse `ImageUploader` (Task 12):** the spec calls for uploading several photos at once, each immediately becoming its own gallery row with blank captions the admin fills in afterward — a different interaction shape from `ImageUploader`'s single-file, single-URL-output contract used by the menu item and restaurant info forms. Rather than bending that component's already-tested API to fit a second, incompatible use case, this task writes its own small multi-file upload handler. It duplicates `ImageUploader`'s two validation constants (`MAX_FILE_SIZE_BYTES`, `ACCEPTED_TYPES`) rather than importing them, since `ImageUploader.tsx` doesn't export them and this task shouldn't reach back into an already-completed task's file to add exports for a single two-constant reuse.

- [ ] **Step 1: Write the failing test for `GalleryManager`**

Create `components/admin/GalleryManager.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { GalleryManager } from './GalleryManager';

const refreshMock = vi.fn();
const uploadMock = vi.fn();
const getPublicUrlMock = vi.fn();
const createGalleryImageMock = vi.fn();
const updateGalleryImageCaptionMock = vi.fn();
const deleteGalleryImageMock = vi.fn();
const reorderGalleryImagesMock = vi.fn();
const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

vi.mock('@/lib/supabase/client', () => ({
  createBrowserSupabaseClient: () => ({
    storage: {
      from: () => ({ upload: uploadMock, getPublicUrl: getPublicUrlMock }),
    },
  }),
}));

vi.mock('@/app/actions/gallery', () => ({
  createGalleryImage: (...args: unknown[]) => createGalleryImageMock(...args),
  updateGalleryImageCaption: (...args: unknown[]) => updateGalleryImageCaptionMock(...args),
  deleteGalleryImage: (...args: unknown[]) => deleteGalleryImageMock(...args),
  reorderGalleryImages: (...args: unknown[]) => reorderGalleryImagesMock(...args),
}));

vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

const images = [
  {
    id: 'img-1',
    image_url: 'https://x.supabase.co/a.jpg',
    caption_vi: 'Không gian chính',
    caption_en: 'Main space',
    display_order: 1,
  },
];

function makeFile(name: string, type: string, sizeBytes: number) {
  return new File(['x'.repeat(sizeBytes)], name, { type });
}

describe('GalleryManager', () => {
  beforeEach(() => {
    refreshMock.mockClear();
    uploadMock.mockReset();
    getPublicUrlMock.mockReset();
    createGalleryImageMock.mockReset();
    updateGalleryImageCaptionMock.mockReset();
    deleteGalleryImageMock.mockReset();
    reorderGalleryImagesMock.mockReset();
    toastSuccessMock.mockClear();
    toastErrorMock.mockClear();
  });

  it('renders existing images with their captions pre-filled', () => {
    render(<GalleryManager images={images} />);
    expect(screen.getByDisplayValue('Không gian chính')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Main space')).toBeInTheDocument();
  });

  it('uploads a selected file and creates a gallery image row for it', async () => {
    uploadMock.mockResolvedValue({ error: null });
    getPublicUrlMock.mockReturnValue({ data: { publicUrl: 'https://x.supabase.co/new.jpg' } });
    createGalleryImageMock.mockResolvedValue({ success: true });
    render(<GalleryManager images={images} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile('new.jpg', 'image/jpeg', 1024)] } });
    await waitFor(() => {
      expect(createGalleryImageMock).toHaveBeenCalledWith(expect.any(FormData));
    });
    expect(refreshMock).toHaveBeenCalled();
  });

  it('saves an updated caption on blur', async () => {
    updateGalleryImageCaptionMock.mockResolvedValue({ success: true });
    render(<GalleryManager images={images} />);
    const viInput = screen.getByDisplayValue('Không gian chính');
    fireEvent.change(viInput, { target: { value: 'Không gian mới' } });
    fireEvent.blur(viInput);
    await waitFor(() => {
      expect(updateGalleryImageCaptionMock).toHaveBeenCalledWith('img-1', 'Không gian mới', 'Main space');
    });
  });

  it('opens the confirm dialog and deletes on confirm', async () => {
    deleteGalleryImageMock.mockResolvedValue({ success: true });
    render(<GalleryManager images={images} />);
    fireEvent.click(screen.getByRole('button', { name: 'Xoá' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xoá' }));
    await waitFor(() => {
      expect(deleteGalleryImageMock).toHaveBeenCalledWith('img-1');
    });
    expect(toastSuccessMock).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/admin/GalleryManager.test.tsx`
Expected: FAIL — `Cannot find module './GalleryManager'`

- [ ] **Step 3: Create `components/admin/GalleryManager.tsx`**

```tsx
'use client';

import { useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import {
  createGalleryImage,
  deleteGalleryImage,
  reorderGalleryImages,
  updateGalleryImageCaption,
} from '@/app/actions/gallery';
import { SortableList } from '@/components/admin/SortableList';
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { GalleryImage } from '@/lib/types';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function GalleryManager({ images }: { images: GalleryImage[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<GalleryImage | null>(null);
  const [, startTransition] = useTransition();

  async function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setUploadError(null);
    setIsUploading(true);
    const supabase = createBrowserSupabaseClient();

    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setUploadError(`"${file.name}": chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setUploadError(`"${file.name}": dung lượng tối đa là 5MB.`);
        continue;
      }

      const extension = file.name.split('.').pop();
      const path = `${crypto.randomUUID()}.${extension}`;
      const { error: uploadErr } = await supabase.storage.from('site-media').upload(path, file);
      if (uploadErr) {
        setUploadError(`Upload "${file.name}" thất bại.`);
        continue;
      }

      const { data } = supabase.storage.from('site-media').getPublicUrl(path);
      const formData = new FormData();
      formData.set('image_url', data.publicUrl);
      formData.set('caption_vi', '');
      formData.set('caption_en', '');
      const result = await createGalleryImage(formData);
      if (!result.success) {
        setUploadError(result.error);
      }
    }

    setIsUploading(false);
    if (inputRef.current) inputRef.current.value = '';
    router.refresh();
  }

  function handleReorder(orderedIds: string[]) {
    startTransition(async () => {
      const result = await reorderGalleryImages(orderedIds);
      if (!result.success) {
        toast.error(result.error);
      }
    });
  }

  async function handleCaptionBlur(image: GalleryImage, field: 'caption_vi' | 'caption_en', value: string) {
    const result = await updateGalleryImageCaption(
      image.id,
      field === 'caption_vi' ? value : image.caption_vi,
      field === 'caption_en' ? value : image.caption_en
    );
    if (!result.success) {
      toast.error(result.error);
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    const result = await deleteGalleryImage(pendingDelete.id);
    setPendingDelete(null);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success('Đã xoá ảnh.');
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFilesSelected}
          className="hidden"
        />
        <Button type="button" onClick={() => inputRef.current?.click()} disabled={isUploading}>
          {isUploading ? 'Đang tải lên…' : 'Tải ảnh lên'}
        </Button>
        {uploadError && (
          <p role="alert" className="mt-2 text-sm font-medium text-destructive">
            {uploadError}
          </p>
        )}
      </div>

      <SortableList
        items={images}
        onReorder={handleReorder}
        renderItem={(image) => (
          <div className="flex items-center gap-4 rounded-md border bg-card p-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md">
              <Image
                src={image.image_url}
                alt={image.caption_vi || 'Ảnh gallery'}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
            <div className="flex flex-1 flex-col gap-2 sm:flex-row">
              <Input
                placeholder="Chú thích (Tiếng Việt)"
                defaultValue={image.caption_vi}
                onBlur={(event) => handleCaptionBlur(image, 'caption_vi', event.target.value)}
              />
              <Input
                placeholder="Chú thích (Tiếng Anh)"
                defaultValue={image.caption_en}
                onBlur={(event) => handleCaptionBlur(image, 'caption_en', event.target.value)}
              />
            </div>
            <Button variant="destructive" size="sm" onClick={() => setPendingDelete(image)}>
              Xoá
            </Button>
          </div>
        )}
      />

      <ConfirmDeleteDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
        itemName={pendingDelete?.caption_vi || 'ảnh này'}
      />
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/admin/GalleryManager.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 5: Create `app/admin/(dashboard)/gallery/page.tsx`**

```tsx
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getGalleryImages } from '@/lib/supabase/queries';
import { GalleryManager } from '@/components/admin/GalleryManager';

export default async function GalleryPage() {
  const supabase = await createServerSupabaseClient();
  const images = await getGalleryImages(supabase);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Thư viện ảnh</h1>
      <GalleryManager images={images} />
    </div>
  );
}
```

(`getGalleryImages(supabase)` called with no `limit` argument returns every image, unlike the home page's `getGalleryImages(supabase, 6)` preview call — exactly what the admin management view needs.)

- [ ] **Step 6: Verify the full site builds**

Run: `npm run build`
Expected: succeeds; `/admin/gallery` appears as a route. This is also the last new route in this plan — confirm the full route list now includes: `/admin`, `/admin/login`, `/admin/menu-items`, `/admin/menu-items/new`, `/admin/menu-items/[id]/edit`, `/admin/categories`, `/admin/categories/new`, `/admin/categories/[id]/edit`, `/admin/restaurant-info`, `/admin/gallery`.

- [ ] **Step 7: Run the full test suite**

Run: `npm test`
Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add components/admin/GalleryManager.tsx components/admin/GalleryManager.test.tsx "app/admin/(dashboard)/gallery/page.tsx"
git commit -m "feat: add gallery management page with multi-upload, captions, and reorder"
```

---

### Task 23: End-to-end verification

**No new files.** This is a controller-run task, not delegated to an implementer subagent — it exercises the real Supabase project (`jtizooyjnllostamffpp`) and the real admin account (`phamtuanan3939@gmail.com`), and per this codebase's established pattern (see the public-site plan's Task 4/5/6 rationale), anything touching live external credentials is handled directly rather than dispatched.

- [ ] **Step 1: Full automated check**

Run: `npm test`
Expected: every test file passes (this plan added roughly 20 new test files on top of the public-site branch's 15 — confirm the total count grew accordingly, not shrank).

Run: `npm run build`
Expected: succeeds. Confirm the route list includes every admin route: `/admin`, `/admin/login`, `/admin/categories`, `/admin/categories/new`, `/admin/categories/[id]/edit`, `/admin/menu-items`, `/admin/menu-items/new`, `/admin/menu-items/[id]/edit`, `/admin/restaurant-info`, `/admin/gallery`.

- [ ] **Step 2: Unauthenticated access is blocked**

Run: `npm run dev`, open a fresh/incognito browser session (no existing Supabase auth cookie), navigate to `http://localhost:3000/admin`.
Expected: redirected to `/admin/login` (proves `middleware.ts` from Task 7 works against a real request, not just its unit-tested pure decision function).

- [ ] **Step 3: Login flow**

On `/admin/login`, submit an intentionally wrong password for `phamtuanan3939@gmail.com`.
Expected: "Email hoặc mật khẩu không đúng." error shown, still on the login page.

Submit the correct password (the one the admin was told to rotate after the public-site branch — use whatever it currently is).
Expected: redirected to `/admin`, dashboard renders with `Card`s showing real counts (30 menu items, 2 unavailable per the seed data unless already edited, 7 categories, 6 gallery images — adjust expectations if earlier steps in this same verification pass have already changed them).

Navigate directly to `/admin/login` again while still authenticated.
Expected: immediately redirected back to `/admin` (proves the login-page branch of `resolveAdminRedirect` behaves the same way live as it does in Task 7's unit tests).

- [ ] **Step 4: Categories CRUD + reorder**

On `/admin/categories`: add a new category (temporary, e.g. "Test — xoá sau" / "Test — delete later"), confirm it appears in the list with an auto-generated slug. Edit an existing category's English name and save — confirm the change is reflected. Drag-reorder two categories, refresh the page, confirm the new order persisted. Delete the temporary test category via the confirm dialog — confirm it's gone from the list.

Open `/menu` in another tab (public site) and confirm the category tab order matches what was just set, and the deleted test category never appears there.

- [ ] **Step 5: Menu items CRUD + image upload + reorder**

On `/admin/menu-items`: add a new item to an existing category, including uploading a real image file through `ImageUploader` — confirm the image preview appears after upload and the item saves successfully. Toggle `is_available` off on an existing item, save, confirm the "Hết hàng" badge appears in the admin list. Toggle `is_featured` on for the same item.

Filter to a single category and drag-reorder its items; confirm the order persists after a refresh.

Search for a partial dish name; confirm the list filters correctly.

Delete the test item added at the start of this step.

Open `/menu` on the public site: confirm the toggled item shows a "Hết món"/"Sold Out" badge, and `/` (home page) no longer/still shows it under Signature Dishes depending on the `is_featured` state set above.

- [ ] **Step 6: Restaurant info — including the real content fix flagged since the public-site branch**

On `/admin/restaurant-info`: replace the placeholder `map_embed_url` (the synthetic, invalid `pb=` parameter string that has been sitting in `seed.sql` since the public-site branch) with a real, working embed URL for the seeded address (`15 Đồng Khởi, Quận 1, TP. Hồ Chí Minh` — Đồng Khởi is a real Ho Chi Minh City street, so a real embed is meaningful here). Google's basic embed format needs no API key:

```
https://www.google.com/maps?q=15+Dong+Khoi,+Ben+Nghe,+Quan+1,+Ho+Chi+Minh+City&output=embed
```

Save, then open `/contact` on the public site and confirm the map now actually renders the location instead of Google's "invalid request" error — this closes out the one concrete content defect carried over from the previous branch's final review.

Upload a new logo and hero image through the two `ImageUploader` instances on this page; save; confirm `/` (home page hero) and anywhere the logo appears reflect the new images after a refresh.

- [ ] **Step 7: Gallery multi-upload, captions, reorder, delete**

On `/admin/gallery`: select 2+ image files at once through the file picker (the `multiple` attribute from Task 22) and confirm each becomes its own row with a blank caption. Fill in VI/EN captions for one of the new rows and click away (blur) — confirm no error toast appears. Drag-reorder the gallery. Delete one of the two test images added at the start of this step.

Open `/gallery` on the public site: confirm the new (non-deleted) image and its caption appear, in the order set above.

- [ ] **Step 8: Logout**

Click "Đăng xuất" in the sidebar. Expected: redirected to `/admin/login`. Attempt to navigate back to `/admin` directly (e.g. via the browser's back button or typing the URL). Expected: redirected to `/admin/login` again — confirms the session was actually cleared, not just the UI navigated away.

- [ ] **Step 9: Console check**

Check the browser console across all the admin pages visited above.
Expected: no errors beyond the already-known, already-documented Dark Reader extension noise (`data-darkreader-*` attribute warnings) from the public-site branch's own verification — if anything else appears, it's a genuine new defect and must be fixed before this task is considered complete, not noted as a residual.

- [ ] **Step 10: Update the SDD ledger (or equivalent progress notes) with the outcome of Steps 1-9**, exactly as the public-site branch's Task 16 did — record what passed, and transparently flag anything that didn't rather than silently omitting it.

**No commit for this task** (matches the public-site plan's own Task 16 precedent: a clean verification pass with no code changes doesn't need one; if Step 6's map URL fix or any other step required a code change to fix a discovered bug, that fix gets its own commit at the point it's made, not bundled into this task's non-existent commit).

