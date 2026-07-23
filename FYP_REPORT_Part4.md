## Chapter 4: System Design and Architecture

### 4.1 System Architecture Overview

The Rwanda EasyRent platform follows the JAMstack (JavaScript, APIs, and Markup) architecture pattern, which decouples the frontend presentation layer from the backend data and business logic layers through API-based communication. This architectural approach was selected for its scalability, maintainability, and development efficiency characteristics that align with the project's requirements for a modern, responsive, and secure web application.

#### 4.1.1 JAMstack Architecture

The JAMstack architecture separates the application into three distinct layers that communicate through well-defined interfaces:

**Presentation Layer (JavaScript):** The frontend single-page application is built with React 19 and TypeScript, compiled and bundled by Vite into static assets (HTML, CSS, JavaScript) that are served from a global content delivery network. The frontend handles all user interface rendering, client-side routing, state management, and user interaction logic. React's component-based architecture decomposes the user interface into reusable, testable components organized by feature area. The presentation layer runs entirely in the browser and communicates with the backend exclusively through API calls and real-time subscriptions.

**API Layer:** Supabase provides the backend API layer through multiple interfaces. The Supabase client library (`@supabase/supabase-js`) provides a JavaScript SDK for database operations, authentication, storage, and real-time subscriptions. These client-side API calls are protected by row-level security policies that enforce data access rules at the database level. Custom business logic for email notifications, user deletion, and contact form processing is implemented as Supabase Edge Functions, which are serverless TypeScript functions running on the Deno runtime. These edge functions are invoked via HTTPS requests and use the Supabase service role key to perform privileged operations.

**Backend Layer (APIs and Markup):** The backend consists of Supabase's managed services including PostgreSQL database for persistent data storage with row-level security, Supabase Auth for user authentication and session management with JWT tokens, Supabase Storage for property images and document uploads with CDN distribution, and Supabase Realtime for WebSocket-based real-time data synchronization. The database schema, row-level security policies, triggers, and functions are managed through versioned SQL migration files applied via the Supabase CLI.

This architectural separation provides several advantages. The frontend can be developed and deployed independently of the backend, enabling parallel development streams. The static frontend assets are served from Vercel's global edge network with CDN caching, providing fast load times regardless of user location. The backend services are managed by Supabase with automatic scaling, backups, and high availability, eliminating the need for server management. Security is enforced at multiple layers including database-level RLS, API-level authentication, and frontend-level route protection.

#### 4.1.2 Architecture Diagram

**Figure 4.1: System Architecture Diagram**

```
+------------------------------------------------------------------+
|                        CLIENT BROWSER                             |
|  +------------------------------------------------------------+  |
|  |              React SPA (Vite + TypeScript)                  |  |
|  |  +----------+ +----------+ +----------+ +----------------+ |  |
|  |  |  Public   | |   Auth   | |Dashboard | |  UI Component | |  |
|  |  |  Pages    | |  Pages   | |  Pages   | |  Library      | |  |
|  |  +----------+ +----------+ +----------+ +----------------+ |  |
|  |  +--------------------------------------------------------+ |  |
|  |  |           TanStack Query (Server State)                | |  |
|  |  +--------------------------------------------------------+ |  |
|  |  +--------------------------------------------------------+ |  |
|  |  |           React Router (Client Navigation)             | |  |
|  |  +--------------------------------------------------------+ |  |
|  |  +--------------------------------------------------------+ |  |
|  |  |           Auth Context (useAuth Hook)                  | |  |
|  |  +--------------------------------------------------------+ |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
                          |  HTTPS / WebSocket
                          v
+------------------------------------------------------------------+
|                    SUPABASE BACKEND SERVICES                       |
|  +------------------+  +------------------+  +-----------------+  |
|  |   PostgreSQL DB  |  |  Supabase Auth   |  | Supabase        |  |
|  |   + RLS Policies |  |  (JWT + OAuth)   |  | Storage (CDN)   |  |
|  +------------------+  +------------------+  +-----------------+  |
|  +------------------+  +------------------+                       |
|  |  Supabase        |  |  Edge Functions  |                       |
|  |  Realtime (WS)   |  |  (Deno Runtime)  |                       |
|  +------------------+  +------------------+                       |
+------------------------------------------------------------------+
                          |
                          v
+------------------------------------------------------------------+
|                    EXTERNAL SERVICES                               |
|  +------------------+  +------------------+                       |
|  |  Vercel (Hosting)|  |  SMTP (Email)    |                       |
|  |  Global CDN      |  |  Notifications   |                       |
|  +------------------+  +------------------+                       |
|  +------------------+                                              |
|  |  GitHub Actions  |                                              |
|  |  CI/CD Pipeline  |                                              |
|  +------------------+                                              |
+------------------------------------------------------------------+
```

The architecture diagram illustrates the three-tier structure of the system. The client browser renders the React SPA, which communicates with Supabase backend services over HTTPS for standard API operations and WebSocket connections for real-time subscriptions. External services including Vercel for hosting, SMTP for email, and GitHub Actions for CI/CD provide supporting infrastructure.

### 4.2 Component Architecture

#### 4.2.1 Frontend Component Hierarchy

The React component hierarchy follows a feature-based organization pattern where components are grouped by their functional area rather than by type. This organization improves code discoverability and maintainability by keeping related components in close proximity.

The top-level component tree is structured as follows:

