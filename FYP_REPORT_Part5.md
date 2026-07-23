## Chapter 5: Implementation

### 5.1 Project Setup and Configuration

#### 5.1.1 Vite Configuration

The project was initialized using Vite's React-TypeScript template (`npm create vite@latest -- --template react-ts`). Vite was selected as the build tool for its fast development server startup using native ES modules, sub-50ms hot module replacement, and optimized production builds using Rollup. The Vite configuration is minimal:

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
  resolve: {
    alias: { '@': '/src' },
  },
})
```

The `@` path alias maps to the `src/` directory, enabling clean imports such as `import { useAuth } from '@/hooks/useAuth'` instead of relative path traversals. The Tailwind CSS v4 Vite plugin integrates Tailwind's JIT compiler into the build pipeline, generating only the CSS classes actually used in the project.

#### 5.1.2 TypeScript Configuration

TypeScript is configured with strict mode enabled to maximize type safety. The configuration targets ES2023 for modern JavaScript features and uses the bundler module resolution strategy for compatibility with Vite:

```json
{
  "compilerOptions": {
    "target": "es2023",
    "module": "esnext",
    "lib": ["ES2023", "DOM"],
    "strict": true,
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src"]
}
```

Key TypeScript features used throughout the codebase include union types for role and status values, interfaces for data models, type parameters for generic components and hooks, utility types such as `Partial<T>` and `Pick<T, K>` for flexible function signatures, and type-safe database queries through the Supabase generated types.

#### 5.1.3 Package Dependencies

The project uses 18 runtime dependencies and 9 development dependencies carefully selected for their specific roles in the application architecture. All dependencies are maintained at their latest compatible versions.

**Runtime Dependencies:**

| Package | Version | Purpose |
|---|---|---|
| `@supabase/ssr` | ^0.12.0 | Supabase server-side rendering client for browser session management |
| `@supabase/supabase-js` | ^2.108.2 | Supabase JavaScript client for database, auth, storage, and real-time |
| `@tanstack/react-query` | ^5.101.2 | Server state management with caching, refetching, and optimistic updates |
| `react-router-dom` | ^7.18.0 | Client-side routing with route protection and lazy loading |
| `react-hook-form` | ^7.80.0 | Performant form management with uncontrolled inputs |
| `zod` | ^4.4.3 | Schema validation with TypeScript type inference |
| `@hookform/resolvers` | ^5.4.0 | Integration between React Hook Form and Zod |
| `i18next` | ^26.3.3 | Internationalization framework with translation management |
| `react-i18next` | ^17.0.8 | React bindings for i18next |
| `tailwind-merge` | ^3.6.0 | Intelligent Tailwind CSS class merging without conflicts |
| `clsx` | ^2.1.1 | Conditional class name construction |
| `class-variance-authority` | ^0.7.1 | Component variant management for design system |
| `lucide-react` | ^1.22.0 | Consistent, tree-shakeable icon library |
| `radix-ui` | Latest | Unstyled accessible UI primitives |
| `recharts` | ^3.9.0 | React-native chart components for analytics |
| `leaflet` + `react-leaflet` | Latest | Open-source map display for property locations |
| `date-fns` | ^4.4.0 | Date manipulation and formatting |
| `framer-motion` | ^12.42.0 | Declarative animations and page transitions |
| `react-hot-toast` | ^2.6.0 | Toast notification system |
| `jspdf` + `jspdf-autotable` | Latest | Client-side PDF document generation |
| `react-dropzone` | ^15.0.0 | File upload with drag-and-drop support |

### 5.2 Frontend Implementation

#### 5.2.1 Authentication System

The authentication system is implemented through a combination of Supabase Auth for backend authentication and a React context with a custom hook for frontend state management.

The `useAuth` custom hook (`src/hooks/useAuth.ts`) wraps the Supabase auth client and provides a React-friendly interface. It manages:

- **Session Initialization:** On component mount, the hook calls `supabase.auth.getSession()` to restore any existing session from cookies. This ensures that authenticated state persists across page reloads.

- **Auth State Listener:** The hook subscribes to `supabase.auth.onAuthStateChange()` events, which fire when the user signs in, signs out, or when the session is refreshed. The listener updates the `user` state and fetches the corresponding profile from the `profiles` table.

- **Profile Loading:** When the auth state changes to authenticated, the hook fetches the user's profile from the database using the `profileApi.get()` method. The profile is stored in state and provided to all consuming components.

- **Loading State:** The hook tracks both the auth initialization state and the profile loading state, returning a single `loading` boolean that components can use to show loading indicators.

The application entry point (`src/main.tsx`) imports the i18n configuration and renders the root component:

```typescript
// src/main.tsx
import { createRoot } from 'react-dom/client'
import App from './App'
import './style.css'
import './i18n'

createRoot(document.getElementById('app')!).render(<App />)
```

The root `App` component (`src/App.tsx`) sets up the QueryClientProvider for server state management, the BrowserRouter for client-side routing, and the Toaster for toast notifications. All routing logic is encapsulated in the `AppRoutes` component, which handles admin subdomain redirection through the `AdminRedirect` component.

#### 5.2.2 Public Pages

The public-facing pages are wrapped in the `PublicLayout` component, which provides a consistent structure with the Header, main content area, and Footer.

**HomePage:** The landing page features a hero section with a search bar, featured properties grid, platform statistics counters, and call-to-action sections. The hero background can be customized through the super admin settings (hero background image). The featured properties section queries for properties marked as `is_featured: true` with status `published`.

**PropertiesPage:** This page displays available properties in a responsive grid layout. Key implementation details include:

- **Search and Filtering:** The filter panel includes cascading location dropdowns for province, district, and sector; price range inputs (min/max); bedroom count selector; property type selector; and amenity checkboxes. Filters are applied as URL search parameters, enabling shareable filtered search links. TanStack Query automatically refreshes the property list when filter values change.
- **Property Cards:** Each property card displays the first image, title, location, price, bedroom/bathroom counts, average rating, and a favorite button. Cards use a consistent layout with hover effects and link to the property detail page.
- **Pagination:** Properties are displayed with infinite scroll or pagination controls depending on the viewport size.

**PropertyDetailPage:** The property detail view includes:

- **Image Gallery:** A full-width image gallery with navigation arrows, thumbnail strip, image counter, and keyboard navigation support. Clicking an image opens a lightbox viewer. Floor plan images are indicated with a badge.
- **Property Information:** All property details including category, type, room counts, amenities with visual indicators, furnished status, price, deposit, complete location listing, GPS coordinates map view, and description.
- **Owner Information:** Owner profile card with name, avatar, join date, and contact options (message, WhatsApp).
- **Review Section:** Aggregate rating display with star visualization and count. Individual reviews listed with user names, ratings, dates, and comments. Authenticated tenants can submit their own reviews.
- **Booking Section:** For tenant users, a "Book Now" button opens the booking form with date selection, message input, and overlap detection.

#### 5.2.3 Property Listing and Detail Pages

Property management for owners is implemented through several components:

**AddPropertyPage:** A comprehensive form with sections for:
- Basic information (title, description, category, property type)
- Room configuration (bedrooms, bathrooms, kitchen)
- Amenity toggles (eight fixed amenities as boolean switches)
- Furnished status
- Pricing (monthly rent, deposit amount)
- Location selection (cascading dropdowns for province, district, sector, cell, village)
- GPS coordinates (optional, with map picker)
- WhatsApp contact number
- Image upload (multiple images with drag-and-drop, sort order, floor plan designation)
- Video URL input

The form uses React Hook Form with a Zod schema for validation. Images are uploaded to Supabase Storage immediately when selected, and the returned URLs are stored in the property record. The form supports saving properties as draft without publishing.

**EditPropertyPage:** Reuses the same form component as AddPropertyPage, pre-populated with existing property data. The page fetches the property by ID from the URL parameter and populates the form fields using the `reset()` method from React Hook Form.

**OwnerProperties:** Displays all properties owned by the current user in a table/card view with status badges, view counts, booking counts, and action buttons (edit, delete, change status). Owners can manage the property status workflow: draft to pending_approval, published to rented/sold.

#### 5.2.4 Booking System

The booking system implements a five-status workflow with date management and owner response capabilities.

**BookingForm:** The booking creation form includes:
- Date pickers for check-in and check-out dates using native HTML date inputs
- A message text area for the tenant to describe their interest
- Overlap detection: before submission, the system queries existing bookings for the property that have status "pending" or "approved" and checks if any overlap with the requested dates
- Booking creation via `bookingApi.create()` with the authenticated user's ID as tenant and the property owner's ID

**OwnerBookingView:** The owner's booking management interface groups booking requests by property with summary statistics (pending count, approved count, new requests). Each booking displays the tenant's name, profile picture, message, requested dates, and status. The response dialog provides approve/reject buttons with an optional reply message field. Status changes trigger audit logging and notification creation.

**TenantBookingView:** The tenant's booking interface shows their booking history with property details, current status, and action buttons appropriate to each status (e.g., "Pay Now" for approved bookings, "Cancel" for pending bookings).

#### 5.2.5 Real-Time Messaging

The messaging system provides instant communication between platform users using Supabase Realtime subscriptions.

**Conversation Management:** Messages are grouped into conversations between two users. The `MessagesPage` retrieves all messages involving the current user and organizes them into conversations. Messages of the same user pair are displayed as a conversation thread. The conversation sidebar shows the most recent message preview, timestamp, and unread count for each conversation.

**Real-Time Delivery:** A Supabase Realtime subscription listens for changes on the `messages` table:

```typescript
const subscription = supabase
  .channel(`messages:${userId}`)
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'messages',
      filter: `receiver_id=eq.${userId}` },
    (payload) => { handleNewMessage(payload.new as Message) }
  )
  .subscribe()
