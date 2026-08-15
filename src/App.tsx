import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'

const HomePage = lazy(() => import('@/pages/public/HomePage').then(m => ({ default: m.HomePage })))
const AboutPage = lazy(() => import('@/pages/public/AboutPage').then(m => ({ default: m.AboutPage })))
const ContactPage = lazy(() => import('@/pages/public/ContactPage').then(m => ({ default: m.ContactPage })))
const FaqPage = lazy(() => import('@/pages/public/FaqPage').then(m => ({ default: m.FaqPage })))
const PrivacyPage = lazy(() => import('@/pages/public/PrivacyPage').then(m => ({ default: m.PrivacyPage })))
const TermsPage = lazy(() => import('@/pages/public/TermsPage').then(m => ({ default: m.TermsPage })))
const PropertiesPage = lazy(() => import('@/pages/public/PropertiesPage').then(m => ({ default: m.PropertiesPage })))
const PropertyDetailPage = lazy(() => import('@/pages/public/PropertyDetailPage').then(m => ({ default: m.PropertyDetailPage })))
const ComparePage = lazy(() => import('@/components/ui/compare-properties').then(m => ({ default: m.ComparePage })))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then(m => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })))
const AuthCallbackPage = lazy(() => import('@/pages/auth/AuthCallbackPage').then(m => ({ default: m.AuthCallbackPage })))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })))
const DashboardHome = lazy(() => import('@/pages/dashboard/DashboardHome').then(m => ({ default: m.DashboardHome })))
const BookingsPage = lazy(() => import('@/pages/dashboard/BookingsPage').then(m => ({ default: m.BookingsPage })))
const ApplicationsPage = lazy(() => import('@/pages/dashboard/ApplicationsPage').then(m => ({ default: m.ApplicationsPage })))
const TenantFavorites = lazy(() => import('@/pages/dashboard/tenant/TenantFavorites').then(m => ({ default: m.TenantFavorites })))
const OwnerProperties = lazy(() => import('@/pages/dashboard/owner/OwnerProperties').then(m => ({ default: m.OwnerProperties })))
const OwnerEarnings = lazy(() => import('@/pages/dashboard/owner/OwnerEarnings').then(m => ({ default: m.OwnerEarnings })))
const AddPropertyPage = lazy(() => import('@/pages/dashboard/owner/AddPropertyPage').then(m => ({ default: m.AddPropertyPage })))
const EditPropertyPage = lazy(() => import('@/pages/dashboard/owner/EditPropertyPage').then(m => ({ default: m.EditPropertyPage })))
const AdminUsers = lazy(() => import('@/pages/dashboard/admin/AdminUsers').then(m => ({ default: m.AdminUsers })))
const AdminReports = lazy(() => import('@/pages/dashboard/admin/AdminReports').then(m => ({ default: m.AdminReports })))
const SettingsPage = lazy(() => import('@/pages/dashboard/SettingsPage').then(m => ({ default: m.SettingsPage })))
const AccountSettingsPage = lazy(() => import('@/pages/dashboard/AccountSettingsPage').then(m => ({ default: m.AccountSettingsPage })))
const MessagesPage = lazy(() => import('@/pages/dashboard/MessagesPage').then(m => ({ default: m.MessagesPage })))
const NotificationsPage = lazy(() => import('@/pages/dashboard/NotificationsPage').then(m => ({ default: m.NotificationsPage })))
const ReviewsPage = lazy(() => import('@/pages/dashboard/ReviewsPage').then(m => ({ default: m.ReviewsPage })))
const ComplaintsPage = lazy(() => import('@/pages/dashboard/ComplaintsPage').then(m => ({ default: m.ComplaintsPage })))
const ActivityLogsPage = lazy(() => import('@/pages/dashboard/ActivityLogsPage').then(m => ({ default: m.ActivityLogsPage })))
const MaintenanceRequestsPage = lazy(() => import('@/pages/dashboard/MaintenanceRequestsPage').then(m => ({ default: m.MaintenanceRequestsPage })))
const ContractsPage = lazy(() => import('@/pages/dashboard/ContractsPage').then(m => ({ default: m.ContractsPage })))
const PaymentPage = lazy(() => import('@/pages/dashboard/PaymentPage').then(m => ({ default: m.PaymentPage })))
const SuperAdminSettings = lazy(() => import('@/pages/dashboard/super-admin/SuperAdminSettings').then(m => ({ default: m.SuperAdminSettings })))

const queryClient = new QueryClient()
const isAdminDomain = typeof window !== 'undefined' && window.location.hostname.includes('admin')

function AdminRedirect() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profile } = useAuth()

  useEffect(() => {
    if (!user) {
      navigate('/auth/login', { replace: true })
    } else if (profile?.role === 'super_admin' || profile?.role === 'admin') {
      if (location.pathname === '/' || location.pathname.startsWith('/dashboard') === false) {
        navigate('/dashboard', { replace: true })
      }
    }
  }, [user, profile, navigate, location.pathname])

  return null
}

function AppRoutes() {
  return (
    <>
      {isAdminDomain && <AdminRedirect />}
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-gray-500">Loading…</div>}>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/properties/:id" element={<PropertyDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/compare" element={<ComparePage />} />
          </Route>

          {/* Auth routes */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          {/* Protected dashboard routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              {/* Common */}
              <Route path="/dashboard" element={<DashboardHome />} />
              <Route path="/dashboard/settings" element={<SettingsPage />} />
              <Route path="/dashboard/account" element={<AccountSettingsPage />} />
              <Route path="/dashboard/messages" element={<MessagesPage />} />
              <Route path="/dashboard/notifications" element={<NotificationsPage />} />
              <Route path="/dashboard/reviews" element={<ReviewsPage />} />

              <Route path="/dashboard/bookings" element={<BookingsPage />} />
              <Route path="/dashboard/applications" element={<ApplicationsPage />} />
              <Route path="/dashboard/favorites" element={<TenantFavorites />} />
              <Route path="/dashboard/maintenance" element={<MaintenanceRequestsPage />} />
              <Route path="/dashboard/contracts" element={<ContractsPage />} />
              <Route path="/dashboard/payments" element={<PaymentPage />} />

              {/* Owner / Agent */}
              <Route path="/dashboard/properties" element={<OwnerProperties />} />
              <Route path="/dashboard/properties/add" element={<AddPropertyPage />} />
              <Route path="/dashboard/properties/:id/edit" element={<EditPropertyPage />} />
              <Route path="/dashboard/earnings" element={<OwnerEarnings />} />

              {/* Admin / Super-Admin */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'super_admin']} />}>
                <Route path="/dashboard/users" element={<AdminUsers />} />
                <Route path="/dashboard/reports" element={<AdminReports />} />
              </Route>
              <Route path="/dashboard/complaints" element={<ComplaintsPage />} />

              {/* Super-Admin only */}
              <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
                <Route path="/dashboard/activity-logs" element={<ActivityLogsPage />} />
                <Route path="/dashboard/super-admin/settings" element={<SuperAdminSettings />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  )
}
