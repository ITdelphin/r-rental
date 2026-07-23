## Chapter 3: Methodology

### 3.1 System Development Life Cycle

#### 3.1.1 Agile Methodology

The project was developed using the Agile software development methodology. Agile was selected over traditional waterfall methodology for several compelling reasons that are particularly relevant to a project with diverse stakeholder requirements and evolving technical understanding.

**Iterative Development:** Agile's iterative approach allows for progressive feature development with regular feedback loops, ensuring that each increment of the system is functional and tested before moving to the next iteration. Each two-week sprint produced a potentially shippable product increment, enabling early validation of design decisions and technical approaches. This iterative cycle reduced the risk of building features that did not meet user needs, as each increment could be reviewed and adjusted based on stakeholder feedback before significant additional investment was made.

**Adaptability to Requirements Evolution:** The rental management domain has multiple stakeholders with sometimes competing priorities, and requirements naturally evolve as stakeholders see working software and develop a better understanding of what is possible. Agile's ability to accommodate changing requirements throughout the development process ensured that the final system accurately reflected stakeholder needs, even when those needs evolved during the project. The product backlog was continuously refined, with items added, removed, reprioritized, or split based on ongoing stakeholder feedback and emerging insights from development.

**Early Risk Identification:** By delivering working software at the end of each sprint, Agile enabled early identification and mitigation of technical risks, integration challenges, and requirement misunderstandings. Issues that might have remained hidden until late in a waterfall project were surfaced early when they could be addressed with minimal impact on schedule and budget. The regular demonstration of working software also reduced the risk of building a system that did not meet stakeholder expectations, as misalignments were identified and corrected within weeks rather than months.

**Continuous Stakeholder Engagement:** Agile's emphasis on stakeholder involvement throughout the development process ensured that the development team maintained alignment with user expectations and business objectives. Stakeholders participated in sprint reviews where they could see and interact with working software, providing immediate feedback that guided the next iteration. This engagement built stakeholder ownership and confidence in the development process, as they could see their input being incorporated into the system in real-time.

**Incremental Value Delivery:** Each sprint delivered a functional increment of the system, allowing stakeholders to realize value from partial functionality before the complete system was finished. The authentication system delivered in Sprint 1, for example, could be tested and validated independently of later features like payments or messaging. This incremental delivery approach also provided natural milestones for the project, with each sprint representing a clear phase of accomplishment.

The Agile methodology was implemented through the following practices:

- **Sprint Planning:** At the beginning of each two-week sprint, the team planned the work to be accomplished, breaking down features from the product backlog into specific tasks with effort estimates. Sprint goals were defined to provide focus and alignment.
- **Daily Stand-ups:** Brief 15-minute daily coordination meetings where team members discussed progress since the last meeting, plans for the current day, and any blockers that needed resolution. These stand-ups maintained team coordination and surfaced issues quickly.
- **Sprint Reviews:** At the end of each sprint, completed features were demonstrated to stakeholders for feedback and validation. Stakeholders could interact with working software and provide input that informed the next sprint's priorities.
- **Sprint Retrospectives:** The team reflected on the sprint process to identify what went well, what could be improved, and what actions would be taken to improve future sprints. This continuous process improvement cycle enhanced team productivity and satisfaction throughout the project.
- **Backlog Management:** A prioritized product backlog was maintained and refined throughout the project, with items added, removed, or reprioritized based on stakeholder feedback and changing requirements. User stories were written from the perspective of end users to maintain focus on user needs.

#### 3.1.2 Sprint Structure

The project was organized into six two-week sprints, each focused on specific feature areas with clear deliverables and acceptance criteria.

**Table 3.1: Sprint Schedule and Deliverables**