```

When a new message is received, it's added to the current conversation. Messages are automatically marked as read when the recipient opens the conversation, updating the `is_read` flag in the database.

**Message Features:**
- **Sending:** Users type messages in an input field and press Enter or click Send. Messages are inserted into the database and synchronized in real-time.
- **Editing:** Users can edit their own messages within a time window by clicking an edit icon, which replaces the message display with an inline edit field.
- **Deletion:** Users can delete their own messages with a confirmation dialog. Deletion removes the message from the database and the UI.
- **Read Receipts:** Sent messages display a clock icon initially, transitioning to a double-check mark when the recipient has read the message (is_read = true).
- **Deep Linking:** From a property detail page, clicking "Send Message" opens the Messages page with a pre-filled conversation targeting the property owner, including a pre-populated message about the property.

#### 5.2.6 Payment Processing

The payment module implements a complete payment flow with simulated payment processing.

**PaymentDialog:** The dialog displays a payment summary with rent amount, deposit amount, and total in Rwandan Francs. Users select from three payment methods:
- MTN MoMo: requires entering an MTN phone number
- Airtel Money: requires entering an Airtel phone number
- Card: requires entering card number, expiry date (MM/YY), and CVV

Upon confirmation, the dialog enters a processing state with animated status messages:
1. "Initializing payment..." (2 seconds)
2. "Processing payment..." (2 seconds)
3. "Verifying transaction..." (2 seconds)
4. "Payment successful!" (final state)

After the processing animation completes, the system:
1. Creates a payment record with a unique transaction ID generated using `Math.random().toString(36).substring(2, 15)`
2. Updates the associated booking status from "approved" to "completed"
3. Sends notifications to both the tenant (payer) and owner (payee)
4. Triggers email notifications via edge functions

The payment history page displays all payments for the current user, showing amount, method, status, transaction ID, and associated booking/property details.

#### 5.2.7 Role-Based Dashboards

Each user role has a tailored dashboard with relevant KPIs and quick actions.

**Tenant Dashboard:** Displays:
- Welcome message with the user's name
- KPI cards: Active bookings count, saved properties count, unread messages count
- Quick action buttons: Browse Properties, My Bookings, My Favorites, Messages

**Owner Dashboard:** Displays:
- KPI cards: Total properties count, active bookings count, monthly earnings total, average property rating
- Quick action buttons: Add Property, Manage Properties, View Bookings, View Earnings

**Admin Dashboard:** Displays:
- KPI cards: Total users count, total properties count, total bookings count, total views count, total revenue, pending properties count, open complaints count
- Platform overview section with recent activity summary
- Quick action buttons: Manage Users, View Reports, Manage Complaints

**Super Admin Dashboard:** Same as admin dashboard plus:
- Activity log access link
- Platform settings link (with CMS management)
- Full system oversight metrics

All dashboards use the `KpiCard` component that displays an icon, label, value, and optional trend indicator. Dashboard data is fetched using TanStack Query with appropriate caching strategies (e.g., shorter stale time for dashboards to keep KPIs current).

#### 5.2.8 Admin User Management

The `AdminUsers` component provides a full user management interface for administrators and super administrators:

- **User Table:** A paginated, searchable table displaying all platform users with columns for name, email, role, verification status, suspension status, and join date.
- **Role Management:** A dropdown for changing user roles, with the `super_admin` option conditionally hidden for non-super_admin users. Role changes trigger audit log entries.
- **Account Suspension:** Administrators can suspend or reinstate user accounts with confirmation dialogs. Suspended users cannot log in or access the platform.
- **Identity Verification:** Administrators can toggle the `is_verified` flag for user accounts, providing a badge of trust on user profiles.
- **Account Deletion:** Super administrators can delete user accounts via a Supabase Edge Function that removes the user from `auth.users` with cascading deletion of associated data.

#### 5.2.9 Super Admin Settings and CMS

The `SuperAdminSettings` component provides three sections for platform configuration:

**General Settings:** Editable fields for platform name, support email, phone number, and address. Changes are saved to the `settings` table and immediately reflected across the platform.

**Branding:** Upload controls for logo, favicon, and hero background image. Uploads are stored in Supabase Storage and the URLs are saved to settings. A live preview shows how the branding changes will appear.

**Pages (CMS):** A content management system for dynamic pages. Administrators can:
- View a list of existing CMS pages with their slugs, titles, and publish status
- Create new pages with slug, title, content, meta title, and meta description fields
- Edit existing pages with the same fields
- Toggle pages between published and draft status
- Delete pages with confirmation

CMS pages are rendered at their slug-based routes (e.g., `/about`, `/terms`, `/privacy`, `/faq`) using the `CmsPage` component, which fetches the page by slug and renders its content.

#### 5.2.10 UI Component Library

The reusable UI component library in `src/components/ui/` provides consistent, accessible primitives used throughout the application. Key components include:

**Button:** The button component uses `class-variance-authority` to manage variants:

```typescript
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-primary-500 text-white hover:bg-primary-600',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        outline: 'border border-gray-300 bg-transparent hover:bg-gray-50',
        ghost: 'text-gray-700 hover:bg-gray-100',
        danger: 'bg-danger text-white hover:bg-red-600',
        link: 'text-primary-600 underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
)
```

**Dialog:** The dialog component wraps Radix UI's Dialog primitive with styled overlay, content, title, description, and close button. It supports controlled open/close state and keyboard dismissal (Escape key).

**Card:** The card component provides a consistent container with padding, border, shadow, and optional interactive states (hover effects, clickable cursor).

**Badge:** The badge component displays status indicators with color coding: pending (yellow/amber), approved/active (green), rejected/suspended (red), completed/published (blue), draft (gray).

**Input:** The input component combines a label, text input with icon slot, and error message display. It integrates with React Hook Form for validation state.

### 5.3 Backend Implementation

#### 5.3.1 Database Schema Creation

The core database schema is defined in migration `00001_schema.sql`, which creates 17 tables with complete column definitions, constraints, defaults, and indexes. The schema is applied using `supabase migration up`, which executes pending migration files against the database.

Key schema design decisions include:

- **UUID Primary Keys:** All tables use UUID primary keys generated by `gen_random_uuid()`, providing security through non-sequential identifiers and supporting distributed ID generation.
- **Check Constraints:** Status fields use check constraints to enforce valid values at the database level, preventing invalid data even if application-level validation is bypassed: `check (status in ('pending', 'approved', 'rejected', 'cancelled', 'completed'))`.
- **Cascade Deletes:** Foreign key constraints use `on delete cascade` to automatically clean up related records when a parent record is deleted, maintaining referential integrity without orphaned data.
- **Timestamps:** All tables include `created_at` and optionally `updated_at` timestamp columns with `default now()` for automatic creation time recording.
- **Unique Constraints:** The `reviews` table enforces `unique(property_id, user_id)` to prevent duplicate reviews. The `favorites` table enforces `unique(user_id, property_id)` similarly. The `cms_pages` table enforces `unique(slug)` for URL uniqueness.
- **Numeric Types:** Monetary values use `numeric(12, 0)` to store integer Rwandan Francs with zero decimal places, avoiding floating-point precision issues.

#### 5.3.2 Row-Level Security Policies

RLS policies are defined in the initial migration and refined through subsequent migrations. The policies implement a consistent access control model across all tables:

**Public Read Access:** Tables containing public information (profiles, published properties, reviews) have select policies that allow unrestricted reads. This enables anonymous browsing of property listings without authentication.

**Owner Access:** Users can read, update, and delete their own data. The `auth.uid()` function returns the authenticated user's ID, which is compared against the owner column (e.g., `owner_id`, `user_id`, `tenant_id`).

**Administrator Access:** Admin and super_admin roles have elevated privileges on most tables. The common pattern uses a subquery to check the user's role:

```sql
exists (select 1 from profiles where user_id = auth.uid()
  and role in ('admin', 'super_admin'))
