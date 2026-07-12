import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import { HomePage } from '@/pages/public/HomePage'
import { AboutPage } from '@/pages/public/AboutPage'
import { ContactPage } from '@/pages/public/ContactPage'
import { FaqPage } from '@/pages/public/FaqPage'
import { PrivacyPage } from '@/pages/public/PrivacyPage'
import { TermsPage } from '@/pages/public/TermsPage'
import { PropertiesPage } from '@/pages/public/PropertiesPage'
import { PropertyDetailPage } from '@/pages/public/PropertyDetailPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { DashboardHome } from '@/pages/dashboard/DashboardHome'
import { TenantBookings } from '@/pages/dashboard/tenant/TenantBookings'
import { TenantFavorites } from '@/pages/dashboard/tenant/TenantFavorites'
import { OwnerProperties } from '@/pages/dashboard/owner/OwnerProperties'
import { OwnerEarnings } from '@/pages/dashboard/owner/OwnerEarnings'
import { AddPropertyPage } from '@/pages/dashboard/owner/AddPropertyPage'
import { EditPropertyPage } from '@/pages/dashboard/owner/EditPropertyPage'
import { AdminUsers } from '@/pages/dashboard/admin/AdminUsers'
import { AdminReports } from '@/pages/dashboard/admin/AdminReports'
import { SuperAdminSettings } from '@/pages/dashboard/super-admin/SuperAdminSettings'
import { AccountSettingsPage } from '@/pages/dashboard/AccountSettingsPage'
import { MessagesPage } from '@/pages/dashboard/MessagesPage'
import { NotificationsPage } from '@/pages/dashboard/NotificationsPage'
import { ReviewsPage } from '@/pages/dashboard/ReviewsPage'
import { ComplaintsPage } from '@/pages/dashboard/ComplaintsPage'
import { ActivityLogsPage } from '@/pages/dashboard/ActivityLogsPage'

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
        </Route>

        {/* Auth routes */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected dashboard routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            {/* Common */}
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/dashboard/account" element={<AccountSettingsPage />} />
            <Route path="/dashboard/messages" element={<MessagesPage />} />
            <Route path="/dashboard/notifications" element={<NotificationsPage />} />
            <Route path="/dashboard/reviews" element={<ReviewsPage />} />

            {/* Tenant */}
            <Route path="/dashboard/bookings" element={<TenantBookings />} />
            <Route path="/dashboard/favorites" element={<TenantFavorites />} />

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
              <Route path="/dashboard/settings" element={<SuperAdminSettings />} />
              <Route path="/dashboard/activity-logs" element={<ActivityLogsPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  )
}
