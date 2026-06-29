import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
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
import { AdminUsers } from '@/pages/dashboard/admin/AdminUsers'
import { AdminReports } from '@/pages/dashboard/admin/AdminReports'
import { SuperAdminCms } from '@/pages/dashboard/super-admin/SuperAdminCms'
import { SuperAdminSettings } from '@/pages/dashboard/super-admin/SuperAdminSettings'
import { MessagesPage } from '@/pages/dashboard/MessagesPage'
import { NotificationsPage } from '@/pages/dashboard/NotificationsPage'
import { ReviewsPage } from '@/pages/dashboard/ReviewsPage'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
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
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/dashboard/bookings" element={<TenantBookings />} />
            <Route path="/dashboard/favorites" element={<TenantFavorites />} />
            <Route path="/dashboard/properties" element={<OwnerProperties />} />
            <Route path="/dashboard/earnings" element={<OwnerEarnings />} />
            <Route path="/dashboard/users" element={<AdminUsers />} />
            <Route path="/dashboard/reports" element={<AdminReports />} />
            <Route path="/dashboard/cms" element={<SuperAdminCms />} />
            <Route path="/dashboard/settings" element={<SuperAdminSettings />} />
            <Route path="/dashboard/messages" element={<MessagesPage />} />
            <Route path="/dashboard/notifications" element={<NotificationsPage />} />
            <Route path="/dashboard/reviews" element={<ReviewsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  )
}