```

**Role-Specific Insert Policies:** Insert policies restrict who can create records in each table. For example, only the tenant identified by `tenant_id` can create a booking, and only the identified sender can create a message.

The RLS policy design ensures that even if a malicious actor bypasses frontend route protection or makes direct API calls to Supabase, they cannot access data they are not authorized to see.

#### 5.3.3 Database Triggers and Functions

**Profile Creation Trigger:** The `handle_new_user` function is triggered after insert on `auth.users`. It creates a corresponding profile record with the user's ID, email, and optional metadata (full name, role). This ensures that every authenticated user automatically has a profile:

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, user_id, full_name, email, role)
  values (
    new.id,
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'role', 'tenant')
  );
  return new;
end;
$$;
```

**View Count Function:** The `increment_property_views` function increases the `views_count` column on a property by one. This function is called via `supabase.rpc()` from the property detail page when a user views a property:

```sql
-- Defined in migration 00007_increment_property_views.sql
create or replace function increment_property_views(property_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update properties
  set views_count = views_count + 1
  where id = property_id;
end;
$$;
```

#### 5.3.4 Edge Functions

Nine Supabase Edge Functions provide server-side processing capabilities. Each function follows a consistent architecture:

1. Handler function receives the HTTP request
2. CORS headers are set for cross-origin access
3. Request body is validated
4. Business logic executes using the service role client
5. JSON response is returned