| Sprint | Duration | Focus Area | Key Deliverables |
|---|---|---|---|
| Sprint 1 | Weeks 1-2 | Foundation | Project setup with Vite + React + TypeScript, Supabase project configuration, database schema (migration 00001), authentication system with login/register/logout/session management, profile management with CRUD operations, basic UI component library (Button, Card, Input, Badge, Dialog, Avatar), public layout (Header with navigation, Footer), React Router configuration with all routes, TanStack Query setup |
| Sprint 2 | Weeks 3-4 | Property Management | Property CRUD operations (create, read, update, delete), property image upload and management with Supabase Storage, property listing page with responsive grid layout, property detail page with image gallery and navigation, location selection using cascading Rwandan geography dropdowns, amenity management with toggle flags, property status workflow (draft, pending_approval, published, rejected, sold/rented), search and filtering by location/price/bedrooms/property type |
| Sprint 3 | Weeks 5-6 | Booking and Payments | Booking creation with date selection and calendar inputs, booking overlap detection with PostgreSQL queries, owner booking management dashboard with property grouping, booking approval/rejection workflow with reply messages, booking cancellation by tenants, payment dialog with three method support (MTN MoMo, Airtel Money, Card), payment processing flow with animated states, payment record creation and booking status update, payment history display, contract management with basic CRUD |
| Sprint 4 | Weeks 7-8 | Communication | Real-time messaging system with Supabase PostgreSQL replication, conversation sidebar with last message preview and unread counts, message sending/receiving with instant delivery, message editing and deletion, read receipts with check mark and clock icons, conversation search and filtering, deep linking from property detail pages, user search for starting new conversations, contact support functionality, in-app notification system with real-time badge updates, notification feed with read/unread management |
| Sprint 5 | Weeks 9-10 | Administration | Admin dashboard with user management table (search, sort, pagination), user suspension/reinstatement with confirmation, user identity verification toggle, role change with super_admin restriction, user deletion via edge function, platform reports with time period filtering (7d/30d/90d/1y), KPI cards with trend indicators, growth trend bar charts using Recharts, admin booking overview, super admin settings with three sections (general, branding, CMS pages), content management with page CRUD, audit logging integration, activity logs viewer, complaints management |
| Sprint 6 | Weeks 11-12 | Polish and Deployment | Multi-language implementation with i18next for English, Kinyarwanda, French, and Swahili, translation of all 654 UI strings, language switcher in header, automatic fallback for missing translations, remaining UI polish and responsive design fixes for all breakpoints, dark mode implementation with persistent theme preference, performance optimization with code splitting and lazy loading, Lighthouse audit and optimization, comprehensive security testing of RLS policies, Vercel deployment configuration with rewrites and caching headers, GitHub Actions CI/CD pipeline with automated build and deploy, final user acceptance testing with 18 participants |

### 3.2 Requirements Gathering Techniques

Requirements for the system were gathered through a combination of four complementary techniques to ensure comprehensive coverage of stakeholder needs.

#### 3.2.1 Market Research

Comprehensive market research was conducted to understand the current state of rental platforms globally and within Rwanda. This research included analysis of 12 rental platforms across international, regional, and local categories: Zillow, Airbnb, Zumper, Apartments.com, and Booking.com for international; Jiji Rwanda, Lamudi, PropertyPro, MeQasa, and BuyRentKenya for regional; and Rwanda Property Finder and private WhatsApp/Facebook rental groups for local. Each platform was evaluated for feature completeness, user experience, technical architecture, and localization for African markets.

The research documented each platform's listing creation and management capabilities, search and filtering options, booking and transaction workflows, communication tools, review and rating systems, payment processing methods, mobile responsiveness, user account management, and administrative features. User reviews and ratings for each platform were analyzed on app stores and review sites to identify common complaints and desired features. The research findings were compiled into a feature comparison matrix that informed the requirements prioritization for Rwanda EasyRent.

#### 3.2.2 Stakeholder Interviews

Semi-structured interviews were conducted with stakeholders representing each user role in the system. Three property owners with portfolios ranging from 2 to 15 rental units located in Kigali and Musanze were interviewed about their current property management practices, marketing challenges, pain points in tenant communication, payment collection methods, and desired features in a digital platform. Five current renters from different demographic backgrounds including university students, young professionals, and families were interviewed about their property search experiences, challenges in finding suitable housing, preferences for platform features, and willingness to use digital rental services. Two licensed real estate agents operating in Kigali were interviewed about their current tools and workflows, client management practices, and feature requirements for a professional platform. One professional property manager managing over 50 units provided insights into large-scale property management needs.

