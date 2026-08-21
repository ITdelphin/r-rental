import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home, Bell, LogOut, Menu, X, ChevronRight, MessageSquare, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { BrandLogo } from '@/components/ui/brand-logo'
import { getNavItems } from '@/components/layout/nav-items'
import toast from 'react-hot-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function DashboardLayout() {
  const { t } = useTranslation()
  const { profile, user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unreadNotifs, setUnreadNotifs] = useState(0)
  const [activeNotif, setActiveNotif] = useState<any | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return
    const { count } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('is_read', false)
    setUnreadNotifs(count ?? 0)
  }, [user])

  useEffect(() => {
    if (!user) return
    fetchUnreadCount()

    const channel = supabase.channel(`notifs-${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        fetchUnreadCount()
        window.dispatchEvent(new CustomEvent('notification-changed'))

        if (payload.eventType === 'INSERT') {
          const newNotif = payload.new;
          toast.custom((t) => (
            <div
              className={cn(
                t.visible ? 'animate-in fade-in slide-in-from-top-5 duration-300' : 'animate-out fade-out slide-out-to-top-5 duration-200',
                'max-w-md w-full bg-white dark:bg-gray-800 shadow-xl rounded-xl pointer-events-auto flex border border-gray-105 dark:border-gray-700 overflow-hidden cursor-pointer'
              )}
              onClick={() => {
                toast.dismiss(t.id)
                window.dispatchEvent(new CustomEvent('open-notification', { detail: newNotif }))
              }}
            >
              <div className="flex-1 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <div className="h-10 w-10 rounded-lg bg-primary-105 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold">
                      <Bell className="h-5 w-5 animate-pulse" />
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 animate-pulse">
                      {newNotif.title}
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {newNotif.body}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ), { duration: 10000 })
        }
      })
      .subscribe()

    const handleNotifChange = () => fetchUnreadCount()
    window.addEventListener('notification-changed', handleNotifChange)

    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener('notification-changed', handleNotifChange)
    }
  }, [user, fetchUnreadCount])

  useEffect(() => {
    const handleOpenNotif = async (e: Event) => {
      const customEvent = e as CustomEvent
      const notif = customEvent.detail
      if (!notif) return

      setActiveNotif(notif)
      setModalOpen(true)

      if (!user) return

      try {
        // Move to archive in localStorage
        const archiveKey = `deleted_notifs_${user.id}`
        const currentArchive = JSON.parse(localStorage.getItem(archiveKey) || '[]')
        if (!currentArchive.some((n: any) => n.id === notif.id)) {
          const archivedItem = {
            ...notif,
            deleted_at: new Date().toISOString()
          }
          localStorage.setItem(archiveKey, JSON.stringify([archivedItem, ...currentArchive]))
        }

        await supabase.from('notifications').delete().eq('id', notif.id)
        fetchUnreadCount()
        window.dispatchEvent(new CustomEvent('notification-changed'))
      } catch (err) {
        console.error('Failed to delete notification:', err)
      }
    }

    if (user) {
      window.addEventListener('open-notification', handleOpenNotif)
    }
    return () => {
      window.removeEventListener('open-notification', handleOpenNotif)
    }
  }, [user, fetchUnreadCount])

  const navItems = getNavItems(profile?.role)

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
          <BrandLogo variant="sidebar" />
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 cursor-pointer"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex items-center gap-3 border-b px-4 py-4 dark:border-gray-700">
          <Avatar>
            {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} /> : null}
            <AvatarFallback>{profile?.full_name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <p className="font-medium text-gray-900 dark:text-gray-100">{profile?.full_name || t('user')}</p>
            <p className="text-gray-500 dark:text-gray-400 capitalize">{profile?.role || t('user')}</p>
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
              {t(item.key)}
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
            <span className="capitalize">{location.pathname.split('/').pop() || t('dashboard')}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/dashboard/notifications" className="relative p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <Bell className="h-5 w-5" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadNotifs > 9 ? '9+' : unreadNotifs}
                </span>
              )}
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

      {/* Notification Detail Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className={cn(
                'p-2.5 rounded-xl flex items-center justify-center shrink-0',
                activeNotif?.type === 'success' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                  activeNotif?.type === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                    activeNotif?.type === 'error' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
              )}>
                {activeNotif?.type === 'success' ? <CheckCircle className="h-5 w-5" /> :
                  activeNotif?.type === 'warning' ? <AlertTriangle className="h-5 w-5" /> :
                    activeNotif?.type === 'error' ? <XCircle className="h-5 w-5" /> :
                      <Info className="h-5 w-5" />}
              </div>
              <DialogTitle className="text-base font-bold text-gray-900 dark:text-gray-50">{activeNotif?.title}</DialogTitle>
            </div>
          </DialogHeader>
          <div className="py-4 text-sm text-gray-600 dark:text-gray-305 whitespace-pre-wrap leading-relaxed">
            {activeNotif?.body}
            {activeNotif?.created_at && (
              <p className="mt-3 text-xs text-gray-400">
                {new Date(activeNotif.created_at).toLocaleString()}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setModalOpen(false)} className="w-full sm:w-auto">
              {t('close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

