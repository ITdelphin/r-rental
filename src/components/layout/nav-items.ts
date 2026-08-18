import { LayoutDashboard, Building2, Calendar, Heart, MessageSquare, Settings, Plus, FileText, CreditCard, Wrench, BarChart3, Star, Users, Shield, Activity, ClipboardList } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  key: string
  icon: LucideIcon
  roles?: string[]
}

export const tenantNav: NavItem[] = [
  { to: '/dashboard', key: 'dashboard', icon: LayoutDashboard },
  { to: '/dashboard/bookings', key: 'my_bookings', icon: Calendar },
  { to: '/dashboard/applications', key: 'applications', icon: ClipboardList },
  { to: '/dashboard/favorites', key: 'my_favorites', icon: Heart },
  { to: '/dashboard/contracts', key: 'contracts', icon: FileText },
  { to: '/dashboard/payments', key: 'payments', icon: CreditCard },
  { to: '/dashboard/maintenance', key: 'maintenance', icon: Wrench },
  { to: '/dashboard/messages', key: 'messages', icon: MessageSquare },
  { to: '/dashboard/reviews', key: 'reviews', icon: Star },
  { to: '/dashboard/settings', key: 'settings', icon: Settings },
]

export const ownerNav: NavItem[] = [
  { to: '/dashboard', key: 'dashboard', icon: LayoutDashboard },
  { to: '/dashboard/properties', key: 'my_properties', icon: Building2 },
  { to: '/dashboard/properties/add', key: 'add_property', icon: Plus },
  { to: '/dashboard/bookings', key: 'my_bookings', icon: Calendar },
  { to: '/dashboard/applications', key: 'applications', icon: ClipboardList },
  { to: '/dashboard/contracts', key: 'contracts', icon: FileText },
  { to: '/dashboard/payments', key: 'payments', icon: CreditCard },
  { to: '/dashboard/maintenance', key: 'maintenance', icon: Wrench },
  { to: '/dashboard/earnings', key: 'earnings', icon: BarChart3 },
  { to: '/dashboard/messages', key: 'messages', icon: MessageSquare },
  { to: '/dashboard/reviews', key: 'reviews', icon: Star },
  { to: '/dashboard/settings', key: 'settings', icon: Settings },
]

export const adminNav: NavItem[] = [
  { to: '/dashboard', key: 'dashboard', icon: LayoutDashboard },
  { to: '/dashboard/users', key: 'users', icon: Users },
  { to: '/dashboard/properties', key: 'properties', icon: Building2 },
  { to: '/dashboard/bookings', key: 'my_bookings', icon: Calendar },
  { to: '/dashboard/applications', key: 'applications', icon: ClipboardList },
  { to: '/dashboard/contracts', key: 'contracts', icon: FileText },
  { to: '/dashboard/payments', key: 'payments', icon: CreditCard },
  { to: '/dashboard/maintenance', key: 'maintenance', icon: Wrench },
  { to: '/dashboard/reports', key: 'reports', icon: BarChart3 },
  { to: '/dashboard/complaints', key: 'complaints', icon: Shield },
  { to: '/dashboard/messages', key: 'messages', icon: MessageSquare },
  { to: '/dashboard/settings', key: 'settings', icon: Settings },
]

export const superAdminNav: NavItem[] = [
  { to: '/dashboard', key: 'dashboard', icon: LayoutDashboard },
  { to: '/dashboard/super-admin/settings', key: 'platform_settings', icon: Settings },
  { to: '/dashboard/users', key: 'users', icon: Users },
  { to: '/dashboard/properties', key: 'properties', icon: Building2 },
  { to: '/dashboard/bookings', key: 'all_bookings', icon: Calendar },
  { to: '/dashboard/applications', key: 'applications', icon: ClipboardList },
  { to: '/dashboard/contracts', key: 'contracts', icon: FileText },
  { to: '/dashboard/payments', key: 'payments', icon: CreditCard },
  { to: '/dashboard/reports', key: 'reports', icon: BarChart3 },
  { to: '/dashboard/complaints', key: 'complaints', icon: Shield },
  { to: '/dashboard/activity-logs', key: 'activity_logs', icon: Activity },
  { to: '/dashboard/messages', key: 'messages', icon: MessageSquare },
]

export function getNavItems(role?: string): NavItem[] {
  switch (role) {
    case 'super_admin':
      return superAdminNav
    case 'admin':
      return adminNav
    case 'owner':
    case 'agent':
      return ownerNav
    default:
      return tenantNav
  }
}