**send-email Function:** This is the core email sending function used by other functions. It connects to an SMTP server (configured via environment variables) and sends HTML-formatted emails:

```typescript
// supabase/functions/_shared/smtp.ts
import { SmtpClient } from 'https://deno.land/x/smtp/mod.ts'

const client = new SmtpClient()

export async function sendEmail(to: string, subject: string, html: string) {
  await client.connect({
    hostname: Deno.env.get('SMTP_HOST')!,
    port: parseInt(Deno.env.get('SMTP_PORT')!),
    username: Deno.env.get('SMTP_USERNAME')!,
    password: Deno.env.get('SMTP_PASSWORD')!,
  })
  await client.send({
    from: Deno.env.get('SMTP_FROM')!,
    to,
    subject,
    content: html,
    html,
  })
  await client.close()
}
```

**welcome-email Function:** Triggered after user registration, sends a welcome email with platform introduction and getting started instructions.

**booking-notification Function:** Triggered when a booking is created or updated, notifies the property owner of new booking requests or status changes.

**message-notification Function:** Sends email notification to the message recipient when a new message is received.

**delete-user Function:** Deletes a user from `auth.users` with cascading cleanup of their data. This function requires elevated privileges (service role) to delete from the auth schema.

#### 5.3.5 Database Migrations

