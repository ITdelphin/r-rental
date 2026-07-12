# Session Context

## Project
Rwanda EasyRent - property rental platform (React + Vite + Supabase)

## Translation System
- **i18n:** 4 locale files: en.json (654 keys, source of truth), rw.json (446), fr.json (446), sw.json (446)
- **Missing keys fall back to English** via i18n's `parseMissingKeyHandler`
- **Swahili** fully added (sw.json, i18n/index.ts, Header.tsx)
- All 370+ hardcoded English strings replaced with `t()` calls across all components
- Locale hardcoding (`en-US`) in `toLocaleDateString`/`toLocaleTimeString` replaced with `i18n.language`

## Recent Fixes
- **RLS bug:** Profile update policy only allowed `auth.uid() = user_id` — added `00009_admin_profiles_rls.sql` migration allowing admin/super_admin to update any profile
- **Duplicate route:** Removed `SuperAdminCms.tsx` (1-line re-export of SuperAdminSettings), removed `/dashboard/cms` route
- **Route protection:** Added `allowedRoles` to sensitive dashboard routes (users, reports, settings, activity-logs)
- **Role escalation:** AdminUsers.tsx now only shows `super_admin` option in role dropdown if current user is super_admin
- **Dead settings removed from UI:** Removed security, email/SMTP, notifications, primary_color, hero_video sections from SuperAdminSettings (settings saved but never consumed)
- **Revenue:** DashboardHome now sums completed payments instead of hardcoded 0
- **Hardcoded strings:** Fixed MessagesPage `en-US` locale, remaining ~37 hardcoded strings across all components

## Supabase Schema
- `profiles` table: `id` (PK, refs auth.users), `user_id` (unique, refs auth.users), role, is_verified, is_suspended
- RLS: Profiles self-update + admin-override (migration 00009)
- Settings: key-value pairs, only `platform_name`, `support_email`, `phone_number`, `address`, `hero_background`, `logo_url`, `favicon_url` are consumed
- `audit_logs` table exists but no frontend code writes to it
- `email_logs` table exists (migration 00008), populated by Edge Functions

## Key Files
- `src/App.tsx` — routes with role gating on admin/super-admin pages
- `src/pages/dashboard/super-admin/SuperAdminSettings.tsx` — 3 sections: general, branding (logo/hero/favicon), pages (CMS)
- `src/pages/dashboard/admin/AdminUsers.tsx` — user management with role change, suspend, verify
- `src/components/layout/ProtectedRoute.tsx` — supports `allowedRoles` prop
- `src/components/layout/DashboardLayout.tsx` — role-based nav (superAdminNav, adminNav, ownerNav, tenantNav)
- `src/hooks/useAuth.ts` — provides `user`, `profile`, `loading`
- `src/types/index.ts` — Profile, Property, Booking, Payment, etc.

## Build
- `npx tsc --noEmit` and `npx vite build` both pass cleanly
- Deployed on Vercel (auto-deploys from GitHub master)
