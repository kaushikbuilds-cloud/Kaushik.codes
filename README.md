# Kaushik Codes 🔗

A fast, mobile-first, searchable **resource hub** for the [@kaushik_codes](https://instagram.com/kaushik_codes) Instagram audience. Visitors open the site from the Instagram bio and instantly find every AI tool, coding resource, website and app mentioned in the videos.

> _"Link bio la iruku bro 🔗"_

Built with **React + Vite + TypeScript + Tailwind** on the frontend and **Supabase** (Postgres + Auth + Storage) on the backend. Deploys to **Vercel**.

---

## ✨ Features

**Public site**
- Sticky compact header, hero + **instant client-side search** (title, description, resource name, category, tags)
- 🔥 Latest Links grid with NEW / category badges, thumbnails, resource counts
- Dynamic category chips (loaded from Supabase — not hardcoded)
- Resource page (`/links/:slug`) listing every link with FREE / PAID / FREEMIUM / NEW badges
- Web Share API with copy-to-clipboard fallback (`"Link copied bro 🔗"`)
- Anonymous click & view tracking (no IPs, no PII)
- Full SEO: dynamic titles, meta, Open Graph, Twitter cards, canonical, `robots.txt`, `sitemap.xml`

**Admin dashboard** (`/admin`, Supabase-auth protected)
- Dashboard stats (posts, published, drafts, resources, clicks, views)
- Post CRUD with search, published/draft filters, delete confirmation
- Visual post editor: unlimited resources with **drag-and-drop reordering**, URL validation, image upload, badges
- Category CRUD with Lucide icons, sort order, delete warning
- Analytics: most viewed posts, most clicked resources, clicks-by-date chart, recent activity
- Editable site settings (hero text, search placeholder, Instagram links, footer…)

**Security**
- Row Level Security on every table
- Public can only read published content + insert anonymous analytics
- Only authenticated admins can create/edit/delete
- Service Role key is **never** used or exposed on the client

---

## 🧱 Tech stack

| Layer | Tools |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, React Router, TanStack Query, Lucide React, Framer Motion |
| Backend | Supabase — PostgreSQL, Auth, Storage |
| Hosting | Vercel |

---

## 1. Installation

Requires **Node 18+** (Node 22 recommended).

```bash
git clone <your-repo-url>
cd Kaushik.codes
npm install
```

## 2. Supabase Setup

1. Create a free project at [supabase.com](https://supabase.com).
2. In **Project Settings → API**, copy your **Project URL** and **anon public** key.
3. (You will run the SQL migration in step 4.)

## 3. Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

```dotenv
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_SITE_URL=https://kaushik.codes
```

> ⚠️ Only the **anon/public** key belongs here. Never put the Supabase **Service Role** key in this file or anywhere client-side.

## 4. SQL Migration

Open the Supabase **SQL Editor** and run the migrations in order:

1. `supabase/migrations/0001_init.sql` — tables, indexes, constraints, cascade rules, RLS policies, helper functions.
2. `supabase/migrations/0002_storage.sql` — the public `media` storage bucket and its admin-only write policies.

Or, with the [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

This creates all tables: `profiles`, `categories`, `posts`, `resources`, `tags`, `post_tags`, `post_views`, `resource_clicks`, `site_settings` — and seeds a default `site_settings` row.

## 5. Storage Bucket Setup

Migration `0002_storage.sql` already creates a **public** bucket named `media` (for post thumbnails and resource images) with:
- Public **read** for everyone
- **Write / update / delete** restricted to admins

If you prefer the dashboard: **Storage → New bucket → `media` → Public**, then apply the policies from `0002_storage.sql`.

## 6. Create First Admin

Admin sign-up is intentionally disabled — accounts are created manually.

1. In Supabase, go to **Authentication → Users → Add user**.
2. Enter the admin **email** and **password**, and enable **Auto Confirm User**.
3. A matching row in `public.profiles` (with `role = 'admin'`) is created automatically by the `on_auth_user_created` trigger.

That user can now sign in at `/admin/login`.

> To promote/verify an admin manually you can also run:
> ```sql
> insert into public.profiles (id, email, role)
> select id, email, 'admin' from auth.users where email = 'you@example.com'
> on conflict (id) do update set role = 'admin';
> ```

## 7. Run Locally

```bash
npm run dev
```

Visit `http://localhost:5173`. The admin lives at `http://localhost:5173/admin`.

## 8. Production Build

```bash
npm run build     # type-checks then builds to dist/
npm run preview   # serve the production build locally
```

## 9. Deploy to Vercel

1. Push the repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new). Vercel auto-detects Vite (`vercel.json` is included with SPA rewrites and asset caching).
3. Add the environment variables from your `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SITE_URL`) in **Project → Settings → Environment Variables**.
4. Deploy. Set `VITE_SITE_URL` to your final domain so canonical/OG/share URLs are correct.
5. In Supabase **Authentication → URL Configuration**, add your Vercel domain to the allowed redirect/site URLs.

## 10. Add First Post

1. Sign in at `/admin/login`.
2. Create a few **Categories** (Categories tab) — e.g. `AI Tools`, `Coding`, `Websites`.
3. Go to **Posts → New Post**:
   - Add a title (slug auto-generates), short & full descriptions, category, tags, thumbnail.
   - Add **Resources** — name, URL, description, image, badge — and drag to reorder.
   - Click **Publish** (or **Save Draft**).
4. Open the homepage — your post appears under **Latest Links** and is instantly searchable. 🎉

---

## 📁 Project structure

```
src/
 ├── components/     # Header, Footer, cards, search, admin widgets, UI primitives
 ├── pages/          # HomePage, ResourcePage, 404 + admin/* pages
 ├── layouts/        # PublicLayout, AdminLayout
 ├── features/       # data hooks grouped by domain (posts, categories, analytics, settings)
 ├── hooks/          # generic hooks (useDebounce, useSeo)
 ├── services/       # Supabase query/mutation functions
 ├── lib/            # supabase client, query client, env
 ├── utils/          # slug, date, url, share, cn helpers
 ├── routes/         # router, ProtectedRoute, ScrollToTop
 ├── types/          # database row types
 ├── contexts/       # AuthContext, ToastContext
 └── assets/
supabase/migrations/ # SQL migrations
```

## 🔐 Privacy

Analytics are fully anonymous: only a post/resource id and a timestamp are stored. No IP addresses, user agents, cookies, or personal data are ever collected. No Google Analytics.

---

Made with ☕ by Kaushik.
