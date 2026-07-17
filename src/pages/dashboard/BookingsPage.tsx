import { useAuth } from '@/hooks/useAuth'
import { TenantBookings } from './tenant/TenantBookings'
import { OwnerBookings } from './owner/OwnerBookings'
import { AdminBookings } from './admin/AdminBookings'

export function BookingsPage() {
  const { profile, loading } = useAuth()

  if (loading) return null

  const role = profile?.role
  if (role === 'super_admin' || role === 'admin') {
    return <AdminBookings />
  }
  if (role === 'owner' || role === 'agent') {
    return <OwnerBookings />
  }
  return <TenantBookings />
}