```
App (QueryClientProvider + BrowserRouter)
├── Toaster (react-hot-toast notifications)
└── AppRoutes
    ├── PublicLayout
    │   ├── Header (navigation, search, auth status, language switcher)
    │   ├── Outlet (public page content)
    │   └── Footer (links, social, newsletter)
    ├── Auth Routes (LoginPage, RegisterPage, ForgotPasswordPage, AuthCallbackPage, RoleSelectionPage)
    └── ProtectedRoute (authentication gate)
        └── DashboardLayout (role-based sidebar navigation)
            ├── DashboardHome (KPI cards per role)
            ├── BookingsPage (tenant/owner booking management)
            ├── MessagesPage (real-time chat interface)
            ├── SettingsPage (profile management)
            └── ... (role-specific pages)
```

The component hierarchy follows consistent patterns. Layout components (PublicLayout, DashboardLayout) provide structural containers with shared elements such as headers, navigation, and footers. Page components represent complete views with specific functionality. UI components are reusable primitives such as buttons, cards, dialogs, and inputs. Feature components encapsulate complex functionality such as the booking calendar, payment dialog, and messaging interface.

#### 4.2.2 Directory Structure

The frontend source code is organized under the `src/` directory with the following structure:

```
src/
├── components/
│   ├── layout/          # Layout components (PublicLayout, DashboardLayout, Header, Footer, ProtectedRoute)
│   ├── ui/              # Reusable UI primitives (Button, Card, Dialog, Input, Badge, Avatar, etc.)
│   ├── properties/      # Property-related components (PropertyCard, PropertyGallery, PropertyFilters)
│   ├── bookings/        # Booking components (BookingForm, BookingList, BookingDialog)
│   ├── messages/        # Messaging components (ConversationSidebar, MessageThread, MessageInput)
│   ├── payments/        # Payment components (PaymentDialog, PaymentMethodSelector)
│   ├── reviews/         # Review components (ReviewForm, ReviewList, StarRating)
│   └── dashboard/       # Dashboard-specific components (KpiCard, Charts, StatsGrid)
├── hooks/               # Custom React hooks (useAuth, useProperties, useBookings, useMessages)
├── lib/                 # Utility libraries (supabase client, API layer, utils, audit logging)
├── pages/
│   ├── public/          # Public-facing pages (Home, Properties, PropertyDetail, About, Contact, etc.)
│   ├── auth/            # Authentication pages (Login, Register, ForgotPassword, AuthCallback, RoleSelection)
│   └── dashboard/       # Dashboard pages
│       ├── tenant/      # Tenant-specific pages (Favorites)
│       ├── owner/       # Owner-specific pages (Properties, Earnings, AddProperty, EditProperty)
│       └── admin/       # Admin pages (Users, Reports)
├── i18n/
│   └── locales/         # Translation JSON files (en.json, rw.json, fr.json, sw.json)
├── types/               # TypeScript type definitions (index.ts, supabase.ts)
├── App.tsx              # Root component with routing configuration
├── main.tsx             # Application entry point
└── style.css            # Global styles with Tailwind CSS v4 configuration
```

This directory structure separates concerns by feature area while maintaining consistent architectural patterns. The UI component library in `components/ui/` follows the atomic design principle, providing a shared set of primitives used throughout the application. Feature components in `components/properties/`, `components/bookings/`, etc., compose these primitives into domain-specific components. Page components in `pages/` assemble feature components into complete, routable views.

#### 4.2.3 State Management

The application uses a layered state management approach combining React Context for global state, TanStack Query for server state management, and local component state for UI state.

**Authentication State:** The `useAuth` hook manages authentication state globally using React Context. It subscribes to Supabase auth state changes via the `onAuthStateChange` listener and provides the current user object, profile data, loading state, and authentication methods to all components. The auth context is initialized in the `AppRoutes` component and consumed by `ProtectedRoute` for access control and by individual pages for user-specific features.

**Server State:** TanStack Query (React Query) manages all server state including properties, bookings, messages, reviews, and user data. Each data type has a custom hook (e.g., `useProperties`, `useBookings`, `useMessages`) that encapsulates query configuration, caching strategy, stale time, and refetch behavior. TanStack Query provides automatic background refetching, cache invalidation, optimistic updates, and loading/error state management. The query client is configured at the application root in `App.tsx` and made available to all components through the `QueryClientProvider`.

**Local State:** Component-specific UI state such as dialog visibility, form input values, filter selections, and dropdown open state is managed using React's `useState` and `useReducer` hooks within individual components. This local state is scoped to the component and does not need to be shared globally, following React's principle of keeping state as close as possible to where it is used.

**Real-Time State:** Real-time messaging and notification state is managed through Supabase Realtime subscriptions established in the `MessagesPage`, `DashboardLayout`, and `NotificationsPage` components. These subscriptions listen for database changes on the `messages` and `notifications` tables and update local state when new data arrives, providing instant updates without polling.

### 4.3 Database Design

The database design follows relational database principles using PostgreSQL, which was selected for its advanced feature set including row-level security, JSONB data type, full-text search, window functions, and strong consistency guarantees. The schema comprises 17 tables that model the complete rental domain.

#### 4.3.1 Entity Relationship Diagram

**Figure 4.3: Database Entity Relationship Diagram**

The database schema is centered around five core entities: Profiles (users), Properties (rental listings), Bookings (rental requests), Payments (financial transactions), and Messages (communications). Supporting entities include property images and videos, amenities, reviews, favorites, notifications, maintenance requests, complaints, contracts, CMS pages, and platform settings.

