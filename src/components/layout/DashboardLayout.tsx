import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, Building2, Calendar, Heart, MessageSquare, Bell, Settings, LogOut, Menu, X, ChevronRight, Home, Users, BarChart3, FileText, Shield } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
  roles?: string[]
}

const tenantNav: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/dashboard/bookings', label: 'My Bookings', icon: Calendar },
  { to: '/dashboard/favorites', label: 'Favorites', icon: Heart },
  { to: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
  { to: '/dashboard/reviews', label: 'Reviews', icon: FileText },
  { to: '/dashboard/account', label: 'Account Settings', icon: Settings },
]

const ownerNav: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/dashboard/properties', label: 'My Properties', icon: Building2 },
  { to: '/dashboard/bookings', label: 'Bookings', icon: Calendar },
  { to: '/dashboard/earnings', label: 'Earnings', icon: BarChart3 },
  { to: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
  { to: '/dashboard/reviews', label: 'Reviews', icon: FileText },
  { to: '/dashboard/account', label: 'Account Settings', icon: Settings },
]

const adminNav: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/dashboard/users', label: 'Users', icon: Users },
  { to: '/dashboard/properties', label: 'Properties', icon: Building2 },
  { to: '/dashboard/bookings', label: 'Bookings', icon: Calendar },
  { to: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
  { to: '/dashboard/complaints', label: 'Complaints', icon: Shield },
  { to: '/dashboard/account', label: 'Account Settings', icon: Settings },
]

const superAdminNav: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/dashboard/users', label: 'Users', icon: Users },
  { to: '/dashboard/properties', label: 'Properties', icon: Building2 },
  { to: '/dashboard/bookings', label: 'Bookings', icon: Calendar },
  { to: '/dashboard/reports', label: 'Reports', icon: FileText },
  { to: '/dashboard/cms', label: 'CMS', icon: FileText },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
  { to: '/dashboard/activity-logs', label: 'Activity Logs', icon: Shield },
  { to: '/dashboard/account', label: 'Account Settings', icon: Settings },
]

export function DashboardLayout() {
  const { t } = useTranslation()
  const { profile, user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const getNavItems = () => {
    switch (profile?.role) {
      case 'super_admin': return superAdminNav
      case 'admin': return adminNav
      case 'owner': return ownerNav
      case 'agent': return ownerNav
      default: return tenantNav
    }
  }

  const navItems = getNavItems()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-white transition-transform dark:bg-gray-900 dark:border-gray-700 lg:static lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex h-16 items-center justify-between border-b px-4 dark:border-gray-700">
          <Link to="/" className="flex items-center gap-2 font-bold text-primary-600">
            <Home className="h-5 w-5" />
            {t('app_name')}
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 cursor-pointer"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex items-center gap-3 border-b px-4 py-4 dark:border-gray-700">
          <Avatar>
            {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} /> : null}
            <AvatarFallback>{profile?.full_name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <p className="font-medium text-gray-900 dark:text-gray-100">{profile?.full_name || 'User'}</p>
            <p className="text-gray-500 dark:text-gray-400 capitalize">{profile?.role || 'User'}</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                location.pathname === item.to
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t p-4 dark:border-gray-700 space-y-2">
          <button onClick={() => navigate('/')} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 cursor-pointer">
            <Home className="h-4 w-4" /> {t('home')}
          </button>
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 cursor-pointer">
            <LogOut className="h-4 w-4" /> {t('logout')}
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 dark:bg-gray-900 dark:border-gray-700">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1 cursor-pointer">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <ChevronRight className="h-4 w-4" />
            <span className="capitalize">{location.pathname.split('/').pop() || 'Dashboard'}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/dashboard/notifications" className="relative p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <Bell className="h-5 w-5" />
            </Link>
            <Link to="/dashboard/messages" className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <MessageSquare className="h-5 w-5" />
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}
    </div>
  )
}
