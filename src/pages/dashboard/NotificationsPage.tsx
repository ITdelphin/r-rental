import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ListSkeleton } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import { Bell, CheckCheck, Trash2, Info, CheckCircle, AlertTriangle, XCircle, RotateCcw, Archive } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { Notification } from '@/types'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const typeConfig: Record<string, { icon: typeof Info; color: string }> = {
  info: { icon: Info, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' },
  success: { icon: CheckCircle, color: 'bg-green-100 text-green-600 dark:bg-green-900/30' },
  warning: { icon: AlertTriangle, color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' },
  error: { icon: XCircle, color: 'bg-red-100 text-red-600 dark:bg-red-900/30' },
}

export function NotificationsPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Tabs: 'inbox' | 'trash'
  const [activeTab, setActiveTab] = useState<'inbox' | 'trash'>('inbox')
  const [trashNotifications, setTrashNotifications] = useState<any[]>([])

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      setNotifications((data || []) as unknown as Notification[])
    } catch {
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }, [user])

  const fetchTrashNotifications = useCallback(() => {
    if (!user) return
    const archiveKey = `deleted_notifs_${user.id}`
    const data = JSON.parse(localStorage.getItem(archiveKey) || '[]')
    setTrashNotifications(data)
  }, [user])

  useEffect(() => {
    fetchNotifications()
    fetchTrashNotifications()

    const handleNotifReload = () => {
      fetchNotifications()
      fetchTrashNotifications()
    }
    window.addEventListener('notification-changed', handleNotifReload)
    return () => {
      window.removeEventListener('notification-changed', handleNotifReload)
    }
  }, [fetchNotifications, fetchTrashNotifications])

  // Mark all inbox notifications as read on view
  useEffect(() => {
    if (!user || notifications.length === 0 || activeTab !== 'inbox') return
    const unreadIds = notifications.filter(n => !n.is_read)
    if (unreadIds.length === 0) return
    supabase.from('notifications').update({ is_read: true } as never).eq('user_id', user.id).is('is_read', false).then(({ error }) => {
      if (!error) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        window.dispatchEvent(new CustomEvent('notification-changed'))
      }
    })
  }, [user, notifications, activeTab])

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const markAllRead = async () => {
    if (!user) return
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true } as never)
        .eq('user_id', user.id)
        .is('is_read', false)
      if (error) throw error
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      toast.success(t('all_marked_as_read'))
      window.dispatchEvent(new CustomEvent('notification-changed'))
    } catch {
      toast.error(t('failed_to_mark_as_read'))
    }
  }

  const deleteNotification = async (notif: Notification) => {
    try {
      // Store in trash archive under user
      if (user) {
        const archiveKey = `deleted_notifs_${user.id}`
        const currentArchive = JSON.parse(localStorage.getItem(archiveKey) || '[]')
        if (!currentArchive.some((n: any) => n.id === notif.id)) {
          const archivedItem = {
            ...notif,
            deleted_at: new Date().toISOString()
          }
          localStorage.setItem(archiveKey, JSON.stringify([archivedItem, ...currentArchive]))
        }
      }

      const { error } = await supabase.from('notifications').delete().eq('id', notif.id)
      if (error) throw error

      setNotifications((prev) => prev.filter((n) => n.id !== notif.id))
      window.dispatchEvent(new CustomEvent('notification-changed'))
      toast.success(t('notification_moved_trash', 'Notification moved to Trash'))
    } catch {
      toast.error(t('failed_to_delete_notification'))
    }
  }

  const restoreNotification = async (notif: any) => {
    if (!user) return
    try {
      const { error } = await supabase.from('notifications').insert({
        user_id: notif.user_id,
        title: notif.title,
        body: notif.body,
        type: notif.type,
        is_read: true,
      } as never)
      if (error) throw error

      const archiveKey = `deleted_notifs_${user.id}`
      const updated = trashNotifications.filter((n) => n.id !== notif.id)
      localStorage.setItem(archiveKey, JSON.stringify(updated))
      setTrashNotifications(updated)

      window.dispatchEvent(new CustomEvent('notification-changed'))
      toast.success(t('notification_restored', 'Notification restored to Inbox'))
    } catch {
      toast.error(t('failed_to_restore_notification', 'Failed to restore notification'))
    }
  }

  const deletePermanently = (id: string) => {
    if (!user) return
    const archiveKey = `deleted_notifs_${user.id}`
    const updated = trashNotifications.filter((n) => n.id !== id)
    localStorage.setItem(archiveKey, JSON.stringify(updated))
    setTrashNotifications(updated)
    toast.success(t('permanent_delete_success', 'Notification deleted permanently'))
  }

  const emptyTrash = () => {
    if (!user) return
    const archiveKey = `deleted_notifs_${user.id}`
    localStorage.removeItem(archiveKey)
    setTrashNotifications([])
    toast.success(t('trash_emptied', 'Trash emptied successfully'))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('notifications')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {unreadCount > 0 ? `${unreadCount} ${t('unread_notifications')}` : t('all_caught_up')}
          </p>
        </div>
        {activeTab === 'inbox' && unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4 mr-1.5" /> {t('mark_all_read')}
          </Button>
        )}
        {activeTab === 'trash' && trashNotifications.length > 0 && (
          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={emptyTrash}>
            <Trash2 className="h-4 w-4 mr-1.5" /> {t('empty_trash', 'Empty Trash')}
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 gap-4">
        <button
          onClick={() => setActiveTab('inbox')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 text-sm font-semibold border-b-2 transition-all cursor-pointer pb-2.5',
            activeTab === 'inbox'
              ? 'border-primary-505 text-primary-600 dark:text-primary-400 border-b-[3px]'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          )}
        >
          <Bell className="h-4 w-4" />
          {t('inbox', 'Inbox')}
          <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
            {notifications.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('trash')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 text-sm font-semibold border-b-2 transition-all cursor-pointer pb-2.5',
            activeTab === 'trash'
              ? 'border-primary-505 text-primary-600 dark:text-primary-400 border-b-[3px]'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          )}
        >
          <Archive className="h-4 w-4" />
          {t('trash', 'Trash')}
          <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
            {trashNotifications.length}
          </span>
        </button>
      </div>

      {activeTab === 'inbox' ? (
        loading ? (
          <ListSkeleton items={5} />
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={t('no_notifications')}
            description={t('no_notifications_description')}
          />
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => {
              const cfg = typeConfig[notif.type] || typeConfig.info
              const TypeIcon = cfg.icon
              return (
                <Card
                  key={notif.id}
                  className={`transition-all hover:border-primary-400 dark:hover:border-primary-600 ${notif.is_read
                      ? ''
                      : 'border-primary-300 bg-primary-50/50 dark:border-primary-700 dark:bg-primary-900/10'
                    }`}
                >
                  <CardContent className="flex items-start justify-between p-4 gap-4">
                    <div
                      className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer animate-fade-in"
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('open-notification', { detail: notif }))
                      }}
                    >
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${cfg.color}`}>
                        <TypeIcon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{notif.title}</h3>
                          {!notif.is_read && <div className="h-2 w-2 shrink-0 rounded-full bg-primary-600 animate-pulse" />}
                        </div>
                        <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{notif.body}</p>
                        <p className="mt-1 text-xs text-gray-400">
                          {new Date(notif.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0 text-gray-450 hover:text-red-500" onClick={() => deleteNotification(notif)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )
      ) : (
        trashNotifications.length === 0 ? (
          <EmptyState
            icon={Archive}
            title={t('trash_empty', 'Trash is Empty')}
            description={t('trash_empty_desc', 'Deleted notifications will appear here. You can inspect or restore them.')}
          />
        ) : (
          <div className="space-y-3">
            {trashNotifications.map((notif) => {
              const cfg = typeConfig[notif.type] || typeConfig.info
              const TypeIcon = cfg.icon
              return (
                <Card
                  key={notif.id}
                  className="border-gray-200 dark:border-gray-800 opacity-80 hover:opacity-100 transition-all"
                >
                  <CardContent className="flex items-start justify-between p-4 gap-4 bg-gray-50/30 dark:bg-gray-900/10">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg grayscale opacity-60", cfg.color)}>
                        <TypeIcon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{notif.title}</h3>
                        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{notif.body}</p>
                        <p className="mt-1 text-xs text-gray-450 flex flex-wrap gap-2">
                          <span>{t('original_date', 'Sent')}: {new Date(notif.created_at).toLocaleDateString()}</span>
                          {notif.deleted_at && (
                            <>
                              <span>&bull;</span>
                              <span className="text-red-500">{t('deleted_at', 'Deleted')}: {new Date(notif.deleted_at).toLocaleDateString()}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" title={t('restore', 'Restore')} className="text-gray-450 hover:text-green-500" onClick={() => restoreNotification(notif)}>
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title={t('delete_permanently', 'Delete Permanently')} className="text-gray-450 hover:text-red-650" onClick={() => deletePermanently(notif.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )
      )}
    </div>
  )
}