The relationships between entities are as follows:

- **Profiles** has a one-to-one relationship with `auth.users` through the `id` and `user_id` columns, both referencing `auth.users(id)`. Each profile belongs to a single user account.

- **Properties** has a many-to-one relationship with Profiles through `owner_id`, which references `profiles(id)`. Each property belongs to a single owner, and each owner can have multiple properties.

- **Properties** has one-to-many relationships with Property Images, Property Videos, Amenities, Reviews, and Favorites. Each property can have multiple images, videos, custom amenities, reviews, and favorite marks.

- **Bookings** has a many-to-one relationship with Properties through `property_id`, with Profiles (as tenant) through `tenant_id`, and with Profiles (as owner) through `owner_id`. Each booking connects a tenant's rental request to a specific property and involves both the tenant and the property owner.

- **Payments** has a many-to-one relationship with Bookings through `booking_id`, with Profiles (as payer) through `payer_id`, and with Profiles (as payee) through `payee_id`. Each payment is associated with a specific booking and tracks both the payer and the recipient.

- **Messages** has many-to-one relationships with Profiles through `sender_id` and `receiver_id`, and an optional relationship with Properties through `property_id`. Each message is sent from one user to another, optionally in the context of a specific property.

- **Notifications** has a many-to-one relationship with Profiles through `user_id`. Each notification is targeted at a specific user.

#### 4.3.2 Table Schemas

The database consists of 19 tables in total. The core tables are described below with their columns, types, constraints, and purposes.

**Table 4.1: Database Tables Overview**

| Table Name | Purpose | Row Count Estimate | Key Columns |
|---|---|---|---|
| profiles | User profile data extending auth.users | User count | id, user_id, full_name, email, role, is_verified, is_suspended |
| properties | Property listings with details and location | Property count | id, owner_id, title, price, status, province through village |
| property_images | Property image URLs with ordering | Image count | id, property_id, url, is_floor_plan, sort_order |
| property_videos | Property video URLs | Video count | id, property_id, url |
| amenities | Custom amenity names per property | Amenity count | id, property_id, name |
| bookings | Rental booking requests and status | Booking count | id, property_id, tenant_id, owner_id, status, check_in, check_out |
| payments | Payment transactions | Payment count | id, booking_id, payer_id, payee_id, amount, method, status |
| reviews | Property ratings and comments | Review count | id, property_id, user_id, rating, comment |
| favorites | User property saves | Favorite count | id, user_id, property_id |
| messages | User-to-user communications | Message count | id, sender_id, receiver_id, property_id, content, is_read |
| notifications | In-app notifications | Notification count | id, user_id, title, body, type, is_read |
| maintenance_requests | Property maintenance issues | Maintenance count | id, property_id, tenant_id, title, priority, status |
| complaints | User complaints | Complaint count | id, user_id, subject, status |
| contracts | Rental agreement records | Contract count | id, booking_id, tenant_id, owner_id, start_date, end_date, status |
| cms_pages | Dynamic content pages | CMS page count | id, slug, title, content, is_published |
| settings | Platform configuration key-value pairs | Setting count | id, key, value |
| newsletters | Newsletter subscriber emails | Subscriber count | id, email, is_active |
| audit_logs | Critical action audit trail | Log count | id, user_id, action, entity_type, entity_id, details |
| email_logs | Email delivery tracking | Email count | id, recipient, subject, status |

The `profiles` table serves as the extension of Supabase Auth's `auth.users` table and stores user-specific data that is not part of the authentication system. Each user has exactly one profile record, created automatically by a database trigger (`handle_new_user`) when a new user signs up. The `role` column uses a check constraint to enforce valid role values: `super_admin`, `admin`, `owner`, `tenant`, and `agent`. The `is_verified` and `is_suspended` flags enable administrative control over user accounts.

The `properties` table is the most complex table in the schema, with 32 columns covering property details, location, pricing, amenities (as boolean columns), and status management. The `category` column supports three values (Rent, Sale, Short-term) and the `property_type` column supports six values (House, Apartment, Villa, Cottage, Studio, Commercial). The location columns follow Rwanda's five-level administrative hierarchy: province, district, sector, cell, and village. The `status` column implements a six-state workflow: draft, pending_approval, published, rejected, sold, and rented. Boolean columns for amenities (parking, balcony, garden, swimming_pool, security, internet, water, electricity) provide fixed amenity flags, while the separate `amenities` table allows for custom amenity additions.

The `bookings` table implements the five-status booking workflow (pending, approved, rejected, cancelled, completed) with columns for tenant and owner identification, optional check-in and check-out dates, and message exchange fields. The `message` column stores the tenant's initial booking message, while `reply_message` stores the owner's response.

#### 4.3.3 Indexes and Performance Optimization

The schema includes 15 indexes designed to optimize query performance for the most frequent access patterns:

```sql
create index idx_properties_status on properties(status);
create index idx_properties_owner on properties(owner_id);
create index idx_properties_location on properties(province, district);
create index idx_bookings_tenant on bookings(tenant_id);
create index idx_bookings_owner on bookings(owner_id);
create index idx_bookings_property on bookings(property_id);
create index idx_bookings_status on bookings(status);
create index idx_messages_sender on messages(sender_id);
create index idx_messages_receiver on messages(receiver_id);
create index idx_notifications_user on notifications(user_id);
create index idx_favorites_user on favorites(user_id);
create index idx_reviews_property on reviews(property_id);
create index idx_payments_payer on payments(payer_id);
create index idx_payments_payee on payments(payee_id);
```

