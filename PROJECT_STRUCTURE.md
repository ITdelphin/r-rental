# Rwanda EasyRent — Project Structure Document

## Final Year Project (FYP)

**Project Name:** Rwanda EasyRent: A Smart House Rental Management System  
**Student:** [Your Name]  
**Student ID:** [Your Student ID]  
**Course:** Software Engineering  
**Supervisor:** [Supervisor Name]  
**Date:** July 2026

---

## Table of Contents

1. [Overview](#1-overview)
2. [Technology Stack](#2-technology-stack)
3. [Root Directory Structure](#3-root-directory-structure)
4. [Source Code Structure](#4-source-code-structure)
5. [Backend Structure (Supabase)](#5-backend-structure-supabase)
6. [Database Schema](#6-database-schema)
7. [Configuration Files](#7-configuration-files)
8. [Deployment & CI/CD](#8-deployment--cicd)
9. [Key Features](#9-key-features)
10. [Project Files Summary](#10-project-files-summary)

---

## 1. Overview

Rwanda EasyRent is a web-based smart house rental management platform designed to digitize and streamline the entire rental lifecycle in Rwanda. The system supports five user roles (Super Admin, Admin, Property Owner, Tenant, Agent) and includes comprehensive features for property management, booking, payments, messaging, and more.

---

## 2. Technology Stack

| Layer | Technology | Version |
|---|---|---|
| **Frontend Framework** | React | 19.x |
| **Language** | TypeScript | ~6.0 |
| **Build Tool** | Vite | 8.1 |
| **Styling** | Tailwind CSS | 4.3 |
| **Backend/BaaS** | Supabase | 2.108 (JS Client) |
| **Database** | PostgreSQL | 17 |
| **Routing** | React Router DOM | 7.18 |
| **State/Data Fetching** | TanStack React Query | 5.x |
| **Forms** | React Hook Form + Zod | 7.x / 4.x |
| **HTTP Client** | Axios | 1.18 |
| **Internationalization** | i18next + react-i18next | 26.x / 17.x |
| **Maps** | Leaflet + React Leaflet | 1.9 / 5.x |
| **Charts** | Recharts | 3.9 |
| **Animations** | Framer Motion | 12.42 |
| **Icons** | Lucide React | 1.22 |
| **PDF Generation** | jsPDF + jspdf-autotable | 4.x / 5.x |
| **UI Components** | Radix UI + shadcn/ui | - |
| **Email** | Nodemailer (Edge Functions) | - |
| **Deployment** | Vercel | - |
| **CI/CD** | GitHub Actions | - |
| **Font** | Inter (Google Fonts) | - |

---

## 3. Root Directory Structure

```
C:\Users\delph\rental\
│
├── .env                          # Environment variables (Supabase URL + anon key)
├── .env.example                  # Environment variable template
├── .env.local                    # Local environment overrides
├── .git/                         # Git repository
├── .gitignore                    # Git ignore rules
├── .vercel/                      # Vercel deployment metadata
├── 2/                            # [Unknown folder]
├── AGENTS.md                     # AI agent session context documentation
├── dist/                         # Production build output
├── FYP_REPORT.md                 # FYP Report (main file)
├── FYP_REPORT_Part1.md           # FYP Report Part 1
├── FYP_REPORT_Part2.md           # FYP Report Part 2
├── FYP_REPORT_Part3.md           # FYP Report Part 3
├── FYP_REPORT_Part4.md           # FYP Report Part 4
├── FYP_REPORT_Part5.md           # FYP Report Part 5
├── FYP_REPORT_Part6.md           # FYP Report Part 6
├── FYP_REPORT for Rwanda-Easyrent.md  # FYP Report (alternate)
├── github/                       # GitHub configuration
│   └── workflows/
│       └── deploy.yml            # CI/CD pipeline
├── index.html                    # SPA entry point
├── node_modules/                 # Dependencies
├── package.json                  # Project configuration & dependencies
├── package-lock.json             # Dependency lock file
├── public/                       # Static assets
│   ├── favicon.svg               # Site favicon
│   ├── icons.svg                 # SVG icon sprite
│   └── images/                   # Static images
├── README.md                     # Project README
├── run-migration.cjs             # Node script for DB migration
├── scripts/                      # Utility scripts
│   ├── scan.mjs                  # i18n key scanner
│   ├── add_keys.py               # Add translation keys
│   ├── check_props.py            # Check properties
│   ├── find_missing_keys.py      # Find missing i18n keys
│   ├── resolve_missing.py        # Resolve missing translations
│   ├── update_en.py              # Update English locale
│   ├── seed-locations.cjs        # Seed Rwanda locations
│   └── locations-data.json       # Rwanda geographic data
├── src/                          # Source code
├── supabase/                     # Supabase configuration & migrations
├── tsconfig.json                 # TypeScript configuration
├── vercel.json                   # Vercel deployment config
└── vite.config.ts                # Vite build configuration
```

---

## 4. Source Code Structure

```
src/
├── main.tsx                      # App bootstrap (renders <App />, imports i18n + styles)
├── App.tsx                       # Root component (QueryClientProvider, BrowserRouter, routes)
├── style.css                     # Tailwind imports + custom theme tokens
│
├── assets/                       # Static assets (images, etc.)
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx            # Public site header with language switcher
│   │   ├── Footer.tsx            # Public site footer
│   │   ├── PublicLayout.tsx       # Layout wrapper for public pages
│   │   ├── DashboardLayout.tsx   # Dashboard shell (role-based sidebar, header, Outlet)
│   │   └── ProtectedRoute.tsx    # Auth guard with role-based access control
│   │
│   └── ui/
│       ├── index.ts              # Barrel export for UI components
│       ├── avatar.tsx            # Avatar, AvatarImage, AvatarFallback
│       ├── badge.tsx             # Badge component
│       ├── brand-logo.tsx        # Dynamic brand logo (reads from settings)
│       ├── button.tsx            # Button variants
│       ├── card.tsx              # Card component
│       ├── dialog.tsx            # Modal dialog (Radix UI)
│       ├── empty-state.tsx       # Empty state placeholder
│       ├── error-boundary.tsx    # React error boundary
│       ├── input.tsx             # Form input
│       ├── loading.tsx           # Loading spinner
│       ├── LocationSelect.tsx    # Cascading Rwanda location selector
│       └── select.tsx            # Select dropdown (Radix UI)
│
├── pages/
│   ├── public/
│   │   ├── HomePage.tsx          # Landing page (hero, featured properties, newsletter)
│   │   ├── PropertiesPage.tsx    # Property search/browse with filters
│   │   ├── PropertyDetailPage.tsx # Single property detail (map, images, reviews)
│   │   ├── AboutPage.tsx         # About page
│   │   ├── ContactPage.tsx       # Contact form
│   │   ├── FaqPage.tsx           # FAQ page
│   │   ├── PrivacyPage.tsx       # Privacy policy
│   │   └── TermsPage.tsx         # Terms of service
│   │
│   ├── auth/
│   │   ├── LoginPage.tsx         # Email/password + Google OAuth login
│   │   ├── RegisterPage.tsx      # Registration with role selection
│   │   ├── ForgotPasswordPage.tsx # Password reset
│   │   ├── AuthCallbackPage.tsx  # OAuth callback handler
│   │   └── RoleSelectionPage.tsx # Post-registration role chooser
│   │
│   └── dashboard/
│       ├── DashboardHome.tsx     # Dashboard overview (role-specific stats)
│       ├── SettingsPage.tsx      # User account settings
│       ├── AccountSettingsPage.tsx # Account-specific settings
│       ├── BookingsPage.tsx      # Bookings management
│       ├── MessagesPage.tsx      # In-app messaging
│       ├── NotificationsPage.tsx # Notification center
│       ├── ReviewsPage.tsx       # Property reviews
│       ├── ComplaintsPage.tsx    # User complaints
│       ├── ActivityLogsPage.tsx  # Audit log viewer (super_admin only)
│       ├── MaintenanceRequestsPage.tsx # Maintenance requests
│       ├── ContractsPage.tsx     # Rental contracts
│       ├── PaymentPage.tsx       # Payment history/management
│       │
│       ├── tenant/
│       │   ├── TenantBookings.tsx    # Tenant-specific booking view
│       │   └── TenantFavorites.tsx   # Saved/favorited properties
│       │
│       ├── owner/
│       │   ├── OwnerProperties.tsx   # Owner's property listings
│       │   ├── AddPropertyPage.tsx   # Create new property
│       │   ├── EditPropertyPage.tsx  # Edit existing property
│       │   ├── OwnerEarnings.tsx     # Revenue/earnings dashboard
│       │   └── OwnerBookings.tsx     # Owner-specific booking view
│       │
│       ├── admin/
│       │   ├── AdminUsers.tsx        # User management (role change, suspend, verify)
│       │   ├── AdminReports.tsx      # Platform reports/analytics
│       │   └── AdminBookings.tsx     # Admin booking oversight
│       │
│       └── super-admin/
│           └── SuperAdminSettings.tsx # Platform settings (general, branding, CMS)
│
├── hooks/
│   ├── useAuth.ts               # Auth state (user, profile, loading, isAuthenticated)
│   ├── useProperties.ts         # React Query hooks for property CRUD
│   ├── useSettings.ts           # Fetch and cache platform settings
│   └── useContact.ts            # Hardcoded contact info
│
├── lib/
│   ├── supabase.ts              # Supabase browser client initialization (typed)
│   ├── api.ts                   # Full API layer:
│   │                            #   - authApi (login, register, logout, OAuth)
│   │                            #   - profileApi (get, update)
│   │                            #   - propertyApi (CRUD, search, filters)
│   │                            #   - bookingApi (create, update status, list)
│   │                            #   - reviewApi (create, delete, list)
│   │                            #   - favoriteApi (add, remove, list)
│   │                            #   - messageApi (send, list, mark read)
│   │                            #   - notificationApi (list, mark read)
│   │                            #   - paymentApi (create, list)
│   ├── settings.ts              # getSettings() - fetch all settings as key-value map
│   ├── notifications.ts         # In-app notification creators
│   ├── audit.ts                 # createAuditLog() - writes to audit_logs table
│   ├── email.ts                 # triggerEmail() + wrappers for Edge Functions
│   ├── locations.ts             # Rwanda location queries
│   └── utils.ts                 # cn(), formatPrice() (RWF), formatDate(), slugify()
│
├── types/
│   ├── index.ts                 # All TypeScript interfaces:
│   │                            #   Profile, Property, Booking, Payment,
│   │                            #   Review, Favorite, Message, Notification,
│   │                            #   MaintenanceRequest, Complaint, Contract,
│   │                            #   CmsPage, Setting, + Role/Status unions
│   └── supabase.ts             # Auto-generated Supabase Database type (879 lines)
│
├── i18n/
│   ├── index.ts                 # i18next initialization (4 locales, fallback to English)
│   └── locales/
│       ├── en.json              # English (source of truth, ~654 keys)
│       ├── rw.json              # Kinyarwanda (~446 keys)
│       ├── fr.json              # French (~446 keys)
│       └── sw.json              # Swahili (~446 keys)
│
└── store/
    └── sidebarStore.ts          # Sidebar toggle state
```

---

## 5. Backend Structure (Supabase)

### 5.1 Migrations (23 SQL files)

```
supabase/migrations/
├── 00001_schema.sql             # Initial schema (profiles, properties, bookings, etc.)
├── 00002_rls_policies.sql       # Row Level Security policies
├── 00003_functions.sql          # Database functions (handle_new_user, increment_views)
├── 00004_locations.sql          # Rwanda geographic hierarchy table
├── 00005_seed_data.sql          # Initial seed data
├── 00006_settings.sql           # Platform settings table
├── 00007_cms_pages.sql          # CMS pages table
├── 00008_email_logs.sql         # Email logging table
├── 00009_admin_profiles_rls.sql # Admin profile RLS fix
├── ... (up to 00022)
└── 00022_final.sql              # Final migrations
```

### 5.2 Edge Functions (Deno Runtime)

```
supabase/functions/
├── _shared/
│   ├── cors.ts                  # CORS headers helper
│   ├── smtp.ts                  # Nodemailer SMTP transporter factory
│   └── templates.ts             # HTML email template builder
│
├── send-email/
│   └── index.ts                 # Generic email sender
│
├── welcome-email/
│   └── index.ts                 # Welcome email on registration
│
├── booking-notification/
│   └── index.ts                 # Booking lifecycle emails
│                                #   (created/approved/rejected/cancelled/completed)
│
├── message-notification/
│   └── index.ts                 # New message email notification
│
├── review-notification/
│   └── index.ts                 # New review email notification
│
├── contact-form/
│   └── index.ts                 # Contact form submission handler
│
├── newsletter/
│   └── index.ts                 # Newsletter subscription handler
│
├── complaint-notification/
│   └── index.ts                 # Complaint status change email
│
├── account-notification/
│   └── index.ts                 # Account event emails
│
└── delete-user/
    └── index.ts                 # Admin user deletion
```

### 5.3 Supabase Configuration

```
supabase/config.toml             # Local dev config
│                                #   - Postgres 17
│                                #   - API port 54321
│                                #   - Storage 50MiB limit
│                                #   - Email testing on port 54324
│                                #   - Deno Edge Runtime
```

---

## 6. Database Schema

### 6.1 Tables

| Table | Description | Key Columns |
|---|---|---|
| **profiles** | User profiles (extends auth.users) | `id`, `user_id`, `full_name`, `email`, `role`, `is_verified`, `is_suspended`, address fields |
| **properties** | Property listings | `owner_id`, `title`, `category`, `property_type`, `amenities`, `price`, `status`, `is_featured`, `views_count` |
| **property_images** | Property photos | `property_id`, `url`, `is_floor_plan`, `sort_order` |
| **property_videos** | Property videos | `property_id`, `url` |
| **amenities** | Custom amenity labels | `property_id`, `name` |
| **bookings** | Rental booking requests | `property_id`, `tenant_id`, `owner_id`, `status`, `visit_date`, `check_in`, `check_out` |
| **payments** | Payment records | `booking_id`, `payer_id`, `payee_id`, `amount`, `currency` (RWF), `method`, `status` |
| **reviews** | Property reviews | `property_id`, `user_id`, `rating` (1-5), `comment` |
| **favorites** | Saved properties | `user_id`, `property_id` |
| **messages** | In-app messaging | `sender_id`, `receiver_id`, `property_id`, `content`, `is_read` |
| **notifications** | In-app notifications | `user_id`, `title`, `body`, `type`, `is_read`, `data` |
| **maintenance_requests** | Maintenance tracking | `property_id`, `tenant_id`, `title`, `description`, `priority`, `status` |
| **complaints** | User complaints | `user_id`, `subject`, `description`, `status` |
| **contracts** | Rental agreements | `booking_id`, `tenant_id`, `owner_id`, `property_id`, `start_date`, `end_date`, `monthly_rent`, `deposit_amount`, `status` |
| **cms_pages** | CMS content | `slug`, `title`, `content`, `meta_title`, `meta_description`, `is_published` |
| **settings** | Key-value platform config | `key`, `value` |
| **newsletters** | Newsletter subscribers | `email`, `is_active` |
| **audit_logs** | Activity audit trail | `user_id`, `action`, `entity_type`, `entity_id`, `details`, `ip_address` |
| **email_logs** | Sent email tracking | `user_id`, `recipient`, `email_type`, `subject`, `status`, `error_message` |
| **locations** | Rwanda geographic hierarchy | `code`, `name`, `type`, `parent_code` |

### 6.2 User Roles

| Role | Description |
|---|---|
| `super_admin` | Full platform access, manages admins, platform settings |
| `admin` | Manages users, properties, bookings, reports |
| `owner` | Manages own properties, bookings, earnings |
| `tenant` | Browses properties, books, messages owners |
| `agent` | Assists with property listings |

### 6.3 Booking Status Workflow

```
pending → approved → completed
pending → rejected
pending → cancelled
approved → cancelled
```

### 6.4 Database Functions

- **`handle_new_user()`** — Trigger on `auth.users` insert: auto-creates profile row
- **`increment_property_views(uuid)`** — Atomically increment `views_count`

### 6.5 RLS Policies

- **Profiles:** Self-read public, self-update, admin/super_admin can update/delete any
- **Properties:** Published visible to all, owners manage own, admins manage all
- **Bookings:** Visible to tenant + owner + admins
- **Reviews, Messages, Favorites, Notifications:** User-scoped access
- **Settings:** Admin-managed, public read for consumed keys

---

## 7. Configuration Files

| File | Purpose |
|---|---|
| `package.json` | Project name: `rwanda-easyrent`, scripts: `dev`, `build`, `preview` |
| `vite.config.ts` | Tailwind CSS plugin, `@` path alias → `/src` |
| `tsconfig.json` | ES2023 target, strict mode, `@/*` path alias, React JSX transform |
| `vercel.json` | SPA framework preset, rewrites for client-side routing, caching |
| `.env.example` | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| `.gitignore` | Ignores `node_modules`, `dist`, `.env*` |

---

## 8. Deployment & CI/CD

### 8.1 Vercel Deployment

- **Framework:** Vite (auto-detected)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **SPA Rewrites:** All routes → `index.html`

### 8.2 GitHub Actions Pipeline

```yaml
# .github/workflows/deploy.yml

Jobs:
  1. lint         # TypeScript + ESLint checks
  2. test         # Run test suite
  3. deploy       # Deploy to Vercel
  4. migrate      # Push Supabase migrations
  5. functions    # Deploy Edge Functions
```

**Required Secrets:**
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`
- `SUPABASE_DB_PASSWORD`

---

## 9. Key Features

| Feature | Description |
|---|---|
| **Multi-role System** | 5 roles with RBAC (super_admin, admin, owner, tenant, agent) |
| **4-Language i18n** | English, Kinyarwanda, French, Swahili |
| **Rwanda-Specific** | Granular locations (Province→District→Sector→Cell→Village), RWF currency |
| **Payment Methods** | MTN MoMo, Airtel Money, Visa, Mastercard, Flutterwave |
| **Interactive Maps** | Leaflet/React Leaflet for property locations |
| **Email Pipeline** | 10 Edge Functions covering booking lifecycle, welcome, contact, newsletter |
| **Dynamic Branding** | Platform name/logo configurable from admin settings |
| **Realtime Notifications** | Supabase Realtime for live unread count updates |
| **Audit Logging** | Property and review activity tracked |
| **PDF Generation** | Contracts and receipts via jsPDF |
| **Dark Mode** | Full Tailwind dark theme support |
| **Row Level Security** | Security policies on all database tables |
| **CI/CD** | Automated lint, test, deploy via GitHub Actions |

---

## 10. Project Files Summary

| Category | Count | Description |
|---|---|---|
| React Components | ~50 | UI components, pages, layouts |
| TypeScript Types | ~30 | Interfaces and type definitions |
| API Functions | ~100 | API layer functions across all entities |
| Database Tables | 20 | Supabase PostgreSQL tables |
| SQL Migrations | 23 | Database schema evolution files |
| Edge Functions | 10 | Serverless email/notification functions |
| i18n Keys | 654+ | English source keys |
| Locales | 4 | EN, RW, FR, SW |
| Utility Scripts | 8 | i18n maintenance, location seeding |

---

## Appendix A: Environment Variables

```env
# Required
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Edge Functions (server-side)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Appendix B: NPM Scripts

```bash
npm run dev          # Start development server
npm run build        # TypeScript compile + Vite build
npm run preview      # Preview production build
npm run lint         # ESLint check
```

## Appendix C: Key Source Files

| File | Purpose |
|---|---|
| `src/App.tsx` | Root component with all routes |
| `src/lib/api.ts` | Complete API layer |
| `src/lib/supabase.ts` | Supabase client initialization |
| `src/hooks/useAuth.ts` | Authentication state management |
| `src/types/index.ts` | All TypeScript interfaces |
| `src/components/layout/ProtectedRoute.tsx` | Route protection with RBAC |
| `src/components/layout/DashboardLayout.tsx` | Role-based dashboard layout |
| `src/pages/dashboard/super-admin/SuperAdminSettings.tsx` | Platform settings management |

---

**Document Version:** 1.0  
**Last Updated:** July 2026