Interview questions explored current rental process challenges, desired features ranked by importance, specific pain points in existing solutions, technology comfort levels and preferences, preferred communication channels for rental-related interactions, payment method preferences and concerns, willingness to adopt a digital platform, and pricing model preferences.

#### 3.2.3 User Surveys

An online survey was distributed to potential platform users through social media channels (LinkedIn, Twitter, WhatsApp groups) and professional networks. The survey received 47 valid responses and collected data on demographics including age range, location, occupation, and income bracket; current rental property search methods and frequency; most important factors in property selection ranked by importance; experience with existing rental platforms including satisfaction ratings; willingness to use a new rental platform; preferred features in a rental management system selected from a list; language preferences for the platform interface; payment method preferences; and willingness to pay for premium features.

Survey results were analyzed to identify feature priorities, with the most requested features being comprehensive property information with multiple photos, price search filtering, direct messaging with owners, and booking management. The results informed the prioritization of features in the product backlog and guided design decisions about the user interface layout and information architecture.

#### 3.2.4 Competitor Analysis

Detailed competitor analysis was performed on the three platforms most relevant to the project: Jiji Rwanda as the primary local competitor with existing market presence, Airbnb as the primary transaction-focused platform with proven booking and payment workflows, and Zillow as the feature benchmark representing the most sophisticated rental platform in the international market. The analysis examined feature set completeness across listing, search, booking, payment, communication, review, dashboard, and administrative categories; user interface design quality including visual design, information architecture, and interaction patterns; mobile responsiveness across device sizes; performance metrics including page load time and search response time; pricing models for both free and premium features; market positioning and differentiation strategies; and user satisfaction indicators from app store ratings and user reviews.

The competitor analysis informed the feature prioritization and differentiation strategy for Rwanda EasyRent, identifying areas where the platform could differentiate from competitors through localization features (Rwandan geography, mobile money, multi-language support), comprehensive lifecycle support (beyond listing to booking, payment, and management), and role-specific features for all stakeholder types.

### 3.3 Functional Requirements

The functional requirements of the system are organized by feature area and specify what the system must do to meet user needs. Each requirement is traceable to user needs identified during the requirements gathering phase.

#### 3.3.1 User Registration and Authentication

FR-001: The system shall allow users to register with email, password, full name, and phone number.
FR-002: The system shall send a welcome email to newly registered users via edge function.
FR-003: The system shall allow users to log in using email and password with session management.
FR-004: The system shall allow users to log in using Google OAuth for single sign-on.
FR-005: The system shall allow users to reset their password via email with secure token.
FR-006: The system shall maintain user sessions across page reloads using JWT tokens with automatic refresh.
FR-007: The system shall allow authenticated users to update their profile information including name, phone, avatar, bio, national ID, and location.
FR-008: The system shall allow users to select their role (tenant, owner, agent) during registration.
FR-009: The system shall redirect users to a role selection page after completing OAuth registration.
FR-010: The system shall automatically create a profile record with default role when a new user signs up via trigger.
FR-011: The system shall log out users and redirect to the home page on logout with session cleanup.

#### 3.3.2 Property Management

FR-012: The system shall allow property owners to create new property listings with title, description, category, type, bedrooms, bathrooms, kitchen, eight amenity flags, furnished status, price, deposit, complete location hierarchy, and GPS coordinates.
FR-013: The system shall allow owners to upload multiple images for each property with sort order and floor plan designation.
FR-014: The system shall allow owners to upload videos for each property.
FR-015: The system shall allow owners to add custom amenities beyond the eight predefined flags.
FR-016: The system shall allow owners to edit all property details after creation.
FR-017: The system shall allow owners to delete their properties with confirmation.
FR-018: The system shall support property status workflow with six states: draft, pending_approval, published, rejected, sold, rented.
FR-019: The system shall allow owners to mark properties as featured for premium visibility.
FR-020: The system shall allow administrators to view and manage all properties regardless of ownership.
FR-021: The system shall automatically track property view counts with database function.
FR-022: The system shall display property images in a gallery with navigation controls, thumbnails, and counter.
FR-023: The system shall display property details including all amenities, complete location, price, description, and owner information.
FR-024: The system shall display the property owner's profile information on the detail page.
FR-025: The system shall provide a WhatsApp sharing button with pre-formatted property details message.

