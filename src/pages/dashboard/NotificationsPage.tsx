import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ListSkeleton } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import { Bell, CheckCheck, Trash2, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { Notification } from '@/types'
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

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  useEffect(() => {
    if (!user || notifications.length === 0) return
    const unreadIds = notifications.filter(n => !n.is_read)
    if (unreadIds.length === 0) return
    supabase.from('notifications').update({ is_read: true } as never).eq('user_id', user.id).is('is_read', false).then(({ error }) => {
      if (!error) setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    })
  }, [user, notifications.length > 0])

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
    } catch {
      toast.error(t('failed_to_mark_as_read'))
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase.from('notifications').delete().eq('id', id)
      if (error) throw error
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch {
      toast.error(t('failed_to_delete_notification'))
    }
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
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4" /> {t('mark_all_read')}
          </Button>
        )}
      </div>

      {loading ? (
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
                className={`transition-colors ${
                  notif.is_read
                    ? ''
                    : 'border-primary-300 bg-primary-50/50 dark:border-primary-700 dark:bg-primary-900/10'
                }`}
              >
                <CardContent className="flex items-start justify-between p-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${cfg.color}`}>
                      <TypeIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{notif.title}</h3>
                        {!notif.is_read && <div className="h-2 w-2 shrink-0 rounded-full bg-primary-600" />}
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">{notif.body}</p>
                      <p className="mt-1 text-xs text-gray-400">{new Date(notif.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0 text-gray-400 hover:text-red-500" onClick={() => deleteNotification(notif.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
