# Rwanda EasyRent

A modern, scalable, production-ready Smart House Rental Management System for Rwanda.

## Tech Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, Framer Motion, React Router
- **Backend**: Supabase (Auth, PostgreSQL, Storage, Edge Functions, Realtime, RLS)
- **UI**: shadcn/ui components, Lucide Icons, Recharts
- **Forms**: React Hook Form + Zod validation
- **Data**: TanStack Query, Axios
- **i18n**: i18next (English, Kinyarwanda, French)
- **Deployment**: Vercel + GitHub Actions CI/CD
- **Maps**: Google Maps API / React Leaflet
- **Email**: Resend

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Supabase account
- Vercel account (for deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/rwanda-easyrent.git
cd rwanda-easyrent

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run database migrations
supabase link --project-ref your-project-ref
supabase db push

# Start development server
npm run dev
```

### Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Project Structure

```
src/
├── components/
│   ├── ui/          # Reusable UI components
│   ├── layout/      # Layout components (Header, Footer, DashboardLayout)
│   ├── property/    # Property-specific components
│   ├── booking/     # Booking components
│   └── messaging/   # Chat components
├── pages/
│   ├── public/      # Public pages (Home, Properties, About, Contact, FAQ)
│   ├── auth/        # Auth pages (Login, Register, Forgot Password)
│   └── dashboard/   # Dashboard pages (Tenant, Owner, Admin, Super Admin)
├── hooks/           # Custom React hooks
├── lib/             # Utilities (supabase client, api, utils)
├── services/        # API service layer
├── types/           # TypeScript type definitions
├── i18n/            # Internationalization
├── store/           # State management
└── utils/           # Helper functions

supabase/
├── migrations/      # Database migrations
└── functions/       # Edge Functions
```

## Features

- **Multi-language**: English, Kinyarwanda, French
- **5 User Roles**: Super Admin, Admin, Property Owner, Tenant, Agent
- **Property Management**: CRUD, images, videos, floor plans
- **Advanced Search**: Filter by location, price, bedrooms, amenities
- **Booking System**: Request, approve, reject, cancel bookings
- **Real-time Chat**: Messaging between tenants and owners
- **Reviews & Ratings**: Star ratings with comments
- **Favorites**: Save and manage favorite properties
- **Dashboards**: Role-specific dashboards with analytics
- **CMS**: Content management system for pages
- **PWA Ready**: Offline mode, installable, push notifications
- **Security**: RLS, HTTPS, input validation, XSS/CSRF protection

## Deployment

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### GitHub Actions

The CI/CD pipeline is configured in `.github/workflows/deploy.yml` and automatically deploys to Vercel on pushes to the `main` branch.

Set these secrets in your GitHub repository:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`
- `SUPABASE_DB_PASSWORD`

## License

MIT