#### 3.3.3 Booking System

FR-026: The system shall allow tenants to submit booking requests for published properties with dates and message.
FR-027: The system shall require tenants to select check-in and check-out dates with calendar inputs.
FR-028: The system shall require tenants to include a message with their booking request describing their interest.
FR-029: The system shall check for date overlaps with existing approved or pending bookings before submission and display error if unavailable.
FR-030: The system shall send email and in-app notifications to the property owner when a new booking is created.
FR-031: The system shall display booking requests to property owners grouped by property with summary statistics.
FR-032: The system shall allow property owners to approve booking requests with an optional reply message.
FR-033: The system shall allow property owners to reject booking requests with an optional reply message.
FR-034: The system shall send email and in-app notifications to tenants when their booking is approved or rejected.
FR-035: The system shall allow tenants to cancel their pending booking requests with confirmation.
FR-036: The system shall send email and in-app notifications when a booking is cancelled.
FR-037: The system shall allow tenants to initiate payment for approved bookings through the payment dialog.
FR-038: The system shall update booking status to completed when payment is successfully processed.
FR-039: The system shall display booking history to tenants and owners in their respective dashboards.
FR-040: The system shall show summary statistics including pending count, approved count, and new requests on the owner bookings page.

#### 3.3.4 Payment Processing

FR-041: The system shall display a payment summary showing rent amount, deposit amount, and total in RWF.
FR-042: The system shall support three payment methods: MTN MoMo, Airtel Money, and Visa/Mastercard.
FR-043: The system shall collect method-specific input: phone number for mobile money, card details for card payments.
FR-044: The system shall display a processing state with animated status messages during payment.
FR-045: The system shall create a payment record in the payments table upon successful payment.
FR-046: The system shall generate a unique transaction ID for each payment using random string generation.
FR-047: The system shall update the associated booking status to completed when payment is confirmed.
FR-048: The system shall send payment confirmation notifications to both tenant and owner.
FR-049: The system shall display payment history to both payers and payees with sorting.
FR-050: The system shall include booking and property details in payment records for context.

#### 3.3.5 Messaging System

FR-051: The system shall allow authenticated users to send messages to other platform users.
FR-052: The system shall deliver messages in real-time using Supabase PostgreSQL replication.
FR-053: The system shall group messages into conversations between two users with unique conversation identification.
FR-054: The system shall display conversations sorted by most recent message with preview text.
FR-055: The system shall show unread message counts per conversation and total.
FR-056: The system shall mark messages as read when the recipient views the conversation.
FR-057: The system shall allow users to edit their sent messages with inline editing.
FR-058: The system shall allow users to delete their messages with confirmation dialog.
FR-059: The system shall support deep linking from property detail pages to start a conversation with the owner.
FR-060: The system shall pre-fill a message when deep-linked from a property with property interest text.
FR-061: The system shall allow users to search for other platform users to start new conversations.
FR-062: The system shall allow users to contact support by finding available admin/super_admin users.
FR-063: The system shall display message timestamps with relative time formatting (just now, 5m ago, yesterday).

#### 3.3.6 Reviews and Ratings

FR-064: The system shall allow authenticated users to submit reviews for properties they have engaged with.
FR-065: The system shall require a rating between 1 and 5 stars for each review.
FR-066: The system shall allow optional text comments with reviews.
FR-067: The system shall prevent users from submitting more than one review per property.
FR-068: The system shall display aggregate rating and review count on property cards and detail pages.
FR-069: The system shall display individual reviews with user names and dates on property detail pages.
FR-070: The system shall allow users to update and delete their own reviews.
FR-071: The system shall display star ratings visually using filled and unfilled star icons.

#### 3.3.7 Role-Based Dashboards