The `idx_properties_status` index accelerates the most common property query pattern: filtering published properties for public browsing. The `idx_properties_location` composite index on (province, district) optimizes location-based filtering, which is the primary search axis. The `idx_bookings_tenant`, `idx_bookings_owner`, and `idx_bookings_property` indexes support the three main booking query patterns: a tenant viewing their bookings, an owner viewing requests for their properties, and a property detail page showing existing bookings. The `idx_messages_sender` and `idx_messages_receiver` indexes support the messaging system's primary query: retrieving conversations involving a specific user.

#### 4.3.4 Database Migration Strategy

Database schema changes are managed through versioned SQL migration files applied using the Supabase CLI (`supabase migration` commands). Each migration file is numbered sequentially with a descriptive name indicating its purpose:

```
00001_schema.sql                - Core schema (17 tables, indexes, RLS, trigger)
00002_fix_properties_fk.sql     - Foreign key correction for properties
00002_seed.sql                  - Seed data for initial deployment
00003_settings_rls.sql          - RLS policies for settings table
00004_locations_table.sql       - Location reference data table
00005_property_images_rls.sql   - RLS policies for property images
00006_cms_and_settings_rls.sql  - RLS policies for CMS and settings
00007_increment_property_views.sql - Database function for view counting
00008_email_logs.sql            - Email logging table
00009_admin_profiles_rls.sql    - Admin profile update policy
00010_public_settings_select.sql - Public settings read policy
00011_notifications_insert_policy.sql - Notification insert policy
00012_fix_notifications_fk.sql  - Foreign key fix for notifications
00013_add_bookings_reply_message.sql - Reply message field for bookings
00014_add_booking_dates.sql     - Check-in/check-out date fields
00015_audit_logs_rls.sql        - RLS policies for audit logs
00016_missing_rls_policies.sql  - Additional missing RLS policy fixes
00017_update_contact_settings.sql - Contact settings update
00018_notifications_delete_policy.sql - Notification delete policy
00019_avatars_storage_bucket.sql - Storage bucket for avatars
00020_missing_rls_policies.sql  - Final RLS policy additions
```

The migration numbering scheme accommodates insertions between existing migrations (e.g., `00002_fix_properties_fk.sql` and `00002_seed.sql` both at number 2, applied in alphabetical order). Each migration is atomic and represents a single logical change to the database schema. This approach provides a complete version history of the database schema, enables rollback to any previous state, and supports consistent application across development, staging, and production environments.

### 4.4 Security Architecture

Security is implemented through a defense-in-depth approach with multiple layers of protection: authentication at the application entry point, authorization at the route level, access control at the database level through row-level security policies, and input validation at the form level.

#### 4.4.1 Authentication Strategy

Authentication is handled by Supabase Auth, which provides a comprehensive authentication system built on industry-standard protocols. The system supports two authentication methods:

**Email and Password Authentication:** Users register with an email address and password. Passwords are hashed using bcrypt with a salt factor of 10 before storage. Sessions are managed using JSON Web Tokens (JWT) with a configurable expiry period of one hour and automatic token refresh. The `@supabase/ssr` client library handles session persistence across page reloads by storing session data in browser cookies. The `useAuth` custom hook wraps the Supabase auth client and provides a React-friendly interface:

```typescript
// src/lib/supabase.ts - Supabase client initialization
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
```

**Google OAuth:** Users can authenticate using their Google account through OAuth 2.0. The OAuth flow redirects users to Google's consent screen, and after authorization, Google redirects back to the application with an authorization code that Supabase exchanges for session tokens. The `AuthCallbackPage` handles the OAuth redirect callback and creates or links the user's profile. New OAuth users are redirected to the `RoleSelectionPage` to choose their platform role before accessing the dashboard.

The authentication system includes a complete password reset flow. Users request a password reset by entering their email address on the `ForgotPasswordPage`. Supabase sends a password reset email with a secure, time-limited token link. Clicking the link redirects to the application where the user can set a new password. The entire flow is handled by Supabase Auth without exposing password reset tokens to the client application.

#### 4.4.2 Authorization and RBAC

Authorization is implemented at two levels: frontend route protection and backend database policies.

**Frontend Route Protection:** The `ProtectedRoute` component acts as a gatekeeper for all dashboard routes. It checks three conditions in sequence:

```typescript
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/auth/login" replace />
  if (allowedRoles && profile && !allowedRoles.includes(profile.role))
    return <Navigate to="/dashboard" replace />

  return <Outlet />
}
```

Route protection is configured in the route definition in `App.tsx`. Routes that require specific roles use nested `ProtectedRoute` elements:

```typescript
<Route element={<ProtectedRoute />}>
  <Route element={<DashboardLayout />}>
    <Route path="/dashboard/users" element={<AdminUsers />} />
    <Route element={<ProtectedRoute allowedRoles={['admin', 'super_admin']} />}>
      <Route path="/dashboard/users" element={<AdminUsers />} />
      <Route path="/dashboard/reports" element={<AdminReports />} />
    </Route>
    <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
      <Route path="/dashboard/activity-logs" element={<ActivityLogsPage />} />
    </Route>
  </Route>
</Route>
```

The role-based dashboard navigation is configured through role-specific navigation arrays in `DashboardLayout.tsx`. The `tenantNav`, `ownerNav`, `adminNav`, and `superAdminNav` arrays define which navigation items are visible to each role, with items conditionally rendered based on the user's role.

