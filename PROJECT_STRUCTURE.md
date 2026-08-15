# Rwanda EasyRent — Project Structure Document

## Final Year Project (FYP)

**Project Name:** Rwanda EasyRent: A Smart House Rental Management System  
**Student:** [Your Name]  
**Student ID:** [Your Student ID]  
**Course:** Software Engineering  
**Supervisor:** [Supervisor Name]  
**Last Updated:** August 2026  
**Document Version:** 3.0 (post-v3 revision — see section 14)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Technology Stack](#2-technology-stack)
3. [Root Directory Structure](#3-root-directory-structure)
4. [Source Code Structure](#4-source-code-structure)
5. [Routing](#5-routing)
6. [Backend Structure (Supabase)](#6-backend-structure-supabase)
7. [Database Schema](#7-database-schema)
8. [Permissions & Admin Roles System](#8-permissions--admin-roles-system)
9. [Internationalization (i18n)](#9-internationalization-i18n)
10. [Configuration Files](#10-configuration-files)
11. [Deployment & CI/CD](#11-deployment--cicd)
12. [Key Features](#12-key-features)
13. [Project Files Summary](#13-project-files-summary)
14. [FYP v3 Revision Notes](#14-fyp-v3-revision-notes)

---

## 1. Overview

Rwanda EasyRent is a web-based smart house rental management platform designed to digitize and streamline the entire rental lifecycle in Rwanda. The system supports five user roles (Super Admin, Admin, Property Owner, Tenant, Agent) and covers the full lifecycle: property listing with **rentable units**, **rental applications**, bookings, a **rent ledger** (charges + payments), contracts, **verification** of properties/owners, maintenance, complaints, messaging, **privacy & data requests**, **analytics views**, and a granular permission system.

In the v3 revision the platform prevents **self-service role selection**: all new users are created as `tenant`; `owner`, `agent`, `admin`, and `super_admin` roles are granted only by an administrator or super admin.

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
| **Data Fetching** | TanStack React Query | 5.x |
| **Forms** | React Hook Form + Zod | 7.x / 4.x |
| **HTTP Client** | Axios | 1.18 |
| **Internationalization** | i18next + react-i18next | 26.x / 17.x |
| **Maps** | Leaflet + React Leaflet | 1.9 / 5.x |
| **Charts** | Recharts | 3.9 |
| **Animations** | Framer Motion | 12.42 |
| **Icons** | Lucide React | 1.22 |
| **PDF Generation** | jsPDF + jspdf-autotable | 4.x / 5.x |
| **UI Components** | Radix UI + shadcn/ui style | - |
| **Email** | SMTP via Edge Functions (Deno) | - |
| **Deployment** | Vercel | - |
| **CI/CD** | GitHub Actions | - |

---

## 3. Root Directory Structure

```
C:\Users\delph\rental\
│
├── .env                          # Environment variables (Supabase URL + anon key)
├── .env.example                  # Environment variable template
├── .env.local                    # Local environment overrides (gitignored)
├── .git/                         # Git repository
├── .github/                      # GitHub configuration & CI/CD
│   └── workflows/
│       └── deploy.yml            # CI/CD pipeline (moved from `github/`)
├── .gitignore                    # Git ignore rules
├── .vercel/                      # Vercel deployment metadata
├── 2/                            # [Unused leftover] duplicate jfif images (not referenced by app)
├── AGENTS.md                     # AI agent session context documentation
├── dist/                         # Production build output (npm run build)
├── index.html                    # SPA entry point
├── node_modules/                 # Dependencies
├── package.json                  # Project configuration & dependencies
├── package-lock.json             # Dependency lock file
├── PROJECT_STRUCTURE.md          # This document
├── public/                       # Static assets (served as-is)
│   ├── BingSiteAuth.xml          # Bing site verification
│   ├── favicon.svg               # Site favicon
│   ├── google4288e2105f2170f1.html  # Google Search Console verification
│   ├── icons.svg                 # SVG icon sprite
│   ├── robots.txt                # Crawler rules
│   ├── sitemap.xml               # SEO sitemap
│   └── images/                   # Static images (jfif/jpg, og-image.jpg, easyrentlogo.jpeg)
├── README.md                     # Project README
├── run-migration.cjs             # Node script for DB migration
├── scripts/                      # Utility scripts (i18n scanning, location seeding)
│   ├── add_keys.py               # Add translation keys
│   ├── check_props.py            # Check properties
│   ├── find_missing_keys.py      # Find missing i18n keys
│   ├── locations-data.json       # Rwanda geographic data
│   ├── resolve_missing.py        # Resolve missing translations
│   ├── scan.mjs                  # i18n key scanner
│   ├── seed-locations.cjs        # Seed Rwanda locations
│   └── update_en.py              # Update English locale
├── src/                          # Source code (see section 4)
├── supabase/                     # Supabase configuration & migrations (see section 6)
├── tsconfig.json                 # TypeScript configuration
├── vercel.json                   # Vercel deployment config
└── vite.config.ts                # Vite build configuration
```

---

## 4. Source Code Structure

```
src/
├── main.tsx                      # App bootstrap (renders <App />, imports i18n + styles)
├── App.tsx                       # Root component (QueryClientProvider, BrowserRouter, all routes)
├── style.css                     # Tailwind imports + custom theme tokens
│
├── assets/                       # Static assets (images, etc.)
│
├── config/
│   └── branding.ts               # Brand defaults (platform name, contact info, brand colors)
│
├── components/
│   ├── SEO.tsx                   # react-helmet-async wrapper for meta/OG/JSON-LD tags
│   ├── layout/
│   │   ├── Header.tsx            # Public site header with language switcher
│   │   ├── Footer.tsx            # Public site footer
│   │   ├── PublicLayout.tsx      # Layout wrapper for public pages
│   │   ├── DashboardLayout.tsx   # Dashboard shell (role-based sidebar, header, Outlet)
│   │   └── ProtectedRoute.tsx    # Auth guard with RBAC (`allowedRoles` prop)
│   ├── property/
│   │   └── UnitsManager.tsx      # Reusable unit CRUD (list/add/update status/delete) for a property
│   └── ui/
│       ├── index.ts              # Barrel export for UI components
│       ├── avatar.tsx            # Avatar, AvatarImage, AvatarFallback
│       ├── availability-calendar.tsx  # Property availability calendar
│       ├── badge.tsx             # Badge component
│       ├── brand-logo.tsx        # Dynamic brand logo (reads from settings)
│       ├── button.tsx            # Button variants
│       ├── card.tsx              # Card component
│       ├── compare-properties.tsx    # CompareBar + ComparePage (property comparison)
│       ├── dialog.tsx            # Modal dialog (Radix UI)
│       ├── empty-state.tsx       # Empty state placeholder
│       ├── error-boundary.tsx    # React error boundary
│       ├── input.tsx             # Form input
│       ├── loading.tsx           # Loading spinner + CardSkeleton
│       ├── LocationSelect.tsx    # Cascading Rwanda location selector
│       ├── price-range-slider.tsx# Dual-thumb price range slider
│       ├── property-share.tsx    # Share/copy-link + social share
│       └── select.tsx            # Select dropdown (Radix UI)
│
├── pages/
│   ├── public/
│   │   ├── HomePage.tsx          # Landing page (hero, featured properties, newsletter)
│   │   ├── PropertiesPage.tsx    # Property search/browse with filters
│   │   ├── PropertyDetailPage.tsx# Property detail (map, images, units, verification badge,
│   │   │                         #   apply for a unit, report listing, reviews, booking)
│   │   ├── AboutPage.tsx         # About page
│   │   ├── ContactPage.tsx       # Contact form
│   │   ├── FaqPage.tsx           # FAQ page
│   │   ├── PrivacyPage.tsx       # Privacy policy
│   │   └── TermsPage.tsx         # Terms of service
│   ├── auth/
│   │   ├── LoginPage.tsx         # Email/password + Google OAuth login
│   │   ├── RegisterPage.tsx      # Registration (no role selection — all new users become `tenant`)
│   │   ├── ForgotPasswordPage.tsx# Password reset
│   │   └── AuthCallbackPage.tsx  # OAuth callback → straight to /dashboard
│   └── dashboard/
│       ├── DashboardHome.tsx     # Dashboard overview (role-specific stats, real revenue)
│       ├── SettingsPage.tsx      # User account settings
│       ├── AccountSettingsPage.tsx # Account settings + privacy/data-request card
│       ├── ApplicationsPage.tsx  # Role-aware rental applications (tenant apply/track, owner review)
│       ├── BookingsPage.tsx      # Role-aware booking hub (Admin/Tenant/Agent view)
│       ├── MessagesPage.tsx      # In-app messaging
│       ├── NotificationsPage.tsx # Notification center
│       ├── ReviewsPage.tsx       # Property reviews
│       ├── ComplaintsPage.tsx    # User complaints
│       ├── ActivityLogsPage.tsx  # Audit log viewer (super_admin only)
│       ├── MaintenanceRequestsPage.tsx # Maintenance requests (submitted→…→closed workflow)
│       ├── ContractsPage.tsx     # Rental contracts + PDF generation
│       ├── PaymentPage.tsx       # Payment history/management
│       ├── tenant/
│       │   ├── TenantBookings.tsx  # Tenant-specific booking view
│       │   └── TenantFavorites.tsx # Saved/favorited properties
│       ├── owner/
│       │   ├── OwnerProperties.tsx  # Owner's property listings
│       │   ├── AddPropertyPage.tsx  # Create new property
│       │   ├── EditPropertyPage.tsx # Edit property + manage units (UnitsManager)
│       │   ├── OwnerEarnings.tsx    # Revenue/earnings dashboard
│       │   └── OwnerBookings.tsx    # Owner-specific booking view
│       ├── admin/
│       │   ├── AdminUsers.tsx       # User management (role change, suspend, verify)
│       │   ├── AdminReports.tsx     # Platform reports/analytics
│       │   └── AdminBookings.tsx    # Admin booking oversight
│       └── super-admin/
│           └── SuperAdminSettings.tsx # Settings (general, feature flags, CMS pages, config history)
│
├── hooks/
│   ├── useAuth.ts               # Auth state (user, profile, loading, isAuthenticated)
│   ├── useContact.ts            # Contact info (from settings, fallback to branding)
│   ├── usePermissions.ts        # usePermissions / useAdminRoles / useRoleTemplates
│   ├── useProperties.ts         # React Query hooks for property CRUD
│   ├── useSavedSearches.ts      # Persisted search filters
│   └── useSettings.ts           # Fetch and cache platform settings
│
├── lib/
│   ├── api.ts                   # API layer: 20 blocks — auth, profile, property, booking, review,
│   │                            #   favorite, message, notification, payment + v3 (unit, application,
│   │                            #   charge, transaction, report, verification, maintenance,
│   │                            #   renewal, dataRequest, consent, savedSearch)
│   ├── audit.ts                 # createAuditLog() - writes to audit_logs table
│   ├── email.ts                 # triggerEmail() + wrappers for Edge Functions
│   ├── locations.ts             # Rwanda location queries
│   ├── notifications.ts         # In-app notification creators
│   ├── seo-data.ts              # Per-page SEO metadata (title/description/OG)
│   ├── settings.ts              # getSettings() - fetch settings as key-value map
│   ├── supabase.ts              # Supabase browser client initialization (typed)
│   └── utils.ts                 # cn(), formatPrice() (RWF), formatDate(), slugify()
│
├── store/
│   ├── compareStore.ts          # Property comparison state (Zustand-style store)
│   └── sidebarStore.ts          # Sidebar toggle state
│
├── types/
│   ├── index.ts                 # All TypeScript interfaces (Profile, Property, Booking, ...)
│   │                            #   v3: PropertyUnit, RentalApplication, RentCharge,
│   │                            #       PaymentTransaction, PropertyVerification, OwnerVerification,
│   │                            #       PropertyReport, MaintenanceComment/Assignment,
│   │                            #       LeaseRenewal, DataRequest, ConsentRecord, SavedSearch, ...
│   └── supabase.ts              # Generated Supabase Database types
│
└── i18n/
    ├── index.ts                 # i18next init (4 locales, fallback to English, parseMissingKeyHandler)
    └── locales/
        ├── en.json              # English (source of truth, 863 keys)
        ├── rw.json              # Kinyarwanda (756 keys)
        ├── fr.json              # French (756 keys)
        └── sw.json              # Swahili (756 keys)
```

---

## 5. Routing

All routes are defined in `src/App.tsx`. Public routes render inside `PublicLayout`; dashboard routes inside `ProtectedRoute` → `DashboardLayout`. Sensitive routes use `allowedRoles`.

| Route | Component | Access |
|---|---|---|
| `/` | HomePage | public |
| `/properties` | PropertiesPage | public |
| `/properties/:id` | PropertyDetailPage | public |
| `/about` `/contact` `/faq` `/privacy` `/terms` | About/Contact/Faq/Privacy/Terms | public |
| `/compare` | ComparePage (`components/ui/compare-properties`) | public |
| `/auth/login` `/auth/register` `/auth/forgot-password` `/auth/callback` | Auth pages | public |
| `/dashboard` | DashboardHome | authenticated |
| `/dashboard/settings` `/account` `/messages` `/notifications` `/reviews` `/bookings` `/applications` `/favorites` `/maintenance` `/contracts` `/payments` | User pages | authenticated |
| `/dashboard/properties` (+`/add`, `/:id/edit`) | Owner property management | owner |
| `/dashboard/earnings` | OwnerEarnings | owner |
| `/dashboard/users` `/dashboard/reports` | AdminUsers / AdminReports | admin, super_admin |
| `/dashboard/complaints` | ComplaintsPage | authenticated |
| `/dashboard/activity-logs` | ActivityLogsPage | super_admin |
| `/dashboard/super-admin/settings` | SuperAdminSettings | super_admin |

> **Note:** `/auth/choose-role` and the `RoleSelectionPage` were **removed** in v3 — new users are always `tenant` and cannot select their own role.

---

## 6. Backend Structure (Supabase)

### 6.1 Migrations (35 files)

```
supabase/migrations/
├── 00001_schema.sql                     # Initial schema (all core tables + RLS)
├── 00002_fix_properties_fk.sql          # Property FK fix
├── 00002_seed.sql                       # Seed data (NOTE: duplicate 00002 number)
├── 00003_settings_rls.sql               # Settings table RLS
├── 00004_locations_table.sql            # Rwanda geographic hierarchy table
├── 00005_property_images_rls.sql        # Property images RLS
├── 00006_cms_and_settings_rls.sql       # CMS pages + settings RLS
├── 00007_increment_property_views.sql   # increment_property_views function
├── 00008_email_logs.sql                 # Email logging table
├── 00009_admin_profiles_rls.sql         # Admin profile RLS fix
├── 00010_public_settings_select.sql     # Public settings select policy
├── 00011_notifications_insert_policy.sql
├── 00012_fix_notifications_fk.sql
├── 00013_add_bookings_reply_message.sql
├── 00014_add_booking_dates.sql
├── 00015_audit_logs_rls.sql
├── 00016_missing_rls_policies.sql
├── 00017_update_contact_settings.sql
├── 00018_notifications_delete_policy.sql
├── 00019_avatars_storage_bucket.sql     # Storage bucket for avatars
├── 00020_missing_rls_policies.sql
├── 00021_fix_avatars_rls_path.sql
├── 00022_fix_admin_profile_update_rls.sql
├── 00023_permissions_admin_roles.sql    # permissions, admin_roles, role_templates,
│                                        #   config_history, feature_flags, admin_invitations
├── 00024_rls_fixes_admin_override.sql   # Admin/super_admin RLS override fixes
├── 00025_property_units.sql             # property_units + unit_id on bookings/contracts + RLS
├── 00026_rental_applications.sql        # rental_applications + RLS
├── 00027_rent_payments.sql              # rent_charges, payment_transactions + RLS
├── 00028_verifications_reports.sql      # property_verifications, owner_verifications,
│                                        #   property_reports + RLS
├── 00029_maintenance_workflow.sql       # maintenance_comments, maintenance_attachments,
│                                        #   maintenance_assignments + RLS
├── 00030_privacy_security.sql           # consent_records, data_requests, security_events,
│                                        #   user_sessions + RLS
├── 00031_renewals_docs.sql              # lease_renewals, notification_preferences,
│                                        #   documents, saved_searches + RLS
├── 00032_analytics_views.sql            # 7 analytics views (security_barrier) +
│                                        #   get_occupancy_rate(), get_monthly_revenue()
├── 00033_system_protection.sql          # is_super_admin(), protect_system_settings() trigger,
│                                        #   role/payment audit triggers, sync_unit_from_booking(),
│                                        #   feature_flags update WITH CHECK fix
└── 00034_maintenance_status_workflow.sql # Maintenance status workflow
```

### 6.2 Edge Functions (Deno Runtime)

```
supabase/functions/
├── _shared/
│   ├── cors.ts                          # CORS headers helper
│   ├── smtp.ts                          # Nodemailer SMTP transporter factory
│   └── templates.ts                     # HTML email template builder
├── send-email/index.ts                  # Generic email sender
├── welcome-email/index.ts               # Welcome email on registration
├── booking-notification/index.ts        # Booking lifecycle emails
├── message-notification/index.ts        # New message email notification
├── review-notification/index.ts         # New review email notification
├── contact-form/index.ts                # Contact form submission handler
├── newsletter/index.ts                  # Newsletter subscription handler
├── complaint-notification/index.ts      # Complaint status change email
├── account-notification/index.ts        # Account event emails
└── delete-user/index.ts                 # Admin user deletion
```

---

## 7. Database Schema

### 7.1 Core Tables (from 00001)

| Table | Description | Key Columns |
|---|---|---|
| **profiles** | User profiles (extends auth.users) | `id` (FK auth.users), `user_id` (unique), `full_name`, `email`, `role`, `is_verified`, `is_suspended` |
| **properties** | Property listings | `owner_id`, `title`, `category`, `property_type`, `amenities`, `price`, `status`, `is_featured`, `views_count` |
| **property_images** | Property photos | `property_id`, `url`, `is_floor_plan`, `sort_order` |
| **property_videos** | Property videos | `property_id`, `url` |
| **amenities** | Custom amenity labels | `property_id`, `name` |
| **bookings** | Rental booking requests | `property_id`, `tenant_id`, `owner_id`, `unit_id` (v3), `status`, `visit_date`, `check_in`, `check_out`, `reply_message` |
| **payments** | Payment records | `booking_id`, `payer_id`, `payee_id`, `amount`, `currency` (RWF), `method`, `status` |
| **reviews** | Property reviews | `property_id`, `user_id`, `rating` (1-5), `comment` |
| **favorites** | Saved properties | `user_id`, `property_id` |
| **messages** | In-app messaging | `sender_id`, `receiver_id`, `property_id`, `content`, `is_read` |
| **notifications** | In-app notifications | `user_id`, `title`, `body`, `type`, `is_read`, `data` |
| **maintenance_requests** | Maintenance tracking | `property_id`, `tenant_id`, `title`, `priority`, `status` |
| **complaints** | User complaints | `user_id`, `subject`, `description`, `status` |
| **contracts** | Rental agreements | `booking_id`, `tenant_id`, `owner_id`, `property_id`, `unit_id` (v3), `start_date`, `end_date`, `monthly_rent`, `deposit_amount`, `status` |
| **cms_pages** | CMS content | `slug` (unique), `title`, `content`, `meta_title`, `meta_description`, `is_published` |
| **settings** | Key-value platform config | `key` (unique), `value` |
| **newsletters** | Newsletter subscribers | `email`, `is_active` |
| **audit_logs** | Activity audit trail | `user_id`, `action`, `entity_type`, `entity_id`, `details`, `ip_address` |
| **email_logs** | Sent email tracking | `user_id`, `recipient`, `email_type`, `subject`, `status`, `error_message` |
| **locations** | Rwanda geographic hierarchy | `code`, `name`, `type`, `parent_code` |

### 7.2 Granular Permissions Tables (from 00023)

| Table | Description | Key Columns |
|---|---|---|
| **permissions** | All granular permissions | `key` (unique), `category`, `label`, `description` |
| **role_templates** | Predefined permission templates | `name` (unique), `permissions` (jsonb), `is_system` |
| **admin_roles** | Custom roles assigned to admins | `profile_id`, `role_name`, `permissions` (jsonb), `template_id`, `is_active`, `expires_at` |
| **config_history** | Configuration change audit trail | `actor_id`, `setting_key`, `old_value`, `new_value`, `action` (create/update/delete), `metadata` |
| **feature_flags** | Platform feature toggles | `key` (unique), `label`, `description`, `is_enabled`, `updated_by` |
| **admin_invitations** | Pending admin invitations | `email`, `role_name`, `permissions`, `token`, `status`, `expires_at` |

### 7.3 FYP v3 Revision Tables (migrations 00025–00031)

| Table | Description | Key Columns |
|---|---|---|
| **property_units** | Rentable units within a property | `property_id`, `unit_number`, `floor`, `bedrooms`, `bathrooms`, `monthly_rent`, `deposit_amount`, `status` (available/reserved/occupied/maintenance/unavailable) |
| **rental_applications** | Tenant applies for a specific unit | `property_id`, `unit_id`, `applicant_id`, `status` (pending/applied/under_review/approved/rejected/withdrawn), `message`, `rejection_reason` |
| **rent_charges** | Recurring rent bills | `contract_id`, `property_id`, `unit_id`, `tenant_id`, `amount`, `due_date`, `status`, `late_fee` |
| **payment_transactions** | Payments against charges | `charge_id`, `contract_id`, `payer_id`, `amount`, `method`, `status`, `reference` |
| **property_verifications** | Verified property badges | `property_id`, `verified_by`, `status`, `verified_at`, `notes` |
| **owner_verifications** | Owner identity verification | `owner_id`, `status`, `document_url`, `reviewed_by`, `reviewed_at` |
| **property_reports** | User-reported listings | `property_id`, `reporter_id`, `reason`, `details`, `status` |
| **maintenance_comments** | Threads on maintenance requests | `maintenance_id`, `author_id`, `content` |
| **maintenance_attachments** | Photos/docs on requests | `maintenance_id`, `url`, `type` |
| **maintenance_assignments** | Workers assigned to jobs | `maintenance_id`, `assignee_id`, `assigned_by`, `stage` |
| **consent_records** | User data-consent audit | `user_id`, `purpose`, `granted`, `revoked_at`, `ip_address` |
| **data_requests** | GDPR-style data requests | `user_id`, `type` (export/access/correction/erasure), `status`, `data` |
| **security_events** | Login/security audit trail | `user_id`, `event_type`, `ip_address`, `metadata` |
| **user_sessions** | Active session tracking | `user_id`, `session_token`, `ip_address`, `user_agent`, `expires_at` |
| **lease_renewals** | Contract renewal requests | `contract_id`, `tenant_id`, `status`, `requested_by`, `reviewed_by` |
| **notification_preferences** | Per-user notification toggles | `user_id`, `channel`, `event_type`, `enabled` |
| **documents** | Uploaded documents (KYC, contracts) | `owner_id/tenant_id`, `type`, `url`, `verified` |
| **saved_searches** | Saved filter queries | `user_id`, `name`, `filters` (jsonb) |

### 7.4 User Roles

| Role | Description |
|---|---|
| `super_admin` | Full platform access, manages admins, platform settings, feature flags |
| `admin` | Manages users, properties, bookings, reports (subject to `admin_roles` permissions) |
| `owner` | Manages own properties, units, bookings, applications, earnings |
| `tenant` | Browses properties, applies for units, books, messages owners |
| `agent` | Assists with property listings |

> **v3 rule:** New users always register as `tenant`. Role elevation happens only via `AdminUsers` (admin/super_admin).

### 7.5 Booking Status Workflow

```
pending → approved → completed
pending → rejected
pending → cancelled
approved → cancelled
```

### 7.6 Maintenance Status Workflow (v3, from 00034)

```
submitted → acknowledged → assigned → in_progress → completed → verified → closed
```

### 7.7 Rental Application Status Workflow (v3)

```
applied → under_review → approved   (tenant receives offer)
applied → under_review → rejected   (reason recorded)
applied → withdrawn                 (by applicant)
```

### 7.8 Database Functions

- **`handle_new_user()`** — Trigger on `auth.users` insert: auto-creates profile row (default role `tenant`)
- **`increment_property_views(uuid)`** — Atomically increment `views_count`
- **`has_permission(text)`** — Check if current user has a specific permission (SECURITY DEFINER)
- **`get_user_permissions()`** — Return current user's permission array (SECURITY DEFINER)
- **`is_super_admin()`** — Return whether current user is a super admin (00033)
- **`get_occupancy_rate(uuid)`** — Analytics: unit occupancy percentage (00032)
- **`get_monthly_revenue(uuid, date)`** — Analytics: summed rent revenue (00032)
- **`protect_system_settings()`** — Trigger blocking writes to SYSTEM_PROTECTED settings unless super_admin (00033)
- **`sync_unit_from_booking()`** — Keep `property_units.status` in sync with booking status (00033)
- **`log_role_change()`** / **`log_payment_state_change()`** — Audit triggers (00033)

### 7.9 RLS Policies

- **Profiles:** self-read public, self-update, admin/super_admin override (00009, 00022, 00024)
- **Properties:** published visible to all, owners manage own, admins manage all
- **Bookings:** visible to tenant + owner + admins
- **Reviews, Messages, Favorites, Notifications:** user-scoped access
- **Settings:** admin-managed, public read for consumed keys (00010)
- **Permissions/admin_roles/role_templates/config_history/feature_flags/admin_invitations:** role-scoped (00023)
- **Units:** owner manages own, tenant reads available (00025)
- **Applications:** applicant sees own, owner sees own property's, admins see all (00026)
- **Charges/Transactions:** tenant + owner + admin scoped (00027)
- **Verifications/Reports:** admin review, reporter creates, public reads verified/approved (00028)
- **Maintenance workflow tables:** owner/tenant/assignee scoped (00029)
- **Privacy/security tables:** user owns own records; security_events admin-only (00030)
- **Renewals/documents/preferences/saved_searches:** user-scoped with owner/admin hooks (00031)

---

## 8. Permissions & Admin Roles System

- Migrated in **00023** (`permissions`, `role_templates`, `admin_roles`, `config_history`, `feature_flags`, `admin_invitations`).
- Frontend hooks implemented in `src/hooks/usePermissions.ts`:
  - `usePermissions()` — `hasPermission(key)`, `hasAnyPermission(keys)`, lists all permissions and current user's effective permissions (via `get_user_permissions` RPC).
  - `useAdminRoles()` — assign/revoke admin roles, `getRoleForProfile()`.
  - `useRoleTemplates()` — list role templates.
- **NOTE:** The permission hooks are implemented but not yet consumed by any UI component. The `SuperAdminSettings` page already manages `feature_flags` and `config_history`.
- **System protection (00033):** `protect_system_settings()` trigger prevents non-super-admin writes to SYSTEM_PROTECTED settings; audit triggers record role changes and payment state changes.
- Seeded 40+ permissions, 6 system role templates, and 8 default feature flags.

---

## 9. Internationalization (i18n)

- 4 locale files; **English (`en.json`) is the source of truth** with **863 keys**.
- Kinyarwanda (`rw.json`), French (`fr.json`), Swahili (`sw.json`) each have **756 keys**.
- Missing keys fall back to English via `parseMissingKeyHandler` (no runtime crash).
- Locale-aware date formatting via `i18n.language` (no hardcoded `en-US`).
- Utility scripts in `scripts/` keep locales in sync (`scan.mjs`, `find_missing_keys.py`, `resolve_missing.py`, `update_en.py`, `add_keys.py`).

---

## 10. Configuration Files

| File | Purpose |
|---|---|
| `package.json` | Name: `rwanda-easyrent`; scripts: `dev`, `build` (tsc + vite build), `preview` |
| `vite.config.ts` | Tailwind CSS plugin, `@` path alias → `/src` |
| `tsconfig.json` | ES2023 target, strict mode, `@/*` path alias, React JSX transform |
| `vercel.json` | Vite preset, SEO file rewrites (sitemap, robots, Bing, Google), SPA fallback, image/asset caching headers |
| `.env.example` | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| `.gitignore` | Ignores `node_modules`, `dist`, `.env*` |

---

## 11. Deployment & CI/CD

### 11.1 Vercel Deployment

- **Framework:** Vite (auto-detected)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Rewrites:** `sitemap.xml`, `robots.txt`, `BingSiteAuth.xml`, Google verification HTML served statically; all other routes → `index.html`
- **Caching:** static images + `/assets/*` cached `max-age=31536000, immutable`

### 11.2 GitHub Actions Pipeline (`.github/workflows/deploy.yml`)

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

## 12. Key Features

| Feature | Description |
|---|---|
| **Multi-role System** | 5 roles with RBAC (`super_admin`, `admin`, `owner`, `tenant`, `agent`); no self-service role selection |
| **Granular Permissions** | Permission tables, role templates, admin role assignment, permission RPCs |
| **Rentable Units** | Multi-unit properties; units managed per property (`UnitsManager`) |
| **Rental Applications** | Tenants apply for specific units; owners review/approve/reject with reasons |
| **Rent Ledger** | `rent_charges` + `payment_transactions` tracking recurring rent and payments |
| **Verification** | Property and owner verification records with reviewed status badges |
| **Report Listing** | Users can report problematic listings; admins resolve |
| **Privacy & Data** | GDPR-style data requests (export/access/correction/erasure) + consent records |
| **Analytics** | Occupancy-rate + monthly-revenue SQL functions and 7 security-barrier views |
| **Maintenance Workflow** | Full state machine (submitted→acknowledged→assigned→in_progress→completed→verified→closed) with comments/attachments/assignments |
| **4-Language i18n** | English (863 keys), Kinyarwanda, French, Swahili (756 each) |
| **Rwanda-Specific** | Granular locations (Province→District→Sector→Cell→Village), RWF currency |
| **Payment Methods** | MTN MoMo, Airtel Money, Visa, Mastercard, Flutterwave |
| **Interactive Maps** | Leaflet/React Leaflet for property locations |
| **Property Compare** | Side-by-side property comparison bar + page |
| **Email Pipeline** | 10 Edge Functions covering booking lifecycle, welcome, contact, newsletter |
| **Dynamic Branding** | Platform name/logo/favicon/hero configurable from admin settings |
| **Feature Flags** | Super Admin toggles (registration, bookings, messaging, reviews, etc.) |
| **Config History** | Audit trail of platform setting changes |
| **Realtime Notifications** | Supabase Realtime for live unread count updates |
| **Audit Logging** | Property/review activity tracked (`audit_logs`) + role/payment change triggers |
| **PDF Generation** | Contracts and receipts via jsPDF |
| **Dark Mode** | Full Tailwind dark theme support |
| **SEO** | sitemap.xml, robots.txt, JSON-LD, per-page meta via SEO.tsx + seo-data.ts |
| **Row Level Security** | Security policies on all database tables |
| **CI/CD** | Automated lint, test, deploy via GitHub Actions |

---

## 13. Project Files Summary

| Category | Count | Description |
|---|---|---|
| React Components | ~90 | UI components, pages, layouts (incl. UnitsManager, ApplicationsPage) |
| TypeScript Types | ~48 | Interfaces and type definitions (incl. ~18 new v3 types) |
| API Functions | ~110 | API layer functions across all entities (20 API blocks) |
| Database Tables | 42 | Supabase PostgreSQL tables (18 core + 6 permissions + 18 v3) |
| Analytics Views | 7 | security_barrier views for admin/marketplace analytics |
| SQL Migrations | 35 | Database schema evolution files (00001–00034, incl. duplicate 00002) |
| Edge Functions | 10 | Serverless email/notification functions (+`_shared`) |
| i18n Keys | 863 | English source keys (756 in other locales) |
| Locales | 4 | EN, RW, FR, SW |
| Utility Scripts | 8 | i18n maintenance, location seeding |
| Routes | ~27 | Public, auth, and role-protected dashboard routes |

---

## 14. FYP v3 Revision Notes

Applied the revised project structure (per `Rwanda_EasyRent_Revised_Project_Structure_v3.docx`) as a *full implementation + rewrite*:

1. **Auth hardening (P1):** Removed self-service role selection (`RegisterPage`, deleted `RoleSelectionPage`, deleted `/auth/choose-role`, simplified OAuth callback). All new users are `tenant`.
2. **Schema expansion:** 10 new migrations (00025–00034) adding units, applications, rent ledger, verifications, reports, maintenance workflow tables, privacy/security tables, renewals/documents, saved searches, analytics views, and system-protection + audit triggers.
3. **Frontend wiring:** New `ApplicationsPage` (role-aware), units management in `EditPropertyPage` via `UnitsManager`, verified-badge + apply-for-unit + report-listing on `PropertyDetailPage`, privacy/data-request card in `AccountSettingsPage`, new maintenance status workflow.
4. **Ops:** GitHub Actions moved `github/` → `.github/workflows/`.
5. **i18n:** 60 new English keys added (en.json now 863) for applications, units, privacy, reports; other locales fall back to English.
6. **Postponed per v3 (reduced feature count):** newsletter automation, property video support, social sharing, multi-provider payments, AI chatbot, advanced feature-flag complexity.
7. **Not yet wired to UI but schema/hooks ready:** verification workflow screens, admin analytics consumption, `usePermissions` consumption, owner application inbox on `OwnerProperties`/`OwnerBookings`, unit creation on `AddPropertyPage`.
8. New migrations (00025–00034) are **not yet applied** to the database via `run-migration.cjs`.