FR-072: The system shall provide a tenant dashboard with booking status, saved property count, and unread message count.
FR-073: The system shall provide an owner dashboard with property count, active bookings, monthly earnings, and average rating.
FR-074: The system shall provide an admin dashboard with total users, properties, bookings, views, revenue, pending properties, and open complaints.
FR-075: The system shall provide a super admin dashboard with all admin metrics plus activity log access.
FR-076: The system shall provide role-specific navigation menus in the dashboard sidebar.
FR-077: The system shall display KPI cards with appropriate icons and color coding for each metric.
FR-078: The system shall show quick action buttons relevant to each role.
FR-079: The system shall display a platform overview section for admins with detailed statistics.
FR-080: The system shall show a welcome message with the user's name on the dashboard.

#### 3.3.8 Administrative Functions

FR-081: The system shall allow administrators to view all platform users in a searchable table.
FR-082: The system shall allow administrators to suspend and reinstate user accounts with confirmation.
FR-083: The system shall allow administrators to verify user identities with toggle.
FR-084: The system shall allow administrators to change user roles via dropdown selection.
FR-085: The system shall restrict the super_admin role assignment to current super_admin users only.
FR-086: The system shall allow super administrators to delete user accounts via edge function with warning.
FR-087: The system shall generate platform reports with total users, properties, bookings, and revenue.
FR-088: The system shall allow filtering reports by time period: 7 days, 30 days, 90 days, 1 year.
FR-089: The system shall display growth trend visualizations using horizontal bar charts.
FR-090: The system shall log all critical actions to audit logs with timestamp, user, action, and details.
FR-091: The system shall provide an audit log viewer for super administrators.
FR-092: The system shall allow super administrators to manage platform settings: name, email, phone, address.
FR-093: The system shall allow super administrators to upload and manage branding assets: logo, favicon, hero background.
FR-094: The system shall allow super administrators to create, edit, and delete CMS pages with slug, title, content, and meta fields.
FR-095: The system shall allow super administrators to set page publish/draft status for each CMS page.

### 3.4 Non-Functional Requirements

Non-functional requirements define the quality attributes and constraints of the system. These requirements are equally important to functional requirements as they determine the system's usability, performance, security, and maintainability.

**Table 3.3: Non-Functional Requirements with Target Metrics**

| Category | ID | Requirement | Target Metric |
|---|---|---|---|
| Performance | NFR-001 | Page load time shall not exceed 3 seconds | Less than 3 seconds on average broadband connection |
| Performance | NFR-002 | Search queries shall return results within 1 second | Less than 1 second for database of 1000+ properties |
| Performance | NFR-003 | Message delivery shall occur in real-time | Less than 500ms delay from send to receipt |
| Performance | NFR-004 | The system shall handle concurrent users without degradation | Support 100+ concurrent users with sub-3s response |
| Scalability | NFR-005 | The database shall support growth to 10,000+ properties | Query performance maintained with proper indexing |
| Scalability | NFR-006 | The frontend shall scale horizontally via CDN distribution | Auto-scaling via Vercel edge network |
| Security | NFR-007 | All database access shall be protected by RLS | 100 percent of database tables have RLS enabled |
| Security | NFR-008 | User passwords shall be hashed and salted | Handled by Supabase Auth with bcrypt algorithm |
| Security | NFR-009 | All network communication shall use HTTPS | Enforced by Vercel with automatic HTTPS redirect |
| Security | NFR-010 | Input validation shall prevent injection attacks | Zod schemas on all form inputs and API calls |
| Security | NFR-011 | User sessions shall expire after inactivity | JWT with 1-hour expiry and automatic refresh |
| Availability | NFR-012 | System uptime shall be 99.9 percent | Backed by Vercel SLA guarantee |
| Reliability | NFR-013 | All form submissions shall provide clear feedback | Toast notifications for success and error states |
| Reliability | NFR-014 | The system shall handle API errors gracefully | Error boundaries and fallback UI components |
| Usability | NFR-015 | The interface shall be usable by users with basic computer literacy | Intuitive design with clear labels and help text |
| Usability | NFR-016 | Navigation shall follow consistent patterns across all pages | Same layout conventions and interaction patterns |
| Usability | NFR-017 | Forms shall provide inline validation feedback | Real-time field validation with error messages |
| Maintainability | NFR-018 | The codebase shall use TypeScript with strict mode | TypeScript strict mode enabled in tsconfig |
| Maintainability | NFR-019 | Components shall follow a consistent directory structure | Feature-based organization with clear naming |
| Maintainability | NFR-020 | Database changes shall be managed through versioned migrations | 20 numbered migration files with descriptive names |
| i18n | NFR-021 | The UI shall support English, Kinyarwanda, French, and Swahili | Complete locale files for all four languages |
| i18n | NFR-022 | Missing translations shall fall back to English | Automatic fallback via i18next configuration |
| i18n | NFR-023 | Language switching shall not require page reload | Dynamic i18n with immediate UI update |
| Responsiveness | NFR-024 | The UI shall render correctly on screens from 320px wide | Responsive breakpoints at 640px, 768px, 1024px |
| Responsiveness | NFR-025 | Touch targets shall be minimum 44x44px on mobile | WCAG touch target guideline compliance |
| Accessibility | NFR-026 | All images shall have descriptive alt text | Alt attributes required on all image elements |
| Accessibility | NFR-027 | Color contrast shall meet WCAG AA standards | Minimum 4.5:1 contrast ratio for normal text |
| Compatibility | NFR-028 | The system shall support Chrome, Firefox, Safari, Edge | Support for latest 2 major versions of each browser |

