# Rustic Jewels - Digital Jewellery Catalogue

A production-ready, high-fidelity digital catalogue built for a bespoke Instagram-based jewellery business. Users can browse artisan pieces in rich detail and seamlessly contact the business to inquire or place orders via Instagram.

---

## 🛠 Tech Stack
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (v4)
- **Database & Storage:** Supabase (PostgreSQL, RLS Policies, triggers, Storage buckets)
- **Animations:** Framer Motion (Elegant, subtle page entrance animations)
- **Forms & Validation:** React Hook Form + Zod validation

---

## 📁 Core Directory Structure
```
app/              # Next.js App routing gates and storefront pages
components/ui/    # Reusable custom UI components (Buttons, Cards, Navbar, Modal)
features/         # Modular feature components
lib/supabase/     # Supabase client and server configuration initializers
hooks/            # Reusable React hooks
types/            # Unified TypeScript interfaces
services/         # Business logic gateways (Auth services, Product operations)
supabase/         # Supabase SQL table definitions, indexes and RLS policies
public/           # Static asset assets (Favicons, banners)
```

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-string

# Direct Database URL (Optional, for migrations)
DATABASE_URL=postgresql://postgres:password@db.your-project-id.supabase.co:5432/postgres

# Public Branding Configuration
NEXT_PUBLIC_INSTAGRAM_USERNAME=rustic_jewels_instagram
```

> [!NOTE]
> **Demo Fallback Mode:** If the `.env.local` variables are left blank or omitted, the application **automatically runs in offline demo mode**, persisting catalogue edits and dashboard creations inside the browser's `localStorage` and pre-loading beautiful mockup seed listings.

---

## 💾 Supabase Schema Setup

1. Create a new project in the [Supabase Dashboard](https://supabase.com).
2. Go to the **SQL Editor** tab.
3. Copy the contents of [`supabase/schema.sql`](file:///home/dizzy/Desktop/rustic/supabase/schema.sql) and paste it into the query editor.
4. Run the query to create all tables, indexes, triggers, Row Level Security (RLS) policies, and storage configurations.
5. In your Supabase dashboard:
   - Go to **Authentication** -> **Users** and create a new administrator login.
   - The trigger on the `auth.users` table will automatically register this user into the public `admins` profile table, granting them catalog write access.

---

## 🚀 Running Locally

1. Clone or download the repository workspace.
2. Install the node packages:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.
5. If running in **Demo Mode**, log into the administration panel at `/admin/login` using:
   - **Email:** `admin@rusticjewels.com`
   - **Password:** `admin`

---

## ⚡ Production Deployment to Vercel

### Option 1: Vercel CLI (Recommended)
1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```
2. Link the repository project:
   ```bash
   vercel link
   ```
3. Configure the environment variables in the Vercel dashboard.
4. Deploy the build bundle:
   ```bash
   vercel --prod
   ```

### Option 2: Git Integration
1. Push the code repository to GitHub, GitLab, or Bitbucket.
2. Connect your Git account in the [Vercel Dashboard](https://vercel.com).
3. Import the project repository.
4. Add the environment variables under **Settings** -> **Environment Variables**.
5. Press **Deploy**. Vercel will automatically compile typechecks and deploy changes on every push to the master branch.