The complete database evolution is captured in 20 numbered migration files. Each migration represents a single logical change:

- **00001:** Initial schema with all core tables, indexes, RLS policies, and the profile creation trigger
- **00002:** Seed data and foreign key fixes
- **00003-00006:** RLS policy refinements for specific tables
- **00007:** View count database function
- **00008:** Email logging table for tracking email delivery
- **00009:** Admin profile update policy (allowing admins to update any profile)
- **00010:** Public read policy for settings
- **00011-00012:** Notification insert policy and foreign key fix
- **00013-00014:** Booking schema additions (reply_message, check_in/check_out dates)
- **00015-00018:** Additional RLS policies for audit logs, notifications, and settings
- **00019-00020:** Storage bucket configuration and final RLS policy additions

### 5.4 Multi-Language Implementation

#### 5.4.1 i18n Configuration

Internationalization is implemented using i18next with react-i18next bindings. The configuration supports four languages with English as the source of truth and automatic fallback for missing translations:

```typescript
// src/i18n/index.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import rw from './locales/rw.json'
import fr from './locales/fr.json'
import sw from './locales/sw.json'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    rw: { translation: rw },
    fr: { translation: fr },
    sw: { translation: sw },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})
```

The `interpolation.escapeValue: false` setting is safe because React already escapes values in JSX. Language detection from browser preferences could be added in future iterations.