### 3.5 Use Case Analysis

The following use cases describe the primary interactions between actors and the system, illustrating how different user roles interact with the platform to accomplish their goals.

**Use Case 1: Tenant Searches for Properties**

**Actor:** Tenant (unauthenticated or authenticated)
**Trigger:** User visits the properties page or uses the search bar on the home page
**Preconditions:** None
**Postconditions:** User is presented with a list of matching properties
**Main Flow:**
1. User navigates to the properties page or enters a search query
2. System displays published properties in a responsive grid layout
3. User applies filters: location (province/district/sector), price range, bedrooms, property type
4. System updates the property list based on applied filters
5. User clicks on a property card to view details
6. System navigates to the property detail page with full information

**Use Case 2: Tenant Books a Property**

**Actor:** Tenant (authenticated)
**Trigger:** User clicks "Book Now" on a property detail page
**Preconditions:** User is authenticated with tenant role
**Postconditions:** Booking request is created and owner is notified
**Main Flow:**
1. System displays the booking form with date pickers and message field
2. User selects check-in and check-out dates
3. User enters a message describing their interest
4. User clicks the book now button
5. System validates dates (check-out after check-in, not in the past)
6. System checks for overlapping bookings for the same property and dates
7. If no overlap, system creates a booking record with status "pending"
8. System sends email notification to property owner
9. System creates in-app notification for property owner
10. System displays success toast and redirects to the bookings dashboard

**Use Case 3: Owner Responds to Booking Request**

**Actor:** Property Owner (authenticated)
**Trigger:** Owner views booking requests in the dashboard
**Preconditions:** Owner has at least one pending booking request
**Postconditions:** Booking status is updated to approved or rejected
**Main Flow:**
1. System displays owner bookings dashboard with property grouping
2. Owner sees pending booking with tenant information and message
3. Owner clicks "Respond" button
4. System opens response dialog with approve and reject options
5. Owner optionally enters a reply message
6. Owner clicks "Approve" or "Reject"
7. System updates booking status accordingly
8. System sends email and in-app notification to tenant with status and reply message
9. System logs the action to audit log
10. System updates the booking list display

**Use Case 4: Tenant Makes a Payment**

**Actor:** Tenant (authenticated)
**Trigger:** User clicks "Pay Now" on an approved booking
**Preconditions:** Booking status is "approved"
**Postconditions:** Payment is recorded and booking status becomes "completed"
**Main Flow:**
1. System displays payment dialog with summary (rent + deposit = total)
2. User selects payment method: MTN MoMo, Airtel Money, or Card
3. System displays method-specific input fields
4. User enters required information (phone number or card details)
5. User clicks "Confirm and Pay"
6. System shows processing animation with status messages
7. System creates payment record with unique transaction ID
8. System updates booking status to "completed"
9. System sends notifications to both tenant and owner
10. System displays success confirmation