**Role Hierarchy and Privileges:** The five roles have the following privileges:

| Role | Privileges |
|---|---|
| Super Admin | Full system access including user management, platform settings, CMS, audit logs, reports, and all data |
| Admin | User management, property moderation, reports, complaints management, booking oversight, and all data |
| Property Owner | Property CRUD, booking management, earnings tracking, maintenance request management |
| Tenant | Property browsing, booking creation, messaging, reviews, favorites, maintenance requests |
| Agent | Same as owner, with additional client management features |

#### 4.4.3 Row-Level Security Policies

Row-level security (RLS) is the cornerstone of the database security architecture. RLS policies are SQL expressions that are automatically appended to every query on a table, filtering rows based on the authenticated user's identity and attributes. RLS is enabled on all 17 application tables, ensuring that data access rules are enforced at the database level regardless of how the data is accessed.

**Profiles Table Policies:**

```sql
-- Everyone can view profiles (needed for displaying user names, avatars)
create policy "Profiles are viewable by everyone"
  on profiles for select using (true);

-- Users can only update their own profile
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = user_id);
```

**Properties Table Policies:**

```sql
-- Published properties are visible to everyone; owners and admins see all their properties
create policy "Published properties are public"
  on properties for select
  using (status = 'published' or owner_id = auth.uid()
    or exists (select 1 from profiles where user_id = auth.uid()
      and role in ('admin', 'super_admin')));

-- Owners can create properties; admins can create on behalf of owners
create policy "Owners can insert properties"
  on properties for insert
  with check (owner_id = auth.uid()
    or exists (select 1 from profiles where user_id = auth.uid()
      and role in ('admin', 'super_admin')));

-- Owners and admins can update properties
create policy "Owners can update own properties"
  on properties for update
  using (owner_id = auth.uid()
    or exists (select 1 from profiles where user_id = auth.uid()
      and role in ('admin', 'super_admin')));
```

**Bookings Table Policies:**

```sql
-- Tenant, owner, and admins can view bookings
create policy "Users can view own bookings"
  on bookings for select
  using (tenant_id = auth.uid() or owner_id = auth.uid()
    or exists (select 1 from profiles where user_id = auth.uid()
      and role in ('admin', 'super_admin')));

-- Only the identified tenant can create bookings
create policy "Tenants can create bookings"
  on bookings for insert
  with check (tenant_id = auth.uid());

-- Only the property owner or admins can update booking status
create policy "Owners can update booking status"
  on bookings for update
  using (owner_id = auth.uid()
    or exists (select 1 from profiles where user_id = auth.uid()
      and role in ('admin', 'super_admin')));
```

**Messages Table Policies:**

```sql
-- Users can see only messages they sent or received
create policy "Users can view own messages"
  on messages for select
  using (sender_id = auth.uid() or receiver_id = auth.uid());

-- Users can send messages only as themselves
create policy "Users can send messages"
  on messages for insert
  with check (sender_id = auth.uid());

-- Recipients can mark messages as read
create policy "Users can mark messages as read"
  on messages for update
  using (receiver_id = auth.uid());
```