#### 5.4.2 Translation Management

Translations are stored as JSON files in `src/i18n/locales/`. The English file (`en.json`) serves as the source of truth with 806 lines of translation keys. The other languages have 756 lines each, covering the same set of keys with the exception of approximately 50 keys that have not yet been translated.

**Table 5.1: Translation Coverage by Language**

| Language | File | Keys | Status |
|---|---|---|---|
| English | en.json | 654+ | Source of truth (complete) |
| Kinyarwanda | rw.json | 446 | Partial coverage |
| French | fr.json | 446 | Partial coverage |
| Swahili | sw.json | 446 | Partial coverage |

Missing translations in non-English languages fall back to English automatically through i18next's fallback chain. This ensures that the UI is always fully readable even when translations are incomplete.

Translation keys are organized by feature area and follow a hierarchical naming convention:

```json
{
  "app_name": "Rwanda EasyRent",
  "auth": {
    "login": "Login",
    "register": "Register",
    "logout": "Logout",
    "forgot_password": "Forgot Password"
  },
  "property": {
    "title": "Property Details",
    "bedrooms": "Bedrooms",
    "price": "Price",
    "location": "Location"
  }
}
```

#### 5.4.3 Language Switching

Language switching is implemented in the `Header` component using a dropdown selector. When a user selects a different language, the `i18n.changeLanguage()` method updates the active language and all translated UI elements update immediately:

```typescript
const { t, i18n } = useTranslation()

const changeLanguage = (lng: string) => {
  i18n.changeLanguage(lng)
}
```