### 3.6 Technology Stack Justification

Each technology in the stack was selected based on specific criteria including suitability for the task, community support, performance characteristics, learning resources, and alignment with project requirements. The following sections justify the selection of each major technology.

**Table 3.4: Technology Stack Summary with Justification**

| Layer | Technology | Version | Purpose | Justification |
|---|---|---|---|---|
| Frontend | React | 19.x | UI framework | Component-based architecture, virtual DOM performance, extensive ecosystem, strong community, corporate backing from Meta |
| Language | TypeScript | 5.x | Programming language | Static type checking prevents runtime errors, improved IDE support, self-documenting code, industry standard for React projects |
| Build Tool | Vite | 8.x | Dev server and bundler | Instant HMR with ES modules, optimized production builds with Rollup, native TypeScript support, faster than Create React App and Webpack |
| Styling | Tailwind CSS | 4.x | CSS framework | Utility-first for rapid development, built-in design system, dark mode support, small production bundles with purging, excellent developer experience |
| UI Primitives | Radix UI | Latest | Accessible components | Unstyled accessible primitives, built-in keyboard navigation, screen reader support, composable API, used by shadcn/ui |
| Icons | Lucide React | 1.x | Icon library | Consistent design, lightweight tree-shaking, TypeScript support, comprehensive icon set |
| Routing | React Router | 7.x | Client routing | Declarative nested routes, lazy loading, URL parameters, navigation guards, industry standard for React |
| Data Fetching | TanStack Query | 5.x | Server state management | Automatic caching, background refetching, optimistic updates, pagination support, devtools |
| Forms | React Hook Form | 7.x | Form management | Uncontrolled inputs for performance, minimal re-renders, native validation, easy integration with Zod |
| Validation | Zod | 4.x | Schema validation | TypeScript-first with type inference, composable schemas, detailed error messages, lightweight |
| Backend | Supabase | Latest | BaaS platform | PostgreSQL with RLS, built-in auth, real-time subscriptions, storage, edge functions, open source |
| Database | PostgreSQL | 17.x | Relational database | Advanced features (RLS, JSONB, full-text search), ACID compliance, extensibility, strong community |
| i18n | i18next | 26.x | Internationalization | Mature framework, plural support, interpolation, language detection, React bindings, large ecosystem |
| Charts | Recharts | 3.x | Data visualization | React-native chart library, composable components, responsive, TypeScript support |
| Maps | Leaflet | Latest | Map display | Open source, lightweight, React integration via react-leaflet, no API key required |
| PDF | jsPDF | 4.x | PDF generation | Client-side PDF creation, no server required, autotable plugin for tabular data |
| Animations | Framer Motion | 12.x | Motion library | Declarative animations, gesture support, layout animations, React 18 compatible |
| Hosting | Vercel | - | Cloud platform | Global CDN, automatic HTTPS, zero-downtime deployments, preview deployments, serverless edge functions |
| CI/CD | GitHub Actions | - | Automation | Tight GitHub integration, matrix builds, caching, secret management, free for public repositories |

#### 3.6.1 Frontend Technologies

React 19 was selected as the frontend framework due to its component-based architecture, which promotes code reuse, testability, and maintainability. React's virtual DOM provides excellent performance for dynamic, data-driven interfaces by minimizing actual DOM manipulations. The large React ecosystem provides access to a wealth of libraries, tools, and community support that accelerates development. React 19 introduces improvements including server components for improved initial load performance, enhanced concurrent features for smoother interactions, and improved automatic batching for fewer re-renders.

TypeScript provides static type checking that catches errors at compile time rather than runtime, significantly reducing the incidence of type-related bugs in production. TypeScript's type system enables better IDE support with autocompletion, refactoring tools, and inline documentation. The type definitions in the project (defined in `src/types/index.ts`) serve as living documentation of the data structures used throughout the application and enable the compiler to verify that all code correctly uses these structures.

