import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/ui/loading'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface ProtectedRouteProps {
  allowedRoles?: string[]
  showAccessDenied?: boolean
}

export function ProtectedRoute({ allowedRoles, showAccessDenied = true }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()
  const { t } = useTranslation()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />
  }

  if (profile?.is_suspended) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
          <ShieldAlert className="h-8 w-8 text-amber-600 dark:text-amber-400" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('account_suspended', 'Account Suspended')}
        </h1>
        <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
          {t('account_suspended_description', 'Your account has been suspended. Please contact support for assistance.')}
        </p>
        <Link to="/" className="mt-6">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t('back_to_home', 'Back to Home')}
          </Button>
        </Link>
      </div>
    )
  }

  if (allowedRoles && (!profile || !allowedRoles.includes(profile.role))) {
    if (!showAccessDenied) {
      return <Navigate to="/dashboard" replace />
    }

    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <ShieldAlert className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('access_denied', 'Access Denied')}
        </h1>
        <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
          {t('access_denied_description', 'You do not have permission to access this page. Your current role does not include the required permissions.')}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          {t('your_role', 'Your role')}: <span className="font-medium capitalize">{profile?.role?.replace('_', ' ')}</span>
        </p>
        <Link to="/dashboard" className="mt-6">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t('back_to_dashboard', 'Back to Dashboard')}
          </Button>
        </Link>
      </div>
    )
  }

  return <Outlet />
}