The RLS policy design follows consistent patterns throughout the schema. Select policies typically allow users to see their own data plus any public data that is necessary for the application to function (e.g., published properties are public, profile names are visible to all). Insert policies verify that the authenticated user is the entity being created (e.g., a booking's tenant_id must match the authenticated user). Update policies restrict modification to the data owner or administrators. The `exists (select 1 from profiles ...)` pattern is used to grant administrative access without hardcoding admin user IDs, relying instead on the role column in the profiles table.

#### 4.4.4 Data Protection Measures

Beyond authentication and authorization, the system implements several additional data protection measures:

**Input Validation:** All form inputs are validated using Zod schemas, which provide TypeScript-first validation with type inference. Zod schemas define the shape, types, constraints, and error messages for each form, and the `@hookform/resolvers` package integrates Zod with React Hook Form for real-time validation feedback. Validation occurs on the client side before submission and would be additionally verified on the server side in a production deployment with actual payment gateway integration.

**HTTPS Enforcement:** All communication between the client and Supabase services is encrypted using TLS/SSL. Vercel automatically provisions and renews SSL certificates for custom domains and enforces HTTPS by default, redirecting all HTTP traffic to HTTPS.

**Session Security:** JWT tokens have a one-hour expiry period and are automatically refreshed by the Supabase client before expiration. The `@supabase/ssr` library stores session data in HTTP-only cookies where possible to mitigate XSS-based session theft. Token refresh uses the refresh token, which has a longer expiry and can be rotated for enhanced security.

**Audit Logging:** Critical actions throughout the system are logged to the `audit_logs` table with timestamp, user ID, action type, entity type, entity ID, and contextual details in JSONB format. The `createAuditLog` function in `src/lib/audit.ts` is called from the API layer for actions including property creation, updates, and deletion; review creation; booking status changes; user role changes; user suspension and reinstatement; and user verification toggling. Audit logs are viewable by super administrators through the `ActivityLogsPage`.

### 4.5 User Interface Design

#### 4.5.1 Design System

The user interface follows a consistent design system built on Tailwind CSS v4 with custom theme tokens. The design system defines the visual language of the application including colors, typography, spacing, and component styles.

**Color Palette:** The primary color is sky blue (`#38BDF8`) used for interactive elements, links, and active states. The accent color is emerald green (`#10B981`) used for success states, positive indicators, and decorative elements. The full palette includes 10 shades for each color from 50 (lightest) to 950 (darkest), providing sufficient contrast variation for text, backgrounds, borders, and hover states. Additional semantic colors include success (green), warning (yellow), and danger (red) for status indicators and alerts.

```css
/* src/style.css - Theme configuration */
@theme {
  --color-primary-50: #f0f9ff;
  --color-primary-500: #38bdf8;
  --color-primary-600: #1ea8e0;
  --color-primary-700: #0a8ec7;
  --color-primary-900: #065a82;

  --color-accent-50: #ecfdf5;
  --color-accent-500: #10b981;
  --color-accent-600: #059669;

  --color-success: #22c55e;
  --color-warning: #facc15;
  --color-danger: #ef4444;

  --radius: 0.5rem;
}
```

**Typography:** The application uses the Inter font family with system-ui fallback for optimal readability across devices. The base font size is 16px with a line height of 1.5 for body text. Heading levels use a typographic scale with appropriate size and weight combinations for visual hierarchy.

**Dark Mode:** The application supports a dark mode theme that inverts the color scheme while maintaining WCAG AA contrast ratios. The dark mode is activated through a CSS custom variant (`@custom-variant dark (&:is(.dark *))`) and triggered by a theme toggle button in the header. The user's preference is persisted in localStorage and initialized by checking the system preference via the `prefers-color-scheme` media query.

```css
.dark body {
  background-color: #0F172A;
  color: #F8FAFC;
}

* {
  border-color: #E2E8F0;
}

.dark * {
  border-color: color-mix(in oklab, var(--color-gray-700), transparent);
}
```

**UI Component Library:** The application includes a reusable UI component library built on Radix UI primitives, which provide accessible, unstyled components that are styled using Tailwind CSS utility classes. The component library includes:

- **Button:** Variants for primary, secondary, outline, ghost, danger, and link styles with support for disabled states, loading spinners, and icon slots.
- **Card:** Container component with variants for default, interactive (hover effects), and featured (accent border) styles.
- **Dialog:** Modal dialog with overlay, close button, and focus trap, used for booking responses, payment processing, and confirmations.
- **Input:** Form input with label, error message display, and icon slot, supporting text, number, email, and password types.
- **Badge:** Status indicator with color variants for pending (yellow), approved (green), rejected (red), and completed (blue) statuses.
- **Avatar:** User avatar display with image support, fallback initials, and size variants.
- **Select:** Dropdown select with search filtering, used for location cascading dropdowns and role selection.
- **LoadingSpinner:** Animated loading indicator used throughout the application for async operations.

#### 4.5.2 Navigation Structure

The application has two navigation contexts: public navigation and dashboard navigation.

**Public Navigation:** The public layout header provides navigation links to Home, Properties, About, Contact, and FAQ pages. Authentication status determines the right-side actions showing either Login/Register buttons or the user's avatar with a dropdown menu for Dashboard, Settings, and Logout. The header also includes a language switcher for the four supported languages and a theme toggle for dark/light mode. On mobile devices, the navigation collapses into a hamburger menu with a slide-out drawer.

**Dashboard Navigation:** The dashboard layout provides a role-based sidebar navigation menu. The sidebar items are configured through role-specific arrays in `DashboardLayout.tsx`:

- **Tenant Navigation:** Dashboard, Bookings, Favorites, Contracts, Payments, Maintenance, Messages, Reviews, Settings
- **Owner Navigation:** Dashboard, Properties, Add Property, Bookings, Contracts, Payments, Maintenance, Earnings, Messages, Reviews, Settings
- **Admin Navigation:** Dashboard, Users, Properties, Bookings, Contracts, Payments, Complaints, Reports, Messages, Settings
- **Super Admin Navigation:** Same as admin plus Activity Logs and Settings (with CMS management)

The sidebar collapses to an icon-only state on smaller screens and can be toggled using a hamburger button. The current page is highlighted with the primary color and a left border indicator.

#### 4.5.3 Responsive Design Strategy

The application uses responsive design breakpoints at 640px (mobile), 768px (tablet), and 1024px (desktop) following Tailwind CSS's default breakpoint convention. The responsive strategy follows a mobile-first approach where the base styles target mobile devices and progressively enhance for larger screens.

**Layout Adaptations:**
- **Mobile (320px-639px):** Single column layouts, full-width cards, bottom navigation or hamburger menu, stacked filter panels, reduced font sizes.
- **Tablet (640px-1023px):** Two column grids for property listings, sidebar navigation visible with icons only, filter panels as side drawers, standard font sizes.
- **Desktop (1024px+):** Three column grids for property listings, full sidebar navigation with icons and labels, inline filter panels, comfortable whitespace.

**Touch Interactions:** Touch targets are sized at minimum 44x44 pixels following WCAG guidelines. Interactive elements have appropriate touch feedback with visual state changes (hover, active, focus). Swipe gestures are not required for any essential functionality.

**Mobile-Specific Components:**
- Bottom sheet dialogs instead of modal dialogs on mobile
- Full-screen filter panels instead of side panels
- Simplified data tables with horizontal scrolling
- Compact KPI cards with reduced padding

#### 4.5.4 Page and Route Design

**Table 4.3: Complete Route Map**

| Route | Page Component | Layout | Access | Description |
|---|---|---|---|---|
| `/` | HomePage | Public | Public | Landing page with hero, featured properties, CTA |
| `/properties` | PropertiesPage | Public | Public | Property listing with search and filters |
| `/properties/:id` | PropertyDetailPage | Public | Public | Property details, gallery, reviews, booking |
| `/about` | AboutPage | Public | Public | About the platform |
| `/contact` | ContactPage | Public | Public | Contact form |
| `/faq` | FaqPage | Public | Public | Frequently asked questions |
| `/privacy` | PrivacyPage | Public | Public | Privacy policy |
| `/terms` | TermsPage | Public | Public | Terms of service |
| `/auth/login` | LoginPage | None | Public | User login form |
| `/auth/register` | RegisterPage | None | Public | User registration form |
| `/auth/forgot-password` | ForgotPasswordPage | None | Public | Password reset request |
| `/auth/callback` | AuthCallbackPage | None | Public | OAuth callback handler |
| `/auth/choose-role` | RoleSelectionPage | None | Auth | Post-registration role selection |
| `/dashboard` | DashboardHome | Dashboard | Auth | Role-specific KPI dashboard |
| `/dashboard/settings` | SettingsPage | Dashboard | Auth | Profile and account settings |
| `/dashboard/account` | SettingsPage | Dashboard | Auth | Alias for settings |
| `/dashboard/messages` | MessagesPage | Dashboard | Auth | Real-time messaging center |
| `/dashboard/notifications` | NotificationsPage | Dashboard | Auth | Notification feed |
| `/dashboard/reviews` | ReviewsPage | Dashboard | Auth | Review management |
| `/dashboard/bookings` | BookingsPage | Dashboard | Auth | Booking management |
| `/dashboard/favorites` | TenantFavorites | Dashboard | Tenant | Saved properties list |
| `/dashboard/maintenance` | MaintenanceRequestsPage | Dashboard | Tenant/Owner | Maintenance request tracker |
| `/dashboard/contracts` | ContractsPage | Dashboard | Tenant/Owner | Contract management |
| `/dashboard/payments` | PaymentPage | Dashboard | Tenant/Owner | Payment history |
| `/dashboard/properties` | OwnerProperties | Dashboard | Owner/Agent | Property management list |
| `/dashboard/properties/add` | AddPropertyPage | Dashboard | Owner/Agent | New property form |
| `/dashboard/properties/:id/edit` | EditPropertyPage | Dashboard | Owner/Agent | Edit property form |
| `/dashboard/earnings` | OwnerEarnings | Dashboard | Owner/Agent | Earnings analytics |
| `/dashboard/users` | AdminUsers | Dashboard | Admin/SA | User management table |
| `/dashboard/reports` | AdminReports | Dashboard | Admin/SA | Platform analytics reports |
| `/dashboard/complaints` | ComplaintsPage | Dashboard | Admin/SA | Complaints management |
| `/dashboard/activity-logs` | ActivityLogsPage | Dashboard | Super Admin | Audit log viewer |

The route map includes 30 distinct routes organized into three categories: public routes (9 routes), authentication routes (5 routes), and protected dashboard routes (16 routes across all roles). Route protection is enforced through nested `ProtectedRoute` components with optional `allowedRoles` prop that restricts access to specific roles.

### 4.6 API Design

The system exposes functionality through three API patterns: data API operations through Supabase's auto-generated REST API, custom edge functions for server-side processing, and real-time subscriptions for live data synchronization.

#### 4.6.1 Data API Operations

The `src/lib/api.ts` module encapsulates all database operations into domain-specific API objects. Each API object provides typed methods for common CRUD operations on its associated table. The API layer is the single point of contact between the frontend components and the Supabase database client.

**Authentication API (`authApi`):**
- `login(email, password)` - Authenticates user with email and password, returns session data
- `register(email, password)` - Creates new user account, returns user data
- `signInWithOAuth(provider, redirectTo)` - Initiates OAuth flow with Google
- `logout()` - Ends user session
- `resetPassword(email)` - Sends password reset email
- `getSession()` - Retrieves current session

**Profile API (`profileApi`):**
- `get(userId)` - Retrieves profile by user ID
- `update(userId, updates)` - Updates profile fields

**Property API (`propertyApi`):**
- `list(filters)` - Retrieves properties with optional filter criteria, includes images and reviews
- `get(id)` - Retrieves single property with images, reviews, and owner profile
- `create(property)` - Creates new property listing
- `update(id, updates)` - Updates property fields
- `delete(id)` - Deletes property and cascades to images, videos, amenities
- `incrementViews(id)` - Increments property view counter via database function

**Booking API (`bookingApi`):**
- `list(userId, role)` - Retrieves bookings for a user based on their role (tenant or owner)
- `create(booking)` - Creates new booking request
- `update(id, updates)` - Updates booking status or fields

**Review API (`reviewApi`):**
- `list(propertyId)` - Retrieves all reviews for a property with user profiles
- `create(review)` - Creates new review with audit logging

**Favorite API (`favoriteApi`):**
- `list(userId)` - Retrieves user's favorite properties
- `add(userId, propertyId)` - Adds property to favorites
- `remove(id)` - Removes property from favorites

**Message API (`messageApi`):**
- `list(userId)` - Retrieves all messages involving the user (sent or received)
- `send(message)` - Sends a new message
- `update(id, updates)` - Updates message (mark as read, edit content)
- `remove(id)` - Deletes a message
- `getAdminUsers()` - Retrieves admin/super_admin users for support contact
- `markAsRead(id)` - Marks a single message as read

**Notification API (`notificationApi`):**
- `list(userId)` - Retrieves user's notifications ordered by recency
- `markAsRead(id)` - Marks single notification as read
- `markAllAsRead(userId)` - Marks all unread notifications as read
- `delete(id)` - Deletes a notification

**Payment API (`paymentApi`):**
- `list(userId, role)` - Retrieves payments as payer or payee based on role
- `create(payment)` - Creates payment record
- `update(id, updates)` - Updates payment status

#### 4.6.2 Edge Functions API

Nine Supabase Edge Functions implement server-side business logic that requires privileged database access or integration with external services. Each edge function is a TypeScript file deployed to the Deno runtime and invoked via HTTPS POST requests.

**Table 5.2: Edge Functions Summary**

| Function | Trigger | Purpose |
|---|---|---|
| welcome-email | New user registration | Sends welcome email with platform introduction |
| booking-notification | Booking create/update | Notifies owner of new booking request |
| message-notification | New message | Notifies recipient of new message |
| review-notification | New review | Notifies owner of new property review |
| complaint-notification | Complaint submission | Notifies admins of new complaint |
| contact-form | Contact form submission | Sends contact form to platform email |
| delete-user | Admin user deletion | Deletes user from auth.users and cascading data |
| send-email | General purpose | Sends email via SMTP with templated HTML |
| newsletter | Newsletter signup | Adds subscriber to mailing list |

Edge functions share common utilities from the `_shared/` directory including CORS headers configuration, SMTP client setup, and email template rendering. Each function follows a consistent pattern: parse the request body, validate inputs, perform the business logic using the service role client for privileged database access, and return a JSON response.

#### 4.6.3 Real-Time Subscriptions

Real-time functionality is implemented using Supabase Realtime, which uses PostgreSQL replication to broadcast database changes to subscribed clients over WebSocket connections. The system uses real-time subscriptions for two primary features:

**Messaging System:** The `MessagesPage` component subscribes to changes on the `messages` table filtered by user ID. When a new message is inserted or an existing message is updated, the subscription callback adds or updates the message in the local state, providing instant delivery without polling. The subscription is established when the component mounts and cleaned up when it unmounts:

```typescript
useEffect(() => {
  const subscription = supabase
    .channel('messages')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'messages',
        filter: `sender_id=eq.${userId}` },
      (payload) => { /* handle new/updated messages */ }
    )
    .subscribe()

  return () => { supabase.removeChannel(subscription) }
}, [userId])
```

**Notification System:** The `DashboardLayout` component subscribes to changes on the `notifications` table for the current user. When a new notification is inserted, the unread badge count is incremented and the notification feed is updated in real-time. This provides immediate feedback when, for example, a booking is approved or a new message arrives while the user is on a different dashboard page.

### 4.7 System Sequence Diagrams

**Figure 4.4: Navigation Flow Diagram**

The navigation flow illustrates how users move through the application based on their authentication status and role:

```
User arrives at application
  ├── Not authenticated → Public pages (Home, Properties, About, etc.)
  │   └── Clicks Login → Login page
  │       ├── Success → Dashboard (role-based home)
  │       └── Not registered → Register page
  │           └── Success → Role Selection page
  │               └── Role selected → Dashboard
  └── Authenticated → Dashboard (role-based home)
      ├── Tenant → Bookings, Favorites, Messages, etc.
      ├── Owner → Properties, Bookings, Earnings, etc.
      ├── Admin → Users, Reports, Complaints, etc.
      └── Super Admin → All admin + Activity Logs, Settings
```

**Booking Flow Sequence:**

The booking workflow involves three actors (Tenant, System, Owner) and follows a five-status state machine:

1. Tenant browses published properties and views a property detail page
2. Tenant clicks "Book Now" and fills in the booking form with dates and message
3. System validates that check-out date is after check-in date
4. System checks for overlapping bookings (approved or pending) on the same property and dates
5. If no overlap exists, system creates a booking record with status "pending"
6. System sends email notification to property owner via edge function
7. System creates in-app notification for the property owner
8. Owner views pending bookings grouped by property in their dashboard
9. Owner reviews the booking request with tenant information and message
10. Owner clicks "Respond" and chooses to Approve or Reject, optionally with a reply message
11. System updates booking status to "approved" or "rejected"
12. If approved, system sends email and in-app notification to tenant with owner's reply
13. Tenant views the approved booking and clicks "Pay Now"
14. System displays payment dialog with rent + deposit summary
15. Tenant selects payment method (MTN MoMo, Airtel Money, or Card)
16. Tenant enters payment details and confirms
17. System creates payment record and updates booking status to "completed"
18. System sends payment confirmation notifications to both tenant and owner

**Payment Flow Sequence:**

1. User clicks "Pay Now" on an approved booking
2. System displays payment dialog with payment summary (rent amount + deposit amount = total)
3. User selects a payment method from three options:
   - MTN MoMo: Enter MTN phone number
   - Airtel Money: Enter Airtel phone number
   - Card: Enter card number, expiry date, and CVV
4. System collects method-specific input fields
5. User clicks "Confirm and Pay"
6. System shows processing animation with sequential status messages:
   - "Initializing payment..."
   - "Processing payment..."
   - "Verifying transaction..."
   - "Payment successful!"
7. System creates payment record with unique transaction ID
8. System updates booking status to "completed"
9. System creates in-app notifications for both tenant and owner
10. System triggers edge functions for email notifications to both parties
11. System closes payment dialog and shows success toast
12. Booking list refreshes to show updated status