Each page and component uses the `useTranslation` hook to access translated strings:

```typescript
const { t } = useTranslation()
// Usage: {t('property.bedrooms')} instead of "Bedrooms"
```

Date and time formatting respects the selected locale. The `i18n.language` value is used to select the appropriate locale for formatting functions:

```typescript
new Date(message.created_at).toLocaleDateString(i18n.language === 'rw' ? 'en-US' : i18n.language, {
  month: 'short',
  day: 'numeric',
})
```

### 5.5 File Upload and Storage

File uploads for property images, floor plans, videos, avatars, and contract documents are handled through Supabase Storage. The storage system provides:

- **File Upload:** Files are uploaded using `supabase.storage.from(bucket).upload()` with automatic content type detection and unique file paths using UUIDs.
- **Public URLs:** Uploaded files are stored in public buckets and accessed through CDN-backed URLs. Property images are served through Supabase's image transformation API for resize optimization.
- **File Management:** Uploaded files can be deleted when properties are updated or removed, ensuring storage is not consumed by orphaned files.

The upload flow in the `AddPropertyPage` uses `react-dropzone` for drag-and-drop file selection:

```typescript
const onDrop = async (acceptedFiles: File[]) => {
  for (const file of acceptedFiles) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${uuid()}.${fileExt}`
    const { data, error } = await supabase.storage
      .from('property-images')
      .upload(fileName, file)
    if (error) throw error
    const { data: { publicUrl } } = supabase.storage
      .from('property-images')
      .getPublicUrl(fileName)
    setImages(prev => [...prev, { url: publicUrl, is_floor_plan: false, sort_order: prev.length }])
  }
}
```

### 5.6 Deployment Configuration

#### 5.6.1 Vercel Configuration

The application is deployed on Vercel's global edge network. Vercel automatically detects the Vite framework and configures:

- **Static Asset Serving:** The built HTML, CSS, and JavaScript files are served from Vercel's CDN with edge caching headers.
- **Client-Side Routing:** A rewrite rule ensures that all routes serve the `index.html` file, enabling the SPA router to handle navigation.
- **HTTPS:** Automatic SSL/TLS certificate provisioning and renewal via Let's Encrypt.
- **Preview Deployments:** Each pull request receives a unique preview URL for testing before merging.
- **Environment Variables:** Sensible configuration for Supabase URL, anon key, and other environment variables is managed through Vercel's environment variable interface.

#### 5.6.2 Environment Variables

The application requires the following environment variables:

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL for client connection |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key for client authentication |
| `SMTP_HOST` | SMTP server hostname for email sending |
| `SMTP_PORT` | SMTP server port |
| `SMTP_USERNAME` | SMTP authentication username |
| `SMTP_PASSWORD` | SMTP authentication password |
| `SMTP_FROM` | From address for outgoing emails |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for edge functions (server-side only) |

#### 5.6.3 CI/CD Pipeline

The continuous integration and deployment pipeline is configured through GitHub Actions. The workflow triggers on pushes to the main branch and performs the following steps:

1. Check out the repository
2. Set up Node.js with caching for faster installs
3. Install dependencies with `npm ci`
4. Run TypeScript type checking with `npx tsc --noEmit`
5. Build the production bundle with `npm run build`
6. Deploy to Vercel using the Vercel CLI or GitHub integration

The pipeline ensures that only type-safe, buildable code reaches production. Failed type checks or build errors prevent deployment, maintaining the stability of the production environment. Preview deployments for pull requests enable testing of new features in isolation before merging to the main branch.

**Build Command:** The `npm run build` script runs TypeScript compilation (`tsc`) followed by Vite's production build (`vite build`):

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

The TypeScript compilation step (`tsc`) runs type checking without emitting JavaScript (`noEmit: true` in tsconfig), catching type errors before the bundling step. The Vite build then produces optimized production assets including minified JavaScript, purged CSS, and hashed filenames for cache busting.