Vite was chosen as the build tool for its fast development server startup, instant hot module replacement (HMR), and optimized production builds. Vite leverages native ES modules in the browser during development, avoiding the bundling step that slows down traditional build tools like Webpack. Development server startup is nearly instantaneous, and HMR updates take less than 50ms even for large components. Production builds use Rollup for tree-shaking and code splitting, resulting in optimized output with minimal duplication.

Tailwind CSS provides a utility-first approach to styling that enables rapid UI development without leaving the HTML. The utility classes compose to create complex designs while maintaining consistency through the design system configuration. Tailwind's built-in dark mode support simplifies theme implementation through the `dark:` variant prefix. The Just-in-Time (JIT) engine generates only the CSS classes actually used in the project, resulting in production CSS files typically under 10KB after compression.

#### 3.6.2 Backend Technologies

Supabase was selected as the backend platform for several compelling reasons that align with the project's requirements and constraints. Supabase provides a managed PostgreSQL database, which is the most advanced open-source relational database. PostgreSQL's feature set including row-level security, JSONB support for flexible data storage, full-text search capabilities, and window functions provides a solid foundation for the rental platform's data requirements. The decision to use a SQL database rather than a NoSQL alternative was driven by the relational nature of the rental domain, where properties, bookings, payments, messages, and users have complex interrelationships that are naturally modeled with foreign keys and joins.

Supabase Auth handles user registration, login, session management, and OAuth integration out of the box, eliminating the need to build and maintain a custom authentication system. The auth system supports email/password authentication with bcrypt password hashing, Google OAuth for social login, password reset flows, and JWT-based session management with automatic token refresh. The auth service integrates seamlessly with the database through RLS policies, enabling row-level security based on the authenticated user's identity.

Supabase Realtime provides PostgreSQL replication that pushes database changes to connected clients via WebSocket connections, enabling real-time features without custom WebSocket infrastructure. The messaging system uses this capability to deliver messages instantly between users, and the notification system uses it to update badge counts in real-time. The replication-based approach ensures strong consistency, as the database remains the authoritative source of truth.

Supabase Edge Functions, based on the Deno runtime, provide serverless compute for tasks such as sending emails via SMTP, processing contact form submissions, and handling user deletion requests. Edge Functions are written in TypeScript and deployed directly from the Supabase CLI. They execute in response to HTTPS requests and can access project secrets and database through the service role key.

#### 3.6.3 Development Tools

Visual Studio Code served as the primary development environment with extensions for TypeScript (error checking, code completion), ESLint (code quality enforcement), Prettier (automatic code formatting), Tailwind CSS IntelliSense (class name completion), Git integration (source control), and GitHub Pull Requests (code review). Git was used for version control with GitHub for remote repository hosting, collaboration features (issues, pull requests, project boards), and CI/CD pipeline integration through GitHub Actions. npm served as the package manager for dependency management with package-lock.json ensuring reproducible builds. Supabase CLI was used for local development database management, running migrations, starting the local development stack, and deploying edge functions.

### 3.7 Development Environment

The development environment consisted of a Node.js runtime version 20 or later running on the development machine, npm version 10 or later for package management, Visual Studio Code as the primary code editor with the extensions listed above, a Supabase hosted PostgreSQL database for development and production (with local emulation via Supabase CLI for offline development), Git for version control with GitHub for remote hosting, Chrome DevTools for debugging, performance profiling, and responsive design testing, Figma for UI design mockups and design system documentation, and Postman for API testing during development.

The development workflow followed these steps:
1. Pull latest changes from the main branch
2. Create a feature branch for new work
3. Implement the feature with TypeScript, following the project's coding conventions
4. Run TypeScript compiler (`npx tsc --noEmit`) to verify type safety
5. Run the development server (`npm run dev`) to test the feature
6. Commit changes with descriptive commit messages
7. Push the feature branch and create a pull request
8. After review, merge to the main branch
9. GitHub Actions automatically builds and deploys to Vercel
